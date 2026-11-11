# P1 Session Pack — copy-paste (v1.1)

**Kaise use karein**
1. Antigravity ko pehle **master prompt** `docs/audit/01-ANTIGRAVITY-MASTER-PROMPT.md` (v1.1) dein — ek dafa, session ke shuru mein.
2. Phir neeche ka **SESSION SCOPE** block paste karein.
3. Aik session = aik phase. Is session mein sirf P1a → P1b → P1c.

> Master prompt poora paste karna bhaari ho to kam az kam §2 ka **rules digest** (neeche) dein — magar without the digest agent R11 (no CSS append) aur R13 (scope precedence) bhool jayega.

---

## Rules digest (agar master prompt file available na ho)

```text
CONTRACT (Compixor audit, v1.1) — non-negotiable:
R1 phase lock: only the assigned phase. Later-phase work goes to DEFERRED.
R2 read before write; grep for an existing component before creating one.
R3 evidence or it didn't happen: E1 = command exit+tail / HTTP status+body /
   file:line. E2 = screenshot / Lighthouse JSON / test log. Reasoning = UNVERIFIED.
R4 banned phrases: "should work", "probably", "looks good", "100% deployed",
   "successfully pushed" (no SHA), "all tests pass" (no count), "fixed"
   (no file:line), "verified in browser" (no steps).
R5 pushed != deployed. Live SHA proof only.
R6 capability honesty: no browser/Lighthouse/deploy CLI => BLOCKED, never guess.
R7 see the browser/lint output before fixing; verify APIs against types
   (Headless UI is v2.2.10 — read node_modules/@headlessui/react/*.d.ts).
R8 do-not-touch: pdf-lib/pako/jszip/canvas/WASM pipelines, workers,
   pdfWatermarkEngine.ts, hostinger-backend runtime, Supabase schema.
R9 diff budget: <= 8 files, ~400 lines, one concern per commit,
   conventional commit + one evidence line in the body.
R10 no direct push to main, no --force, no --no-verify, no `git add .`;
    tag each phase; PR only.
R11 no new global CSS, no CSS append, no `!important`.
R12 stop and ask on: deletes with side effects, new dependencies, route
    changes, copy meaning changes, design taste calls.
R13 SESSION SCOPE overrides the default mission. Never widen or shrink it
    silently; report "SCOPE_OVERRIDE: <item>" if they disagree.
Report contract every phase: PHASE REPORT block + JSON summary, with
FILES_CHANGED, COMMANDS (exit + tail), EVIDENCE per claim, DEFERRED_FINDINGS,
UNVERIFIED, BLOCKED, NEXT_PHASE_READY. Then STOP.
```

---

## SESSION SCOPE — paste this

