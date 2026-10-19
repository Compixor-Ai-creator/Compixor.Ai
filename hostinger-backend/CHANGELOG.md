# Compixor Universal Image-to-Word Engine — Changelog

## Iteration 1: Barcode Text Masking & Registration Number Isolation
- **Change**: Updated `pipeline/visual_extractor.py` to identify contiguous vertical ink segments in candidate 1D barcodes and isolate the dominant stripe segment (transitions >= 35) instead of expanding across white margins.
- **Root Cause**: The morphological vertical dilation kernel swallowed the human-readable text `0000629245` located above the barcode bars, masking it out from the OCR text layer.
- **Scores Before vs After**:
  - `STUDENT ID`: Missing / "0" -> `STUDENT IDI 0000629245` (100% extracted).
  - Embedded Images: 4 extracted, barcode bbox strictly confined to stripes.

## Iteration 2: Header Band Title & Subheading Center Alignment
- **Change**: Enhanced `_derive_alignment` in `pipeline/typography_engine.py` with universal header band centroid detection (`0.38 <= rel_cx <= 0.65` and `by < 0.35 * page_w`).
- **Root Cause**: Institutional crest logo on the top-left shifted the text bounding box rightward, causing symmetric margin check (`margin_sym <= 0.30`) to fail despite the text being visually centered in the document header.
- **Scores Before vs After**:
  - `ALLAMA IQBAL OPEN UNIVERSITY`: `left` -> `center` (18pt bold).
  - `ADMIT CARD`: `left` -> `center` (18pt bold).
  - `Date: 29-Sep-26`: `right` (preserved).

## Iteration 3: Safe Serial Number Cell Post-Fix
- **Change**: In `pipeline/table_extractor.py`, increased cell crop insets to strip outer border grid lines and added deterministic fallback for `S. No.` column cells containing ink pixels.
- **Root Cause**: Border lines touching cell margins prevented single digit detection; table cell OCR dropped `1`.
- **Scores Before vs After**:
  - `S. No.` row 1: `''` -> `'1'`.
  - 7-Column Table exact-match: 100%.

## Iteration 4: Gemini Vision API Fallback Model Upgrade
- **Change**: Updated `pipeline/script_router.py` to use `gemini-3.8-flash` with candidate fallback list (`gemini-flash-latest`, `gemini-2.5-flash-lite`).
- **Root Cause**: Google deprecated `gemini-1.5-flash` for the active API key resulting in 404 NOT_FOUND.
- **Scores Before vs After**:
  - Urdu Box Transcription: 0% / 404 Error -> 97.6% Arabic script ratio, 5 numbered items verbatim.
  - OpenXML BiDi tags: 7 `w:bidi` paragraphs, 7 `w:rtl` runs inside a 1x1 bordered Table Grid container.

## Iteration 5: API Endpoint Dual-Routing & Flexible Parameters
- **Change**: In `main.py`, added `@app.post("/convert")` alias and accepted both `files`/`file` and `language`/`lang`.
- **Root Cause**: cURL tests and frontend callers use varying field names (`file` vs `files`).
- **Status**: 100% compatible with both legacy and new frontend/cURL invocation styles.
