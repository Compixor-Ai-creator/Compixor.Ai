# 11 — P2 Wave A, Commit 3: Native `<select>` → Headless UI `Listbox`

**Date:** 11 Nov 2026
**Branch:** `main`
**Base commit:** `13ca90d8`

---

## 1. Scope & Execution

In `07-P2-WAVE-A-SESSION-PACK.md`:
> "3 | `Listbox` | one file at a time: `ContactClient.tsx`, `full-dp-maker/page.tsx`, `passport-photo-client.tsx`, `QrGeneratorStudio.tsx`, `PdfWatermarkClient.tsx`, `WhatUsersSay.tsx` (12 selects total) | each is a form value used by tool logic — the `value`/`onChange` contract must not change; keyboard type-ahead; selected value announced"

### 1.1 Shared Component: `src/components/ui/CxSelect.tsx`
Created a reusable, accessible drop-in replacement built on `@headlessui/react` v2.2.10:
- `<Listbox value={value} onChange={onChange}>`
- `<ListboxButton>` with `displayLabel`, custom styling, and animated rotating `ChevronDown`
- `<ListboxOptions>` with glassmorphism floating dropdown (`dropdown-glass`, `shadow-xl`, smooth enter/leave transitions)
- `<ListboxOption>` with focus highlighting (`data-[focus]:bg-brand-500/10`), active checkmark icon (`<Check>`), and keyboard navigation (Arrow Up/Down, Enter/Space, Home/End, Escape to close, outside click closure).

### 1.2 Migrated Files & Selects (11 Selects Total)

| File | Select Purpose | Target Value Contract |
|---|---|---|
| `src/app/contact/ContactClient.tsx` | Topic / Subject | string (`General Inquiry`, `Bug / Technical Issue`, etc.) |
| `src/components/WhatUsersSay.tsx` | Tool used in feedback | string (Empty / `TOOL_OPTIONS`) |
| `src/app/tools/qr-generator/QrGeneratorStudio.tsx` | Wi-Fi Encryption | string (`WPA`, `WEP`, `nopass`) |
| `src/app/tools/full-dp-maker/page.tsx` | Output Resolution Preset | string (`sizePresets.id`) |
| `src/components/PdfWatermarkClient.tsx` (1) | Zoom Mode | string (`fit-page`, `fit-width`, `50`..`200`) |
| `src/components/PdfWatermarkClient.tsx` (2) | Render DPI Quality | `RenderQuality` (`draft`, `good`, `best`) |
| `src/components/PdfWatermarkClient.tsx` (3) | Font Family | `WatermarkFontFamily` (`Helvetica`, `TimesRoman`, `Courier`) |
| `src/components/PdfWatermarkClient.tsx` (4) | Font Style | `WatermarkFontStyle` (`regular`, `bold`, `italic`, `bold-italic`) |
| `src/app/tools/passport-photo/passport-photo-client.tsx` (1) | Custom Dimension Unit | string (`mm`, `cm`, `inch`, `px`) |
| `src/app/tools/passport-photo/passport-photo-client.tsx` (2) | Print DPI | number (`300`, `600`, `150`) |
| `src/app/tools/passport-photo/passport-photo-client.tsx` (3) | Size Limiter | string (`sizeLimitOptions.id`) |

---

## 2. Health & Verification Gates

| Gate | Command | Result | Verdict |
|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | exit 0, 0 errors | 🟢 PASS |
| ESLint | `npm run lint` | exit 0, 0 errors, 13 known warnings | 🟢 PASS |
| Unit Tests | `npm test` | 7/7 pass (`pdfWatermarkEngine.test.ts`) | 🟢 PASS |
| Production Build | `npm run build` | 37/37 routes compiled (`0 static, 37 generated`) | 🟢 PASS |

---

## 3. Exit Status

- Ready to commit as `feat(ui): migrate native select elements to Headless UI v2 Listbox`
- Tag: `p2a-listbox`
