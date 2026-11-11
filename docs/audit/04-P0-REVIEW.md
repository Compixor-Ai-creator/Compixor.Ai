# P0 Review — Baseline Audit Verification

**Reviewer:** Arena agent · **Date:** 11 Nov 2026
**Report under review:** Antigravity P0 (commit `c8ea1405`, read-only)
**Method:** independent re-measurement of every claim against the repo at `c8ea1405`
**Gate verdict:** **PASS — conditional.** 11 claims verified, 6 need correction (P0.1), 2 missed findings added.

---

## 1. Where I was wrong (agent was right)

| # | My baseline | Agent measured | Truth (re-measured) |
|---|---|---|---|
| A1-2 | 13 files with gradient text | **14** | **14** — 12 tool pages + `ErrorStage.tsx` + `PdfWatermarkClient.tsx` (2 hits) = 15 occurrences. My 13 was an arithmetic slip. |
| A1-3 | orbs 10 | 10 | 10 ✅ (agent replicated) |

Everything else in A1 matched exactly (472 hex, 92 inline styles, 128 `!important`, 2081 lines, 3215 CSS total, 43 `any`, 2 `console.log`, 220 `<button>` lines, 68 `aria-label`, 7 `focus-visible`, 12 `<select>`, 0 headless imports, 15 lint warnings).

**Verdict:** measurement discipline is genuinely good. This is not a copy-paste report.

---

## 2. Verified correct (accept as-is)

| Claim | Verification |
|---|---|
| `faqs.ts:59` and `:101` universal "100% local" claims | **Byte-for-byte exact.** Quotes are real. |
| Dead code list: `Navbar.tsx`, `CxArtCard.tsx`, `RelatedPdfTools.tsx`, `CustomerTestimonials.tsx`, `HeroArtCard.tsx`, `container-text-flip-demo.tsx` | **All 0 static importers.** Confirmed. |
| `ui/container-text-flip.tsx` imported by `page.tsx` (+ demo) | Correct — keep. |
| Rubric weights + weighted math = 5.45 | Arithmetic correct (5.45 at those inputs). |
| Health baseline (tsc/lint/test/build green) | Consistent with my run; their build green is legitimate (network available). |
| Sloplint provenance (path + commit + raw output saved) | Process correct; repo has no `.agents/`, so capturing raw output was the right call. |
| Artifact hygiene (`test-results/p0-baseline/`, git clean) | Matches `A4` requirement. |
| Prior-report reconciliation for 5 items (viewport, inert, FAQ h3>button, hero labels, home orbs) | All correct as ALREADY-FIXED. |

---

## 3. Six corrections required before P1 (P0.1)

### C1 — SLOP-16 "missing focus-visible on 213 buttons" → **rejected as stated**

Measured reality at `c8ea1405`:

| Metric | Value |
|---|---|
| `<button>` nodes (multi-line JSX parsed) | **224** |
| Buttons with a `focus:`/`focus-visible:` utility inside the tag | 2 |
| Buttons without one | **222** |
| `focus:outline-none` usages | 53 |
| …of those, `outline-none` **without** any ring/focus replacement | **0** (zero orphaned) |
| CSS-level `:focus-visible` rules in `globals.css` | **10** (`.social-btn`, `.cxg-chip`, `.cxg-tab`, …) |
| `outline: none` in CSS without an adjacent focus rule | 0 |
| Lighthouse a11y (home mobile + desktop) | **100** |

So: nothing suppresses focus without replacement, and the browser's default `:focus-visible` ring is intact. **"Keyboard tab focus disappears" is unproven and, on this evidence, false.** The real issue is *inconsistency* (only 2 buttons get the brand ring), which is a **P3 token job**, not P1 a11y.

⚠️ **Why this matters:** if this goes to P1 as written, P1 touches ~40 files and 222 nodes — violating the ≤8-file diff budget and inviting visual regressions in 12 tool pages.

**Corrected statement:** `no-focus-visible (inconsistent) — 222/224 buttons rely on the UA default ring; 10 CSS rules + 2 tag-level utilities define brand rings. Fix: one `focus-visible` token + shared button class in P3.`

### C2 — A11Y-P1-01 "footer contrast STILL-OPEN" → **ALREADY-FIXED** (contradicts own evidence)

`Footer.tsx:38-41` uses `text-emerald-800 dark:text-emerald-300` on `bg-emerald-500/15` — the exact classes the old audit recommended. The agent's own Lighthouse runs report **home a11y 100, 0 failing audits**. A failing contrast node would have appeared there.

**Corrected:** `A11Y-P1-01 → ALREADY-FIXED (Footer.tsx:38-41, confirmed by home Lighthouse a11y 100).`
The only genuine contrast failure is the qr-generator `span.text-[10px]` badge (`QrGeneratorStudio.tsx:1914`).

### C3 — SLOP-18 wrong file:line

Claimed: `QrGeneratorStudio.tsx:1428` = unlabeled input.
Reality: line 1428 is a `<select>` **with a `<label>` immediately above it**. The real unlabeled control is the **`input type="color"` at ~line 1737** (`className="w-9 h-9 …"`) — matches Lighthouse node `input.w-9`. Finding is real, location was wrong.

**Corrected:** `SLOP-18 — QrGeneratorStudio.tsx:1737, input[type=color], no label/aria-label (Lighthouse "label" audit).`

### C4 — SLOP-01 count/pattern split

