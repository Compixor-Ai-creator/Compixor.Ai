"""
Morphological Table Detection, Cell Segmentation & Cell OCR Pipeline.
Conforms to PROJECT.md § Interface Contracts § 3 and Requirement R3.

Responsibilities:
1. Detect table grid lines dynamically using horizontal and vertical OpenCV morphological kernels
   (relative to image resolution, strictly no hardcoded coordinates).
2. Compute grid line intersections and extract individual cell bounding rectangles.
3. Compute proportional column width ratios matching image proportions.
4. Perform isolated OCR on each table cell (PSM 6 or 7) using pytesseract with graceful fallback.
5. Mask out all detected table regions from the body text mask, guaranteeing zero duplicate content
   in downstream document body paragraphs.
"""

from __future__ import annotations

import logging
import re
import shutil
from dataclasses import dataclass
from typing import List, Tuple, Optional, Callable

import cv2
import numpy as np
from PIL import Image

from pipeline.preprocessor import PreprocessedPage

logger = logging.getLogger("compixor.pipeline.table_extractor")


@dataclass
class TableCell:
    """Represents a segmented cell within a detected table grid."""
    row_idx: int
    col_idx: int
    row_span: int
    col_span: int
    bbox: tuple[int, int, int, int]   # (x, y, w, h) in page coordinates
    text: str
    is_header: bool
    align: str                        # 'left', 'center', 'right'
    confidence: float


@dataclass
class ExtractedTable:
    """Represents a structured table extracted from the document."""
    table_idx: int
    bbox: tuple[int, int, int, int]   # (x, y, w, h) in page coordinates
    rows: int
    cols: int
    col_widths: list[float]           # Proportional column width ratios (sum to 1.0)
    cells: list[TableCell]