```text
BEGIN SESSION SCOPE — PHASE P1 (corrected after P0 review)

CONTEXT: P0 gate passed conditionally. Six corrections were applied to the
P0 report (docs/audit/04-P0-REVIEW.md). P1 is therefore DELETION + COPY +
TWO MEASURED A11Y FIXES. Nothing else in this session.

Hard exclusions for this session (do not touch, even if you spot them):
  - no focus-ring sweep anywhere (222 nodes stay as they are)
  - no FAQ merge, no related-tools merge
  - no globals.css / `!important` / token refactor
  - no Headless UI imports
  - no redesign, no section removal, no new marketing copy
  - no tool processing logic, workers, WASM
  - never delete apply_v10_4_argon.sh, update_vps.sh,
    src/components/ui/container-text-flip.tsx

COMMIT P1a — delete dead code (13 files, 0 additions)
  src/components/Navbar.tsx
  src/components/CxArtCard.tsx
  src/components/RelatedPdfTools.tsx
  src/components/CustomerTestimonials.tsx
  src/components/HeroArtCard.tsx
  src/components/container-text-flip-demo.tsx
  src/components/HomeFaqAccordion.tsx
  src/components/FaqSection.tsx
  cx-art-card.css
  cx-art-card.html
  cx-art-card.jsx
  cx-premium-card.html
  hero-mobile-minimal.css
  For each file BEFORE deleting: grep -rn "<basename-without-ext>" src
  (also check next.config.js and any dynamic import), save the command
  output showing zero importers, then delete. Never `git rm -r`.
  Commit message: chore(cleanup): delete 13 provably unused components and
  root artifacts

COMMIT P1b — copy accuracy (1 file)
  src/data/faqs.ts lines 59 and 101.
  Replace the universal "100% locally / never leaves your computer" claim
  with the wording that already exists at src/app/page.tsx:284:
  "9 tools run locally on your device with zero photo or document
   uploads. Specialized utilities (PDF to Word, Image to Word, and
   Passport Photo) process securely over HTTPS with zero permanent file
   storage."
  Keep the answer length within the existing accordion card (max ~2
  sentences added, no layout change). Do not edit data/toolsPrivacy.ts —
  it is already correct (passport-photo and pdf-to-word are marked
  processingType: 'server').
  Commit message: fix(copy): align general FAQ with 9-local/3-HTTPS reality

COMMIT P1c — two measured a11y fixes (2 files, one file touched)
  src/app/tools/qr-generator/QrGeneratorStudio.tsx
    a) type="color" inputs have no accessible name: six exist (1733, 1751,
       1769, 1787, 1933, 1949); the sibling <label> has no htmlFor and the
       input has no id/aria-label. Fix by PATTERN, not by line: give each
       input an id + <label htmlFor>, or an aria-label matching its visible
       label text ("Pattern Color", "Outer Corner Eye Color", "Inner Eye
       Pupil Color", "Background Color", ...).
       Evidence to cite: Lighthouse audit "label", failing node input.w-9.
       Verify: re-run -> label audit must be 0 failing nodes for ALL of them.
    b) File 2 is src/app/tools/qr-generator/page.tsx (NOT QrGeneratorStudio):
       the failing node div.p-3 > div.flex > div.w-20 > span.text-[10px]
       maps to page.tsx:37-39, with the same text-zinc-400-on-translucent-
       light pattern at ~260 and ~263. Raise those to >= 4.5:1 in BOTH
       light and dark variants. Do not touch text-zinc-500 nodes unless
       the re-run still fails. Do not change font size, padding or layout.
  Re-run Lighthouse on /tools/qr-generator (mobile) after the fix and
  report accessibility score before/after. Save JSON to test-results/p1/.
  Commit message: fix(a11y): label qr colour input and fix badge contrast

EXIT GATE (all required):
  - tsc exit 0, 0 errors
  - lint exit 0, 0 errors, no NEW warnings beyond the known 15
  - npm test: all pass, report count
  - npm run build: green, report route count
  - dev server 200 on /, /tools/qr-generator, /tools/pdf-compressor, /blog
  - 13 deletions each backed by a zero-importer grep output
  - qr-generator Lighthouse accessibility score improvement reported
  - git status clean, tag p1-a11y
  - PHASE REPORT + JSON, then STOP. Do not start P2.

END SESSION SCOPE

RUN PHASE: P1
```

---

## Report aane par main kya check karunga

| Check | Kya dekhunga |
|---|---|
| Intent discipline | 13 deletions aur kuch nahi — koi "bonus" file touch nahi hui |
| Proof | har deletion ke saath grep output (basename, not just name) |
| Copy | `faqs.ts` wording `page.tsx:284` se **verbatim** match kare |
| A11y | Lighthouse `label` + `color-contrast` audits gayab, a11y score barha |
| Build | route count 37 se kam na ho (deletion se koi route na toote) |
| Hygiene | `git status` clean, warnings 15 se zyada na hon |
| Deferral | P2/P3 items `DEFERRED_FINDINGS` mein explicitly hon |
