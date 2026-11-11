# P2 Session Pack — Wave A (env-independent Headless UI migration)

**Why a wave split:** the gap in P1.5 is a *user action* (Vercel env vars). Only 2 of the 8
Headless UI families need the feedback endpoint to be testable. Blocking all 8 on a dashboard
task wastes a phase — 5 families can ship now.

| Wave | Families | Depends on env? | Order |
|---|---|---|---|
| **A (now)** | FAQ `Disclosure`, share `Menu`, native `Listbox`, toggles `Switch`, tab-like `TabGroup` | ❌ no | as listed |
| B (after env) | `CompixorModal` `Dialog` (used by FeedbackWidget, ToolFeedback, WhatUsersSay), FeedbackWidget `Dialog + RadioGroup` | ✅ yes — submit path must be testable | modal first, widget second |
| C (last) | mobile nav drawer `Dialog` | ❌ no, but **highest risk** | only after A and B are green |

Start Wave A with **one family per session, one primitive per commit**. Do not batch.

> **Status:** commit 1 (FAQ `Disclosure`) is **done** — see `09-P2-WAVE-A-COMMIT-1.md`. It contains one
> correction to this pack: `unmount={false}` renders the closed panel with `display:none`, so the panel
> must be `static` and the collapse driven by the `data-open` attribute instead. Next up: commit 2, `Menu`.

---

## Contract digest

R1 phase lock · R2 read before write, grep before create · R3 evidence (E1 command/HTTP/file:line,
E2 screenshot/JSON) else `UNVERIFIED` · R4 banned phrases (should work / probably / looks good / 100%
deployed / fixed without file:line) · R5 pushed ≠ deployed · R6 no capability guessing · R7 verify
APIs against `node_modules/@headlessui/react/dist/index.d.ts` (v2.2.10) · R8 do not touch pdf-lib /
pako / jszip / canvas / WASM / workers / `pdfWatermarkEngine.ts` / backend runtime · R9 ≤8 files, one
concern per commit · R10 no `--force`, no `--no-verify`, no `git add .`, tag each phase · R11 no new
global CSS, no CSS append, no `!important` · R12 stop and ask on design/product decisions · R13
SESSION SCOPE overrides the default mission.

---

## SESSION SCOPE — P2 Wave A, Commit 1: FAQ → `Disclosure`

```text
BEGIN SESSION SCOPE — P2 WAVE A / COMMIT 1 (Disclosure only)

TARGET: migrate the two LIVE FAQ implementations to Headless UI v2 Disclosure.
Exactly two files may change:
  1. src/components/BlogFaqAccordion.tsx      (live: used by src/app/blog/[slug]/page.tsx:33)
  2. src/app/page.tsx                          (inline FAQ section, searchable + multi-open)
Do not create a new shared component in this commit (that is a later decision). Do not
touch HomeFaqAccordion.tsx / FaqSection.tsx - they were deleted in P1a.

BEHAVIOUR THAT MUST NOT CHANGE:
  - Blog FAQ: single-open accordion (opening one closes the previous).
  - Home FAQ: MULTI-open via openFaqIndices[], plus the search box that filters and
    force-opens matches when faqSearch is non-empty. Search input, empty-state and
    counts stay byte-identical in behaviour.
  - Existing classNames, spacing, typography, border radius, hover states stay as-is.
  - The h3 > button heading pattern must survive (it is already correct a11y; do not
    regress it to div+role=button).

IMPLEMENTATION RULES (Headless UI v2.2.10 - verify against the .d.ts first):
  - import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
  - Keep semantics: <Disclosure as="article"> ... <h3><DisclosureButton> ...
  - DisclosureButton already emits aria-expanded + aria-controls; remove the manual
    aria-* attributes to avoid duplicates, but keep the existing ids used by
    aria-labelledby on the panel if you keep them.
  - COLLAPSE ANIMATION: the current implementation animates with max-h-0/max-h-96 +
    opacity. Plain DisclosurePanel hides with the `hidden` attribute and would kill
    the animation and change layout. Use unmount={false} plus data-attribute
    transitions (data-[open]/data-[closed] or the plugin's ui-open:/ui-closed:
    variants) so the collapsed/expanded visual states match the current screenshots
    within 1-2px. If you cannot match it, STOP and report - do not ship a layout shift.
  - Do not add a new dependency. Do not upgrade @headlessui/react.
  - No changes to src/data/*, no copy changes, no colour/token changes.

EVIDENCE REQUIRED:
  - Before/after screenshots, light + dark, 1440px and 390px, for
    /blog/[any slug] and / (FAQ section open + closed + search-active)
  - Keyboard log per surface: Tab into the trigger, Enter toggles, Space toggles,
    Tab moves to the next trigger, Shift+Tab returns, panel content is reachable
  - aria-expanded true/false captured from the DOM (devtools snippet or JS eval)
  - Home FAQ: type a search term, confirm filtering + auto-open still work
  - No hydration warning in the console; no React key warnings

EXIT GATE:
  - tsc 0 errors / lint 0 errors, no new warnings beyond the known 15
  - npm test all pass (report count) / npm run build green, 37 routes
  - routes 200: /, /blog, /blog/<slug>, /tools/qr-generator
  - git status clean, tag p2a-disclosure
  - PHASE REPORT + JSON. DEFERRED must list Wave A commits 2-5 (Menu, Listbox,
    Switch, TabGroup) and Waves B/C. Then STOP.

END SESSION SCOPE

RUN PHASE: P2
```

---

## After commit 1 (same wave, separate sessions)

| # | Family | Files | Watch out for |
|---|---|---|---|
| 2 | Share `Menu` | `src/components/ShareToolButton.tsx` | keep the Web Share API path first; Menu is only the fallback dropdown. Outside-click + Escape must still close. |
| 3 | `Listbox` | one file at a time: `ContactClient.tsx`, `full-dp-maker/page.tsx`, `passport-photo-client.tsx`, `QrGeneratorStudio.tsx`, `PdfWatermarkClient.tsx`, `WhatUsersSay.tsx` (12 selects total) | each is a form value used by tool logic — the `value`/`onChange` contract must not change; keyboard type-ahead; selected value announced |
| 4 | `Switch` | theme toggle + tool option toggles | keep `compixor-theme` localStorage key and the `dark` class contract exactly |
| 5 | `TabGroup` | tab-like UI that has no `role="tab"` today | if a "tab" is really navigation, leave it as links; only migrate genuine tab panels |

## Verification note (deploy)

Until P4 adds the build stamp, deploy proof = (a) Vercel deployment READY for the pushed SHA,
(b) a **server-rendered** marker that cannot pre-exist, (c) the HTML byte delta between runs.
Client-only components (`ssr: false`) can never be verified with `curl` — verify those in a browser.
