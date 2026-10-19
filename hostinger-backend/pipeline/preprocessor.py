"""
Document Preprocessing Pipeline for Compixor Image-to-Word Universal Document Reconstruction Engine.
Conforms to PROJECT.md § Interface Contracts § 1.

Responsibilities:
1. Multi-format Ingestion: PNG, JPG, JPEG, WebP, and multi-page PDF.
2. Upload Size Enforcement: 10MB upload limit (MAX_UPLOAD_MB).
3. 300 DPI Normalization: High-quality Lanczos/Bicubic upscaling of lower-res images,
   and 300 DPI rendering of PDF pages via pdf2image with fallback to pypdfium2.
4. Deskewing: Skew angle estimation via Hough Line Transform with minAreaRect fallback,
   deskewing the document to upright orientation.
5. Dual Synchronized Layers:
   - High-resolution RGB layer (`rgb_image`) for cropping visual elements.
   - CLAHE-enhanced grayscale (`clahe_gray`) and binarized (`binary_image`) for OCR and grid morphology.
"""

from __future__ import annotations

import io
import os
import math
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Union, List, Tuple

import cv2
import numpy as np
from PIL import Image, ImageOps

logger = logging.getLogger("compixor.pipeline.preprocessor")


@dataclass
class PreprocessedPage:
    page_number: int
    rgb_image: Image.Image            # Full-color 300 DPI image for visual cropping
    clahe_gray: np.ndarray            # Grayscale enhanced layer for morphology & OCR
    binary_image: np.ndarray          # Clean binarized layer
    skew_angle: float                 # Calculated deskew angle in degrees
    dpi: int                          # Estimated or target DPI (300)
    width: int
    height: int