`globals.css` lines 601, 885, 892, 1804 = `-webkit-background-clip: text` (real gradient text).
Lines 519, 898, 1032 = plain `linear-gradient` backgrounds (not text).

**Corrected:** `gradient-text (CSS) = 4 · gradient-background = 3` — total gradient text across repo = **15 (TSX) + 4 (CSS) = 19**, not 15.

### C5 — SLOP-13 wrong taxonomy and count

Measured: `transition: all` = **6** in `globals.css`; Tailwind `transition-all` class = **133** across TSX.
"token-drift" is the wrong pattern — this is **motion discipline**.

**Corrected:** re-label as `motion-transition-all`; report both counts (CSS 6, TSX 133) separately.

### C6 — A5 live proxy overclaimed

Markers used: `aria-label="Compress PDF tool"`, dang.ai badge, `"QR Code Generator"` h1. Markers 1 and 3 predate `c8ea1405`; marker 2 came from `7f39d3ee`. `c8ea1405` only installed a dependency — **it has no observable output**, so live cannot be distinguished from `7f39d3ee`..`c8ea1405`.

**Corrected:** `live ≥ 7f39d3ee (weak proxy). Exact commit identity requires the P4 build stamp — this is precisely the gap P4 closes.`

---

## 4. Two findings the report missed

### N1 — Two of the four "duplicate FAQ implementations" are **dead code**

| File | Importers |
|---|---|
| `src/app/page.tsx` (inline FAQ) | live (home) |
| `src/components/BlogFaqAccordion.tsx` | live (`blog/[slug]/page.tsx:33`) |
| `src/components/HomeFaqAccordion.tsx` | **0** |
| `src/components/FaqSection.tsx` | **0** |

So "4 → 1 consolidate" is wrong work. Correct: **delete 2 dead files in P1**, unify the *primitive only* (2 live ones) in P2. The two live ones have different behaviour (home = searchable + multi-open, blog = single-open), so merging data/logic risks breaking the FAQ search.

### N2 — Related-tools "3 → 1" is low value and risky

`RelatedTools` (4 importers), `RelatedToolsGrid` (blog only), `RelatedPdfTools` (dead). Only the dead one should go in P1. Merging the two live ones changes the blog layout for no user benefit — defer, or drop.

### Minor — byte sizes are CRLF-inflated

`CxArtCard` reported 16,872 B = 16,493 B + 379 lines (CRLF). Same for `RelatedPdfTools` (+239) and `container-text-flip` (+125). Use `wc -l` for size claims so cross-checks don't look like drift. (`Navbar.tsx` 36,997 happens to be the LF size.)

---

## 5. Corrected rubric

| Dimension | Wt | Old | Corrected | Reason |
|---|---|---|---|---|
| Typography | 10% | 6.0 | 6.0 | — |
| Color & contrast | 15% | 5.0 | 5.5 | footer contrast actually passes; token drift remains |
| Spacing | 10% | 6.0 | 6.0 | — |
| Surface honesty | 15% | 5.0 | 4.5 | 19 gradient-text instances (not 15) |
| Motion | 5% | 7.0 | 6.5 | 133 `transition-all` in TSX |
| Copy & IA | 15% | 5.0 | 5.0 | verified accurate |
| Components | 15% | 4.0 | 3.5 | +2 dead FAQ files |
| A11y semantics | 15% | 7.0 | **8.5** | no evidence of missing focus; a11y 100 |
| **Total** | | **5.45** | **≈ 5.72** | |

---

## 6. Corrected P1 scope (approved)

P1 is now **3 small commits**, not a sweep:

| Commit | Files | Content | Risk |
|---|---|---|---|
| **P1a — dead code** | 13 deletions, 0 additions | 8 components (`Navbar`, `CxArtCard`, `RelatedPdfTools`, `CustomerTestimonials`, `HeroArtCard`, `container-text-flip-demo`, `HomeFaqAccordion`, `FaqSection`) + 5 root artifacts (`cx-art-card.*`, `cx-premium-card.html`, `hero-mobile-minimal.css`) | Low — all 0 importers proven |
| **P1b — copy accuracy** | 1 | `faqs.ts:59` and `:101` → 9 local / 3 HTTPS wording (use `page.tsx:284` wording as the master template) | Low |
| **P1c — measured a11y** | 2 | `QrGeneratorStudio.tsx:1737` label for color input; `:1914` `text-[10px]` contrast to ≥4.5:1 | Low |

**Explicitly NOT in P1:** focus-ring sweep (→P3 token), FAQ merge (→P2 primitive), related-tools merge (→dropped), any CSS refactor, any redesign.

**Do NOT delete:** `apply_v10_4_argon.sh`, `update_vps.sh` (deploy helpers, not artifacts), `ui/container-text-flip.tsx` (live).

---

## 7. P1 gate (restated)

- `tsc` 0 errors · `lint` 0 errors (warnings ≤ 15 and no new ones) · `npm test` 7/7 · `npm run build` green
- dev server: `/`, `/tools/qr-generator`, `/tools/pdf-compressor`, `/blog` → 200
- 13 deletions, 0 leftover references (`grep` for each deleted name returns nothing outside git history)
- screenshots: qr color input label + qr badge contrast, before/after
- `git status` clean, tag `p1-a11y`
- Report: PHASE REPORT + JSON summary, `DEFERRED_FINDINGS` must list P2/P3 items explicitly
