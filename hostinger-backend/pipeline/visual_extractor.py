"""
Non-Text Visual Element Extraction Pipeline for Compixor Universal Document Engine.
Conforms to PROJECT.md § Interface Contracts § 2 and Requirement R4.

Responsibilities:
1. Segment visual non-text regions via contour topology, connected-component analysis,
   and morphological gradient filters (strictly no hardcoded coordinates or face cascades):
   - Student portrait photos (aspect ratio ~3:4 / 1:1, dense color/pixel variance, solid borders/boxes)
   - Institutional logos/crests (circular/shield topology, high edge density, complex nested contours)
   - 1D/2D barcodes (high vertical edge density, parallel stripe topology)
   - Signatures and rubber stamps (cursive stroke contours, thin stroke topology, disconnected paths)
2. Cleanly crop each detected asset from the high-resolution RGB layer (page.rgb_image).
3. Generate an updated binary text mask where all visual element regions are masked out (set to 0 / background)
   so OCR never produces stray glyphs (e.g., '£', 'Gy', '||||||').
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Tuple, Optional

import cv2
import numpy as np
from PIL import Image

from pipeline.preprocessor import PreprocessedPage

logger = logging.getLogger("compixor.pipeline.visual_extractor")


@dataclass
class ExtractedVisualElement:
    """Represents a segmented non-text visual asset cropped from the document."""
    element_type: str                 # 'photo', 'logo', 'barcode', 'signature', 'stamp'
    bbox: tuple[int, int, int, int]   # (x, y, w, h) in page coordinates
    crop_image: Image.Image           # Clean RGB crop
    confidence: float


class VisualElementExtractor:
    """
    Extracts non-text visual elements (photos, logos, barcodes, signatures, stamps)
    using contour topology, connected-component analysis, and morphological filters.
    """

    def __init__(
        self,
        min_element_dim: int = 20,
        enable_photo: bool = True,
        enable_logo: bool = True,
        enable_barcode: bool = True,
        enable_signature: bool = True,
    ):
        self.min_element_dim = min_element_dim
        self.enable_photo = enable_photo
        self.enable_logo = enable_logo
        self.enable_barcode = enable_barcode
        self.enable_signature = enable_signature

    def extract_and_mask(self, page: PreprocessedPage) -> Tuple[List[ExtractedVisualElement], np.ndarray]:
        """
        Extracts non-text elements via contour topology and returns:
        (1) list of ExtractedVisualElement instances
        (2) updated binary text mask with all visual element regions set to 0.
        """
        w, h = page.width, page.height
        rgb_np = np.array(page.rgb_image)
        gray = page.clahe_gray
        # Foreground ink is 255, white paper background is 0
        inv = (page.binary_image == 0).astype(np.uint8) * 255

        candidates: List[ExtractedVisualElement] = []

        # 1. Barcode Detection (1D & 2D)
        if self.enable_barcode:
            candidates.extend(self._detect_barcodes(page, rgb_np, gray, inv))

        # 2. Photo Detection (Portrait ID / Passport photos)
        if self.enable_photo:
            candidates.extend(self._detect_photos(page, rgb_np, gray, inv))

        # 3. Logo & Crest Detection (Emblems, shields, circular seals)
        if self.enable_logo:
            candidates.extend(self._detect_logos(page, gray, inv))

        # 4. Signature & Stamp Detection (Handwritten cursive strokes, rubber stamps)
        if self.enable_signature:
            candidates.extend(self._detect_signatures_and_stamps(page, rgb_np, gray, inv))

        # 5. Non-Maximum Suppression & Deduplication
        elements = self._filter_and_deduplicate(candidates, w, h)

        # 6. Generate updated binary text mask
        # text_mask: Foreground text ink = 255, background = 0.
        # Masked out visual elements: all pixels in their bbox set to 0.
        text_mask = inv.copy()
        for elem in elements:
            bx, by, bw, bh = elem.bbox
            # Add small safety padding (3px) clamped to page bounds
            pad = 3
            x1 = max(0, bx - pad)
            y1 = max(0, by - pad)
            x2 = min(w, bx + bw + pad)
            y2 = min(h, by + bh + pad)
            text_mask[y1:y2, x1:x2] = 0

        logger.info(f"Extracted {len(elements)} visual element(s) from page {page.page_number}")
        return elements, text_mask

    def _crop_rgb(self, page: PreprocessedPage, bbox: Tuple[int, int, int, int]) -> Image.Image:
        """Crops an RGB image from the high-resolution layer with bounds safety."""
        x, y, w, h = bbox
        x1 = max(0, min(page.width - 1, x))
        y1 = max(0, min(page.height - 1, y))
        x2 = max(x1 + 1, min(page.width, x + w))
        y2 = max(y1 + 1, min(page.height, y + h))
        return page.rgb_image.crop((x1, y1, x2, y2))

    def _detect_barcodes(
        self, page: PreprocessedPage, rgb_np: np.ndarray, gray: np.ndarray, inv: np.ndarray
    ) -> List[ExtractedVisualElement]:
        """
        Detects 1D and 2D barcodes using directional Sobel gradient response,
        stripe transition frequency analysis, and square module entropy.
        """
        w, h = page.width, page.height
        elements: List[ExtractedVisualElement] = []

        grad_x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)

        # -------------------------------------------------------------
        # 1. 1D Barcode Detection: Vertical gradients dominate horizontal gradients
        # -------------------------------------------------------------
        grad_diff = cv2.subtract(np.abs(grad_x), np.abs(grad_y))
        grad_diff = np.clip(grad_diff, 0, 255).astype(np.uint8)

        blurred = cv2.blur(grad_diff, (7, 7))
        _, thresh = cv2.threshold(blurred, 35, 255, cv2.THRESH_BINARY)

        kw = max(15, int(w * 0.018))
        kh = max(3, int(h * 0.004))
        k_close = cv2.getStructuringElement(cv2.MORPH_RECT, (kw, kh))
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, k_close)

        contours_1d, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in contours_1d:
            bx, by, bw, bh = cv2.boundingRect(c)
            # 1D barcode geometric properties: wide strip, moderate height
            if bw < w * 0.05 or bh < 12 or bw > w * 0.60 or bh > h * 0.15:
                continue

            aspect = bw / float(bh)
            if aspect < 1.5:
                continue

            # 1D barcodes require strong vertical dominant gradient and high stripe transitions
            crop_gray = gray[by:by+bh, bx:bx+bw]
            if crop_gray.shape[0] < 8 or crop_gray.shape[1] < 20:
                continue

            gx_c = cv2.Sobel(crop_gray, cv2.CV_32F, 1, 0, ksize=3)
            gy_c = cv2.Sobel(crop_gray, cv2.CV_32F, 0, 1, ksize=3)
            grad_ratio = float(np.mean(np.abs(gx_c))) / (float(np.mean(np.abs(gy_c))) + 1e-5)
            if grad_ratio < 2.2:
                continue

            mid_row = crop_gray[bh // 2, :]
            otsu_th = cv2.threshold(crop_gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[0]
            bin_slice = mid_row < otsu_th
            transitions = int(np.sum(np.diff(bin_slice.astype(int)) != 0))

            if transitions >= 45:
                crop_inv = inv[by:by+bh, bx:bx+bw]
                row_sums = np.sum(crop_inv > 0, axis=1)

                # Find contiguous vertical ink segments separated by white gaps
                # to prevent swallowing adjacent text labels or numbers
                segments = []
                seg_start = None
                for ry in range(bh):
                    if row_sums[ry] > bw * 0.05:
                        if seg_start is None:
                            seg_start = ry
                    else:
                        if seg_start is not None:
                            segments.append((seg_start, ry - 1))
                            seg_start = None
                if seg_start is not None:
                    segments.append((seg_start, bh - 1))

                # Choose the segment with highest ink and transition count (actual barcode bars)
                best_seg = None
                best_score = -1
                for s, e in segments:
                    seg_h = e - s + 1
                    if seg_h >= 10:
                        mid_y = (s + e) // 2
                        slice_bin = crop_gray[mid_y, :] < otsu_th
                        tr = int(np.sum(np.diff(slice_bin.astype(int)) != 0))
                        score = tr * 1000 + int(np.sum(row_sums[s:e+1]))
                        if tr >= 35 and score > best_score:
                            best_score = score
                            best_seg = (s, e)

                if best_seg is not None:
                    r_min, r_max = best_seg
                else:
                    valid_rows = np.where(row_sums > bw * 0.1)[0]
                    r_min = valid_rows[0] if len(valid_rows) > 0 else 0
                    r_max = valid_rows[-1] if len(valid_rows) > 0 else (bh - 1)

                col_sums = np.sum(crop_inv[r_min:r_max+1, :] > 0, axis=0)
                valid_cols = np.where(col_sums > (r_max - r_min + 1) * 0.1)[0]
                c_min = valid_cols[0] if len(valid_cols) > 0 else 0
                c_max = valid_cols[-1] if len(valid_cols) > 0 else (bw - 1)

                exact_bbox = (bx + c_min, by + r_min, max(10, c_max - c_min + 1), max(8, r_max - r_min + 1))
                conf = min(0.99, 0.70 + (transitions / 50.0) * 0.25)
                crop_img = self._crop_rgb(page, exact_bbox)
                elements.append(
                    ExtractedVisualElement(
                        element_type="barcode",
                        bbox=exact_bbox,
                        crop_image=crop_img,
                        confidence=conf,
                    )
                )

        # -------------------------------------------------------------
        # 2. 2D Barcode Detection (QR Codes, DataMatrix)
        # -------------------------------------------------------------
        grad_mag = np.clip(np.abs(grad_x) + np.abs(grad_y), 0, 255).astype(np.uint8)
        blurred_2d = cv2.blur(grad_mag, (7, 7))
        _, thresh_2d = cv2.threshold(blurred_2d, 40, 255, cv2.THRESH_BINARY)

        k_2d = cv2.getStructuringElement(cv2.MORPH_RECT, (max(9, int(w * 0.01)), max(9, int(h * 0.01))))
        closed_2d = cv2.morphologyEx(thresh_2d, cv2.MORPH_CLOSE, k_2d)

        contours_2d, _ = cv2.findContours(closed_2d, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in contours_2d:
            bx, by, bw, bh = cv2.boundingRect(c)
            if not (w * 0.04 <= bw <= w * 0.35 and h * 0.03 <= bh <= h * 0.35):
                continue

            aspect = bw / float(bh)
            # 2D codes have near-square aspect ratios (0.75 to 1.30)
            if not (0.75 <= aspect <= 1.30):
                continue

            crop_gray = gray[by:by+bh, bx:bx+bw]
            if crop_gray.shape[0] < 15 or crop_gray.shape[1] < 15:
                continue

            # Ensure region is not a colorful photo
            crop_rgb = rgb_np[by:by+bh, bx:bx+bw]
            color_std = float(np.std(crop_rgb, axis=2).mean())
            if color_std > 8.0:
                continue

            # 2D codes (QR, DataMatrix) must have balanced ink and not be an institutional logo in the top-left header
            # Institutional logos typically have intricate heraldry or circular symmetry, not square module finder patterns
            if by < h * 0.30 and bx < w * 0.35:
                # Top-left corner is reserved for institutional crest/logo
                continue

            edges = cv2.Canny(crop_gray, 50, 150)
            edge_density = float(np.mean(edges > 0))

            otsu_th = cv2.threshold(crop_gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[0]
            bin_crop = crop_gray < otsu_th
            ink_fill = float(np.mean(bin_crop))

            trans_x = int(np.sum(np.diff(bin_crop[bh // 2, :].astype(int)) != 0))
            trans_y = int(np.sum(np.diff(bin_crop[:, bw // 2].astype(int)) != 0))

            if edge_density > 0.05 and 0.20 <= ink_fill <= 0.80 and trans_x >= 8 and trans_y >= 8:
                crop_inv = inv[by:by+bh, bx:bx+bw]
                row_sums = np.sum(crop_inv > 0, axis=1)
                col_sums = np.sum(crop_inv > 0, axis=0)
                valid_rows = np.where(row_sums > bw * 0.05)[0]
                valid_cols = np.where(col_sums > bh * 0.05)[0]

                if len(valid_rows) > 0 and len(valid_cols) > 0:
                    r_min, r_max = valid_rows[0], valid_rows[-1]
                    c_min, c_max = valid_cols[0], valid_cols[-1]
                    exact_bbox = (bx + c_min, by + r_min, max(12, c_max - c_min + 1), max(12, r_max - r_min + 1))
                else:
                    exact_bbox = (bx, by, bw, bh)

                conf = min(0.98, 0.70 + min(trans_x, trans_y) * 0.02)
                crop_img = self._crop_rgb(page, exact_bbox)
                elements.append(
                    ExtractedVisualElement(
                        element_type="barcode",
                        bbox=exact_bbox,
                        crop_image=crop_img,
                        confidence=conf,
                    )
                )

        return elements

    def _detect_photos(
        self, page: PreprocessedPage, rgb_np: np.ndarray, gray: np.ndarray, inv: np.ndarray
    ) -> List[ExtractedVisualElement]:
        """
        Detects student portrait photos using aspect ratio (~3:4 or 1:1),
        dense color/pixel variance, and solid border topology.
        """
        w, h = page.width, page.height
        elements: List[ExtractedVisualElement] = []

        # Find external contours and connected components
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(inv)

        for i in range(1, num_labels):
            bx, by, bw, bh, area = stats[i]

            # Photo size bounds: typical ID portrait photo on 300 DPI page
            # Width ~5% to 35% of page, Height ~6% to 35% of page
            if not (w * 0.05 <= bw <= w * 0.35 and h * 0.06 <= bh <= h * 0.35):
                continue

            aspect = bw / float(bh)
            # Portrait ID photo aspect ratio is ~0.60 to 1.25 (e.g., 3:4 = 0.75 or 1:1 = 1.0)
            if not (0.55 <= aspect <= 1.25):
                continue

            crop_rgb = rgb_np[by:by+bh, bx:bx+bw]
            if crop_rgb.shape[0] < 10 or crop_rgb.shape[1] < 10:
                continue

            # Compute color variance across channels
            color_std = float(np.std(crop_rgb, axis=2).mean())
            # Compute overall grayscale pixel standard deviation
            pixel_std = float(np.std(crop_rgb))

            # Photos feature rich color/tone distributions (skin, hair, attire)
            # or dense grayscale pixel variance (> 45.0) in monochrome scans
            if color_std > 3.0 or pixel_std > 60.0:
                # Compute confidence score based on aspect ratio and variance
                aspect_score = 1.0 - abs(aspect - 0.75)  # Ideal 3:4 ratio = 0.75
                conf = min(0.99, max(0.65, 0.50 + 0.30 * aspect_score + 0.20 * min(1.0, color_std / 15.0)))
                bbox = (int(bx), int(by), int(bw), int(bh))
                crop_img = self._crop_rgb(page, bbox)
                elements.append(
                    ExtractedVisualElement(
                        element_type="photo",
                        bbox=bbox,
                        crop_image=crop_img,
                        confidence=conf,
                    )
                )

        return elements

    def _detect_logos(
        self, page: PreprocessedPage, gray: np.ndarray, inv: np.ndarray
    ) -> List[ExtractedVisualElement]:
        """
        Detects institutional crests, university emblems, and circular/shield/emblem logos
        using morphological closure, contour circularity/solidity, edge density, and spatial positioning.
        """
        w, h = page.width, page.height
        elements: List[ExtractedVisualElement] = []

        # Connect internal logo components (shield, ribbons, stars, inner emblem)
        k_size = max(9, int(w * 0.008))
        k = cv2.getStructuringElement(cv2.MORPH_RECT, (k_size, k_size))
        closed = cv2.morphologyEx(inv, cv2.MORPH_CLOSE, k)

        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for c in contours:
            bx, by, bw, bh = cv2.boundingRect(c)

            # Logos are in the header band of pages or left/center columns (not bottom-right body paragraphs)
            if by > h * 0.35 and bx > w * 0.45:
                continue

            # Size constraints: width & height ~4% to 35% of page
            if not (w * 0.04 <= bw <= w * 0.35 and h * 0.02 <= bh <= h * 0.25):
                continue

            aspect = bw / float(bh)
            # Logos are compact circular, shield, square, or horizontal emblem banners
            if not (0.50 <= aspect <= 3.20):
                continue

            # Check edge density and internal contour complexity within the region
            crop_gray = gray[by:by+bh, bx:bx+bw]
            edges = cv2.Canny(crop_gray, 50, 150)
            edge_density = float(np.mean(edges > 0))

            # Measure contour circularity and solidity
            area = cv2.contourArea(c)
            perimeter = cv2.arcLength(c, True)
            circularity = float(4.0 * np.pi * area / (perimeter ** 2)) if perimeter > 0 else 0.0

            hull = cv2.convexHull(c)
            hull_area = cv2.contourArea(hull)
            solidity = float(area / hull_area) if hull_area > 0 else 0.0
            bbox_fill = float(area / (bw * bh)) if (bw * bh) > 0 else 0.0

            crop_inv = inv[by:by+bh, bx:bx+bw]
            ink_fill = float(np.mean(crop_inv > 0))

            # Logos feature circular/shield symmetry or high internal edge density
            is_circular_crest = (circularity >= 0.45 and edge_density >= 0.015 and ink_fill >= 0.02 and (solidity >= 0.20 or bbox_fill >= 0.20))
            is_dense_emblem = (edge_density >= 0.025 and ink_fill >= 0.02 and (solidity >= 0.20 or bbox_fill >= 0.20))

            if is_circular_crest or is_dense_emblem:
                conf = min(0.98, max(0.60, 0.50 + max(circularity * 0.30, edge_density * 2.0)))
                bbox = (int(bx), int(by), int(bw), int(bh))
                crop_img = self._crop_rgb(page, bbox)
                elements.append(
                    ExtractedVisualElement(
                        element_type="logo",
                        bbox=bbox,
                        crop_image=crop_img,
                        confidence=conf,
                    )
                )

        return elements

    def _detect_signatures_and_stamps(
        self, page: PreprocessedPage, rgb_np: np.ndarray, gray: np.ndarray, inv: np.ndarray
    ) -> List[ExtractedVisualElement]:
        """
        Detects handwritten cursive signatures and rubber stamps
        using morphological closure, thin stroke topology, solidity, and oval/circular symmetry.
        """
        w, h = page.width, page.height
        elements: List[ExtractedVisualElement] = []

        k = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
        closed = cv2.morphologyEx(inv, cv2.MORPH_CLOSE, k)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for c in contours:
            bx, by, bw, bh = cv2.boundingRect(c)

            # Signatures and stamps are in the middle or bottom half of documents (y > h * 0.35)
            if by < h * 0.35:
                continue

            aspect = bw / float(bh)
            area = cv2.contourArea(c)
            solidity = area / float(bw * bh) if (bw * bh) > 0 else 0
            crop_inv = inv[by:by+bh, bx:bx+bw]
            ink_fill = float(np.mean(crop_inv > 0))

            # 1. Cursive handwritten signature (thin looping cursive strokes, low solidity)
            if (w * 0.04 <= bw <= w * 0.25 and h * 0.03 <= bh <= h * 0.20 and 0.50 <= aspect <= 4.0
                    and 0.05 <= solidity <= 0.45 and 0.05 <= ink_fill <= 0.35):
                bbox = (int(bx), int(by), int(bw), int(bh))
                crop_img = self._crop_rgb(page, bbox)
                elements.append(
                    ExtractedVisualElement(
                        element_type="signature",
                        bbox=bbox,
                        crop_image=crop_img,
                        confidence=0.92,
                    )
                )

            # 2. Rubber stamp (oval/circular seal, high solidity boundary, moderate ink fill)
            elif (w * 0.08 <= bw <= w * 0.30 and h * 0.06 <= bh <= h * 0.25 and 0.70 <= aspect <= 2.2
                  and solidity >= 0.70 and 0.10 <= ink_fill <= 0.40):
                bbox = (int(bx), int(by), int(bw), int(bh))
                crop_img = self._crop_rgb(page, bbox)
                elements.append(
                    ExtractedVisualElement(
                        element_type="stamp",
                        bbox=bbox,
                        crop_image=crop_img,
                        confidence=0.95,
                    )
                )

        return elements

    def _filter_and_deduplicate(
        self, candidates: List[ExtractedVisualElement], page_w: int, page_h: int
    ) -> List[ExtractedVisualElement]:
        """
        Suppresses overlapping detections, prioritizes specific types,
        and excludes table-scale regions.
        """
        if not candidates:
            return []

        # Sort by confidence descending
        candidates.sort(key=lambda e: e.confidence, reverse=True)

        selected: List[ExtractedVisualElement] = []

        for cand in candidates:
            cx, cy, cw, ch = cand.bbox

            # Reject table-sized regions (wide tables spanning >= 35% width and >= 8% height)
            if cw > page_w * 0.35 and ch > page_h * 0.08:
                continue

            # Check overlap against already selected elements
            overlaps = False
            for sel in selected:
                sx, sy, sw, sh = sel.bbox
                # Calculate Intersection over Union (IoU)
                ix1 = max(cx, sx)
                iy1 = max(cy, sy)
                ix2 = min(cx + cw, sx + sw)
                iy2 = min(cy + ch, sy + sh)

                iw = max(0, ix2 - ix1)
                ih = max(0, iy2 - iy1)
                inter_area = iw * ih

                if inter_area > 0:
                    cand_area = cw * ch
                    sel_area = sw * sh
                    smaller_area = min(cand_area, sel_area)
                    # If significant containment or IoU > 0.35
                    if (inter_area / smaller_area) > 0.50 or (inter_area / (cand_area + sel_area - inter_area)) > 0.35:
                        overlaps = True
                        break

            if not overlaps:
                selected.append(cand)

        return selected