class DocumentPreprocessor:
    """Ingests and preprocesses document images and PDFs into synchronized layers."""

    SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".pdf"}

    def __init__(self, max_upload_mb: Optional[int] = None, target_dpi: int = 300):
        if max_upload_mb is None:
            max_upload_mb = int(os.getenv("MAX_UPLOAD_MB", "10"))
        self.max_upload_mb = max_upload_mb
        self.max_upload_bytes = self.max_upload_mb * 1024 * 1024
        self.target_dpi = target_dpi

    def validate_file(self, file_bytes: bytes, filename: str) -> str:
        """
        Validates file size and format.
        Returns the normalized file extension.
        Raises ValueError on validation failure.
        """
        if not file_bytes:
            raise ValueError("File content is empty.")

        if len(file_bytes) > self.max_upload_bytes:
            raise ValueError(
                f"File size ({len(file_bytes)} bytes) exceeds the {self.max_upload_mb}MB limit "
                f"({self.max_upload_bytes} bytes)."
            )

        ext = Path(filename).suffix.lower()
        if ext not in self.SUPPORTED_EXTENSIONS:
            # Check magic bytes before rejecting
            if file_bytes.startswith(b"%PDF"):
                ext = ".pdf"
            elif file_bytes.startswith(b"\x89PNG"):
                ext = ".png"
            elif file_bytes.startswith(b"\xff\xd8\xff"):
                ext = ".jpg"
            elif file_bytes.startswith(b"RIFF") and b"WEBP" in file_bytes[:16]:
                ext = ".webp"
            else:
                raise ValueError(
                    f"Unsupported file format: '{ext or filename}'. "
                    f"Allowed formats: {', '.join(sorted(self.SUPPORTED_EXTENSIONS))}."
                )

        return ext

    def _render_pdf(self, file_bytes: bytes) -> List[Image.Image]:
        """Renders all PDF pages at target_dpi using pdf2image with fallback to pypdfium2."""
        pil_pages: List[Image.Image] = []

        # 1. Try pdf2image first
        try:
            from pdf2image import convert_from_bytes
            pil_pages = convert_from_bytes(file_bytes, dpi=self.target_dpi)
            if pil_pages:
                logger.info(f"Rendered {len(pil_pages)} pages via pdf2image at {self.target_dpi} DPI")
                return [p.convert("RGB") for p in pil_pages]
        except Exception as e:
            logger.debug(f"pdf2image failed or poppler not available ({e}), falling back to pypdfium2")

        # 2. Fallback to pypdfium2
        try:
            import pypdfium2 as pdfium
            pdf = pdfium.PdfDocument(file_bytes)
            # Default PDF point scale: 72 points per inch -> target_dpi / 72.0
            scale = self.target_dpi / 72.0
            for page in pdf:
                bitmap = page.render(scale=scale)
                pil_img = bitmap.to_pil().convert("RGB")
                pil_pages.append(pil_img)
            pdf.close()
            if pil_pages:
                logger.info(f"Rendered {len(pil_pages)} pages via pypdfium2 at scale {scale:.2f}")
                return pil_pages
        except Exception as e:
            raise ValueError(f"Failed to render PDF document: {e}") from e

        if not pil_pages:
            raise ValueError("PDF document contains no renderable pages.")
        return pil_pages

    def _load_raster_image(self, file_bytes: bytes) -> Image.Image:
        """Loads a raster image, applies EXIF transpose, and ensures clean RGB on white background."""
        try:
            with Image.open(io.BytesIO(file_bytes)) as img:
                img = ImageOps.exif_transpose(img)
                if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                    # Composite on solid white background to avoid black background artifacts
                    bg = Image.new("RGB", img.size, (255, 255, 255))
                    rgba_img = img.convert("RGBA")
                    bg.paste(rgba_img, mask=rgba_img.split()[3])
                    return bg
                elif img.mode != "RGB":
                    return img.convert("RGB")
                else:
                    return img.copy()
        except Exception as e:
            raise ValueError(f"Failed to decode image: {e}") from e

    def estimate_dpi(self, img: Image.Image) -> float:
        """Estimates current DPI of an image from metadata or geometric heuristics."""
        dpi_info = img.info.get("dpi")
        if dpi_info:
            try:
                x_dpi = float(dpi_info[0]) if isinstance(dpi_info, (tuple, list)) else float(dpi_info)
                if 30.0 <= x_dpi <= 1200.0:
                    return x_dpi
            except (ValueError, TypeError, IndexError):
                pass

        # Heuristic estimation for standard letter/A4 document scans
        w, h = img.size
        max_dim = max(w, h)
        if max_dim >= 2400:
            return 300.0
        elif max_dim >= 1800:
            return 200.0
        elif max_dim >= 1200:
            return 150.0
        else:
            return 96.0

    def upscale_to_target_dpi(self, img: Image.Image) -> Image.Image:
        """Upscales lower-resolution images to target DPI (~300 DPI) using high-quality Lanczos resampling."""
        current_dpi = self.estimate_dpi(img)
        if current_dpi >= (self.target_dpi * 0.92):
            return img

        scale = self.target_dpi / current_dpi
        # Constrain scaling factor to reasonable bounds (max 5x) to avoid memory blowup
        scale = min(max(scale, 1.0), 5.0)
        new_w = int(round(img.width * scale))
        new_h = int(round(img.height * scale))
        logger.debug(f"Upscaling image from {img.size} ({current_dpi:.1f} DPI) to {(new_w, new_h)} ({self.target_dpi} DPI)")
        return img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    def detect_skew_angle(self, gray: np.ndarray) -> float:
        """
        Computes skew angle in degrees using Hough Line Transform on text edges,
        with minAreaRect contour bounding box fallback.
        Returns the deskew angle in degrees within [-45°, 45°].
        """
        h, w = gray.shape[:2]

        # 1. Hough lines on Canny edge map
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        # Dynamic minLineLength proportional to image width
        min_line_len = max(50, int(w * 0.08))
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=min_line_len, maxLineGap=10)

        if lines is not None and len(lines) > 0:
            lines_reshaped = lines.reshape(-1, 4)
            angles = []
            for x1, y1, x2, y2 in lines_reshaped:
                dx = x2 - x1
                dy = y2 - y1
                if dx == 0:
                    continue
                angle_deg = np.degrees(np.arctan2(dy, dx))
                if -45.0 <= angle_deg <= 45.0:
                    angles.append(angle_deg)

            if len(angles) >= 5:
                median_angle = float(np.median(angles))
                if abs(median_angle) < 0.2:
                    return 0.0
                return median_angle

        # 2. Fallback: minAreaRect on dilated text components
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
        kernel_w = max(15, int(w * 0.02))
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_w, 3))
        dilated = cv2.dilate(thresh, kernel, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        rect_angles = []
        min_area = (w * h) * 0.0005
        for cnt in contours:
            if cv2.contourArea(cnt) > min_area:
                rect = cv2.minAreaRect(cnt)
                rect_w, rect_h = rect[1]
                angle = rect[2]
                if rect_w < rect_h:
                    angle = angle - 90.0 if angle > 0 else angle + 90.0
                while angle > 45.0:
                    angle -= 90.0
                while angle < -45.0:
                    angle += 90.0
                if -45.0 <= angle <= 45.0:
                    rect_angles.append(angle)

        if rect_angles:
            median_angle = float(np.median(rect_angles))
            if abs(median_angle) < 0.2:
                return 0.0
            return median_angle

        return 0.0

    def deskew_image(self, img: Image.Image, skew_angle: float) -> Image.Image:
        """Rotates image by skew_angle around its center with high-quality bicubic interpolation."""
        if abs(skew_angle) < 0.2:
            return img
        # In PIL, rotate(angle) rotates counter-clockwise.
        # When Hough dy/dx > 0 (text slopes down), skew_angle > 0; rotating by skew_angle clockwise corrects it.
        return img.rotate(skew_angle, resample=Image.Resampling.BICUBIC, expand=False, fillcolor=(255, 255, 255))

    def generate_layers(self, rgb_image: Image.Image) -> Tuple[np.ndarray, np.ndarray]:
        """
        Produces synchronized layers:
        (a) clahe_gray: Denoised & CLAHE-enhanced grayscale (uint8 ndarray)
        (b) binary_image: Clean Otsu binarized layer (uint8 ndarray)
        """
        rgb_np = np.array(rgb_image)
        gray = cv2.cvtColor(rgb_np, cv2.COLOR_RGB2GRAY)

        # Bilateral filter for edge-preserving denoising
        denoised = cv2.bilateralFilter(gray, d=5, sigmaColor=50, sigmaSpace=50)

        # CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        clahe_gray = clahe.apply(denoised)

        # Otsu binarization
        _, binary_image = cv2.threshold(clahe_gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

        return clahe_gray, binary_image

    def process_input(self, file_bytes: bytes, filename: str) -> List[PreprocessedPage]:
        """
        Validates file format, enforces 10MB cap, renders PDF/images at 300 DPI, and deskews.
        Returns a list of PreprocessedPage objects.
        """
        ext = self.validate_file(file_bytes, filename)

        # Load raw pages
        if ext == ".pdf":
            raw_pages = self._render_pdf(file_bytes)
        else:
            raw_pages = [self._load_raster_image(file_bytes)]

        preprocessed_pages: List[PreprocessedPage] = []

        for idx, page_img in enumerate(raw_pages, start=1):
            # 1. Upscale to ~300 DPI equivalent
            upscaled_img = self.upscale_to_target_dpi(page_img)

            # 2. Skew detection
            gray_for_skew = cv2.cvtColor(np.array(upscaled_img), cv2.COLOR_RGB2GRAY)
            skew_angle = self.detect_skew_angle(gray_for_skew)

            # 3. Deskew
            deskewed_rgb = self.deskew_image(upscaled_img, skew_angle)

            # 4. Synchronized layer generation
            clahe_gray, binary_image = self.generate_layers(deskewed_rgb)

            width, height = deskewed_rgb.size

            page = PreprocessedPage(
                page_number=idx,
                rgb_image=deskewed_rgb,
                clahe_gray=clahe_gray,
                binary_image=binary_image,
                skew_angle=skew_angle,
                dpi=self.target_dpi,
                width=width,
                height=height,
            )
            preprocessed_pages.append(page)

        logger.info(f"Preprocessed {len(preprocessed_pages)} page(s) from '{filename}'")
        return preprocessed_pages