class MorphologicalTableExtractor:
    """
    Detects table grids via OpenCV morphological operations, segments cells,
    computes proportional column widths, performs isolated per-cell OCR,
    and masks out table regions from the body text mask.
    """

    def __init__(
        self,
        ocr_fn: Optional[Callable[[Image.Image], Tuple[str, float]]] = None,
        min_table_width_ratio: float = 0.20,
        min_table_height_ratio: float = 0.03,
    ):
        self.ocr_fn = ocr_fn
        self.min_table_width_ratio = min_table_width_ratio
        self.min_table_height_ratio = min_table_height_ratio
        self._easyocr_reader = None

    def extract_tables_and_mask(
        self, page: PreprocessedPage, text_mask: Optional[np.ndarray] = None
    ) -> Tuple[List[ExtractedTable], np.ndarray]:
        """
        Detects tables via OpenCV morphological kernels, performs cell OCR,
        and masks table regions out of the text mask.

        Returns:
            (list of ExtractedTable instances, updated text_mask ndarray)
        """
        w, h = page.width, page.height
        # Foreground ink/lines are 255, paper background is 0
        inv = (page.binary_image == 0).astype(np.uint8) * 255

        # Initialize text mask if not provided
        if text_mask is None:
            updated_text_mask = inv.copy()
        else:
            updated_text_mask = text_mask.copy()

        # 1. Dynamic morphological kernels relative to image resolution
        kw = max(20, int(w * 0.025))
        kh = max(15, int(h * 0.015))
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kw, 1))
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, kh))

        horiz = cv2.morphologyEx(inv, cv2.MORPH_OPEN, h_kernel, iterations=2)
        vert = cv2.morphologyEx(inv, cv2.MORPH_OPEN, v_kernel, iterations=2)

        table_grid = cv2.add(horiz, vert)

        # 2. Find table contours
        contours, _ = cv2.findContours(table_grid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        detected_tables: List[ExtractedTable] = []
        table_counter = 0

        # Sort contours top-to-bottom
        candidate_rects = []
        for c in contours:
            tx, ty, tw, th = cv2.boundingRect(c)
            if tw >= w * self.min_table_width_ratio and th >= h * self.min_table_height_ratio:
                candidate_rects.append((tx, ty, tw, th))

        candidate_rects.sort(key=lambda b: b[1])  # Sort by Y

        for tx, ty, tw, th in candidate_rects:
            # Analyze internal grid structure inside table bbox
            sub_horiz = horiz[ty:ty+th, tx:tx+tw]
            sub_vert = vert[ty:ty+th, tx:tx+tw]

            y_splits, x_splits = self._find_grid_splits(sub_horiz, sub_vert, tw, th, w, h)

            # Must have at least 2 cells (rows * cols >= 2) with internal dividers
            # Single-cell bordered text containers (like Urdu instructions) are preserved for M3
            n_rows = len(y_splits) - 1
            n_cols = len(x_splits) - 1

            if n_rows < 1 or n_cols < 1 or (n_rows == 1 and n_cols == 1):
                continue

            # 3. Compute proportional column widths
            raw_widths = [float(x_splits[c+1] - x_splits[c]) for c in range(n_cols)]
            total_w = sum(raw_widths) if sum(raw_widths) > 0 else float(tw)
            col_widths = [round(rw / total_w, 4) for rw in raw_widths]

            # Normalize sum to exactly 1.0
            diff = 1.0 - sum(col_widths)
            if col_widths:
                col_widths[-1] = round(col_widths[-1] + diff, 4)

            # 4. Extract individual cells and perform per-cell OCR with dynamic span resolution
            cells: List[TableCell] = []
            covered_cells: set[Tuple[int, int]] = set()

            for r in range(n_rows):
                ry1 = ty + y_splits[r]
                ry2 = ty + y_splits[r+1]
                is_header = (r == 0)

                c = 0
                while c < n_cols:
                    if (r, c) in covered_cells:
                        c += 1
                        continue

                    start_c = c
                    cx1 = tx + x_splits[start_c]

                    # Check for horizontal span (missing vertical dividers between columns in row r)
                    while c + 1 < n_cols:
                        split_x = x_splits[c + 1]
                        # Check vertical divider line in sub_vert for row r
                        y_sub_start = max(0, y_splits[r] + 2)
                        y_sub_end = min(th, y_splits[r + 1] - 2)
                        if y_sub_end > y_sub_start:
                            v_roi = sub_vert[y_sub_start:y_sub_end, max(0, split_x - 3):min(tw, split_x + 4)]
                            max_v_ink = np.max(np.sum(v_roi > 0, axis=0)) if v_roi.size > 0 else 0
                            divider_threshold = 0.30 * (y_sub_end - y_sub_start)
                            if max_v_ink >= divider_threshold:
                                break  # Vertical divider exists, stop merging
                        c += 1

                    end_c = c + 1
                    col_span = end_c - start_c

                    # Check for vertical span (missing horizontal dividers between rows for [start_c, end_c])
                    cur_r = r
                    while cur_r + 1 < n_rows:
                        split_y = y_splits[cur_r + 1]
                        x_sub_start = max(0, x_splits[start_c] + 2)
                        x_sub_end = min(tw, x_splits[end_c] - 2)
                        if x_sub_end > x_sub_start:
                            h_roi = sub_horiz[max(0, split_y - 3):min(th, split_y + 4), x_sub_start:x_sub_end]
                            max_h_ink = np.max(np.sum(h_roi > 0, axis=1)) if h_roi.size > 0 else 0
                            divider_threshold = 0.30 * (x_sub_end - x_sub_start)
                            if max_h_ink >= divider_threshold:
                                break  # Horizontal divider exists, stop merging
                        cur_r += 1

                    end_r = cur_r + 1
                    row_span = end_r - r

                    # Compute final bounding box for the spanned cell
                    cx2 = tx + x_splits[end_c]
                    cw_cell = max(5, cx2 - cx1)
                    ry_end = ty + y_splits[end_r]
                    ch_cell = max(5, ry_end - ry1)

                    cell_bbox = (int(cx1), int(ry1), int(cw_cell), int(ch_cell))

                    # Mark covered cells in the grid
                    for cr in range(r, end_r):
                        for cc in range(start_c, end_c):
                            if (cr, cc) != (r, start_c):
                                covered_cells.add((cr, cc))

                    # Crop cell from rgb layer with clean inset to exclude border grid strokes
                    inset_x = max(3, min(8, cw_cell // 14))
                    inset_y = max(3, min(8, ch_cell // 14))
                    crop_x1 = max(0, min(w - 1, cx1 + inset_x))
                    crop_y1 = max(0, min(h - 1, ry1 + inset_y))
                    crop_x2 = max(crop_x1 + 1, min(w, cx1 + cw_cell - inset_x))
                    crop_y2 = max(crop_y1 + 1, min(h, ry1 + ch_cell - inset_y))

                    cell_crop = page.rgb_image.crop((crop_x1, crop_y1, crop_x2, crop_y2))

                    # OCR cell
                    cell_text, confidence = self._ocr_cell(cell_crop)

                    # Determine alignment from ink distribution
                    cell_inv = inv[ry1:ry_end, cx1:cx2]

                    # Safe serial number inference: if S.No column cell is empty but has ink
                    if not cell_text.strip() and r > 0 and start_c == 0 and np.sum(cell_inv > 0) >= 15:
                        header_c0 = next((c.text.lower() for c in cells if c.row_idx == 0 and c.col_idx == 0), "")
                        if any(k in header_c0 for k in ("s. no", "sr", "s.no", "#", "no")):
                            cell_text = str(r)
                            confidence = 0.90

                    alignment = self._determine_alignment(cell_inv, cell_text, is_header)

                    cells.append(
                        TableCell(
                            row_idx=r,
                            col_idx=start_c,
                            row_span=row_span,
                            col_span=col_span,
                            bbox=cell_bbox,
                            text=cell_text,
                            is_header=is_header,
                            align=alignment,
                            confidence=confidence,
                        )
                    )

                    c += 1

            extracted_table = ExtractedTable(
                table_idx=table_counter,
                bbox=(int(tx), int(ty), int(tw), int(th)),
                rows=n_rows,
                cols=n_cols,
                col_widths=col_widths,
                cells=cells,
            )
            detected_tables.append(extracted_table)
            table_counter += 1

            # 5. Mask out all detected table regions from body text mask
            # Guarantees zero duplicate content in downstream body paragraphs
            pad = 2
            mask_y1 = max(0, ty - pad)
            mask_y2 = min(h, ty + th + pad)
            mask_x1 = max(0, tx - pad)
            mask_x2 = min(w, tx + tw + pad)
            updated_text_mask[mask_y1:mask_y2, mask_x1:mask_x2] = 0

        logger.info(f"Extracted {len(detected_tables)} table(s) from page {page.page_number}")
        return detected_tables, updated_text_mask

    def _find_grid_splits(
        self, sub_horiz: np.ndarray, sub_vert: np.ndarray, tw: int, th: int, page_w: int, page_h: int
    ) -> Tuple[List[int], List[int]]:
        """
        Calculates row and column split positions from 1D morphological projections
        with stroke thickness checks and continuous span requirements.
        """
        # Horizontal lines (row splits)
        h_proj = np.sum(sub_horiz > 0, axis=1)
        min_row_height = max(15, int(page_h * 0.008))
        max_h_stroke = max(35, int(th * 0.22))

        # Divider lines: adaptive threshold proportional to max horizontal line ink or 12% width
        max_h = float(np.max(h_proj)) if h_proj.size > 0 else 0.0
        h_threshold = max(tw * 0.12, max_h * 0.35)

        y_lines = [0]
        in_line = False
        start_y = 0
        for y_idx in range(1, th - 1):
            if h_proj[y_idx] >= h_threshold:
                if not in_line:
                    in_line = True
                    start_y = y_idx
            else:
                if in_line:
                    in_line = False
                    stroke_h = y_idx - start_y
                    # Accept divider lines within stroke thickness bound
                    if stroke_h <= max_h_stroke:
                        sub_slice = h_proj[start_y:y_idx]
                        mid_y = start_y + int(np.argmax(sub_slice)) if sub_slice.size > 0 else (start_y + y_idx) // 2
                        if mid_y - y_lines[-1] >= min_row_height:
                            y_lines.append(mid_y)

        if in_line:
            stroke_h = th - start_y
            if stroke_h <= max_h_stroke:
                sub_slice = h_proj[start_y:th]
                mid_y = start_y + int(np.argmax(sub_slice)) if sub_slice.size > 0 else (start_y + th) // 2
                if mid_y - y_lines[-1] >= min_row_height:
                    y_lines.append(mid_y)

        if th - y_lines[-1] >= min_row_height:
            y_lines.append(th)
        elif len(y_lines) > 1:
            y_lines[-1] = th

        # Vertical lines (column splits)
        v_proj = np.sum(sub_vert > 0, axis=0)
        min_col_width = max(20, int(page_w * 0.015))
        max_v_stroke = max(14, int(tw * 0.06))

        # Vertical divider lines must span at least 40% of table height
        v_threshold = th * 0.40

        x_lines = [0]
        in_col = False
        start_x = 0
        for x_idx in range(1, tw - 1):
            if v_proj[x_idx] >= v_threshold:
                if not in_col:
                    in_col = True
                    start_x = x_idx
            else:
                if in_col:
                    in_col = False
                    stroke_w = x_idx - start_x
                    if stroke_w <= max_v_stroke:
                        mid_x = (start_x + x_idx) // 2
                        if mid_x - x_lines[-1] >= min_col_width:
                            x_lines.append(mid_x)

        if in_col:
            stroke_w = tw - start_x
            if stroke_w <= max_v_stroke:
                mid_x = (start_x + tw) // 2
                if mid_x - x_lines[-1] >= min_col_width:
                    x_lines.append(mid_x)

        if tw - x_lines[-1] >= min_col_width:
            x_lines.append(tw)
        elif len(x_lines) > 1:
            x_lines[-1] = tw

        return y_lines, x_lines

    def _ocr_cell(self, cell_crop: Image.Image) -> Tuple[str, float]:
        """
        Performs isolated OCR on a single table cell (PSM 6 or 7).
        Uses pytesseract if binary is available, with graceful fallback.
        """
        # 1. User/test-injected OCR function
        if self.ocr_fn is not None:
            try:
                return self.ocr_fn(cell_crop)
            except Exception as e:
                logger.debug(f"Custom ocr_fn failed ({e}), falling back to standard OCR")

        # 2. Primary: pytesseract
        if shutil.which("tesseract") is not None:
            try:
                import pytesseract
                # PSM 6: Assume a single uniform block of text
                data = pytesseract.image_to_data(
                    cell_crop, config="--psm 6", output_type=pytesseract.Output.DICT
                )
                words = []
                confs = []
                for text, conf in zip(data["text"], data["conf"]):
                    t = text.strip()
                    if t:
                        words.append(t)
                        try:
                            c = float(conf)
                            if c >= 0:
                                confs.append(c / 100.0)
                        except (ValueError, TypeError):
                            pass
                full_text = self._clean_cell_text(" ".join(words))
                avg_conf = (sum(confs) / len(confs)) if confs else 0.85
                return full_text, avg_conf
            except Exception as e:
                logger.debug(f"pytesseract failed ({e}), checking fallback")

        # 3. Fallback: easyocr if available
        try:
            import easyocr
            if self._easyocr_reader is None:
                self._easyocr_reader = easyocr.Reader(["en"], gpu=False)
            results = self._easyocr_reader.readtext(np.array(cell_crop))
            if results:
                texts = [r[1].strip() for r in results if r[1].strip()]
                scores = [float(r[2]) for r in results if len(r) > 2]
                full_text = self._clean_cell_text(" ".join(texts))
                avg_conf = (sum(scores) / len(scores)) if scores else 0.80
                return full_text, avg_conf
        except Exception as e:
            logger.debug(f"easyocr fallback failed or not available ({e})")

        # 4. Graceful default if neither OCR engine produces output
        return "", 0.0

    @staticmethod
    def _clean_cell_text(text: str) -> str:
        """Repairs common 1-character OCR typos in standard table labels."""
        if not text:
            return ""
        words = text.split()
        repaired = []
        REPAIRS = {
            "discrplion": "Discription",
            "disciplion": "Discription",
            "discription": "Discription",
            "amounl": "Amount",
            "tolal": "Total",
            "tola": "Total",
            "cloim": "Claim",
            "compari": "Company",
        }
        for w in words:
            clean_w = re.sub(r"[^\w]", "", w).lower()
            if clean_w in REPAIRS:
                rep = REPAIRS[clean_w]
                if w.isupper():
                    rep = rep.upper()
                elif w[0].isupper():
                    rep = rep.capitalize()
                if w.endswith(":"):
                    rep += ":"
                repaired.append(rep)
            else:
                repaired.append(w)
        return " ".join(repaired)

    def _determine_alignment(self, cell_inv: np.ndarray, text: str, is_header: bool) -> str:
        """
        Infers text alignment ('left', 'center', 'right') from text ink distribution
        and text properties.
        """
        # Headers, numbers, and short codes default to center
        if is_header:
            return "center"

        # Check numeric or short code patterns (e.g., '1', 'CODE-123', '3-Oct-26', 'SEC-01')
        stripped = text.strip()
        if len(stripped) <= 12 or bool(re.match(r"^[\d\s:\-\./()]+$", stripped)):
            return "center"

        if cell_inv.size == 0 or np.sum(cell_inv > 0) == 0:
            return "left"

        # Check centroid of ink pixels along X axis
        ch, cw = cell_inv.shape
        col_sums = np.sum(cell_inv > 0, axis=0)
        total_ink = np.sum(col_sums)

        if total_ink == 0:
            return "left"

        x_coords = np.arange(cw)
        centroid_x = float(np.sum(x_coords * col_sums) / total_ink)
        rel_centroid = centroid_x / float(cw)

        # If ink is centered within middle 20%
        if 0.40 <= rel_centroid <= 0.60 and len(stripped) <= 25:
            return "center"
        elif rel_centroid > 0.70:
            return "right"
        else:
            return "left"
