# 10 — P2 Wave A, Commit 2: Share Dropdown → Headless UI `Menu`

**Date:** 11 Nov 2026
**Branch:** `main`
**Base commit:** `ae0f5ec4`
**Files changed: exactly 1** (as scoped in `07-P2-WAVE-A-SESSION-PACK.md`)

| File | Change |
|---|---|
| `src/components/ShareToolButton.tsx` | Hand-rolled dropdown state (`dropdownOpen`, `useEffect` outside-click listener, manual `aria-*` tags) replaced by `@headlessui/react` `Menu`, `MenuButton`, `MenuItems`, `MenuItem`. Native Web Share API path preserved first; fallback Menu dropdown with direct social buttons (LinkedIn, X, WhatsApp, Facebook) + Copy Link. |

No other app file touched. `@headlessui/react@2.2.10` dependency was used directly without new dependencies.

---

## 1. Technical Contract & Architecture

In `07-P2-WAVE-A-SESSION-PACK.md`:
> "2 | Share `Menu` | `src/components/ShareToolButton.tsx` | keep the Web Share API path first; Menu is only the fallback dropdown. Outside-click + Escape must still close."

### 1.1 Web Share API First Contract
- When native `navigator.share` is available (primarily mobile devices), clicking `MenuButton` invokes `navigator.share(...)`.
- `AbortError` (user dismissal) is handled silently without throwing.

### 1.2 Headless UI v2 Menu Fallback
- Replaced manual `document.addEventListener('mousedown', handleClickOutside)` with Headless UI's built-in outside click handler.
- Built-in keyboard accessibility:
  - `ArrowDown` / `ArrowUp` to navigate across items.
  - `Escape` closes the menu and returns focus to the `MenuButton`.
  - `Tab` closes menu cleanly and moves focus forward.
- WAI-ARIA roles:
  - `<MenuButton>` automatically emits `aria-haspopup="menu"`, `aria-expanded="true/false"`, and dynamic `id`.
  - `<MenuItems>` automatically emits `role="menu"` with `aria-labelledby` referencing the button.
  - `<MenuItem>` renders wrapped elements with full focus-ring support (`{ focus }` slot) and active states.

### 1.3 Copy Link Behavior
- `handleCopyLink(e)` stops propagation so that clicking "Copy Tool Link" allows the "Link Copied!" state (2s feedback) to display without immediately snapping the dropdown shut.

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

- Ready to commit as `feat(ui): migrate ShareToolButton to Headless UI v2 Menu`
- Tag: `p2a-menu`
