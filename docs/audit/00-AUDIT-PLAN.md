# Compixor AI — Hallmark × Headless UI Audit Plan (Phase-Wise)

**Repo:** `Compixor-Ai-creator/Compixor.Ai`
**Baseline commit:** `c8ea140` (branch `arena/6c98d590-compixor-ai`, == `main` at scan time)
**Scan date:** 11 Nov 2026
**Method:** static repo scan + `tsc` + `next lint` + `npm test` (browser/Lighthouse sandbox se possible nahi tha — Google Fonts fetch block hai)
**Status:** planning + baseline. Is turn mein **koi app code change nahi** kiya gaya.

---

## 0. Seedha jawab (TL;DR)

**Hallmark audit pehle, Headless UI baad mein — lekin Headless UI ki "inventory" Hallmark audit ke andar hi nikalni hai.**

Order:

```
P0  Hallmark baseline audit (read-only)  →  P1  a11y + slop fix pack
→  P2  Headless UI migration (sirf jo P0 ne list kiya)
→  P3  Hallmark craft pass (design quality)
→  P4  Deploy proof (aap ka "push hua par 100% deploy nahi hua" issue)
→  P5  Aap ka live test
```

Ek line ka rule:

> **Jo cheez delete ho sakti hai, usay pehle delete karo — migrate baad mein.**

Isi repo mein iski wajah hai: `Navbar.tsx` (37 KB), `CxArtCard.tsx` (16 KB), `RelatedPdfTools.tsx` (8.6 KB), aur 3 duplicate FAQ accordions — agar aap pehle Headless UI laga dein to aap un par mehnat karenge jo next phase mein delete hone hain.

**Agar sirf aik hi cheez kar sakte hain:** Hallmark audit karwayein (P0), kyunke woh read-only hai, kuch tootta nahi, aur baaki 4 phases ki planning usi se nikalti hai.

---

## 1. Aaj ki verified baseline (ground truth)

Yeh section isliye hai taake antigravity jo report de, aap usay is se **cross-check** kar sakein. Number aaj ke commit par verify kiye gaye hain.

### 1.1 Health baseline (commands + exact result)

| Check | Command | Result | Verdict |
|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | exit 0, 0 errors | 🟢 PASS |
| ESLint | `npm run lint` | exit 0, **0 errors / 15 warnings** (9 × `no-img-element`, 6 × `react-hooks/exhaustive-deps`) | 🟢 PASS |
| Unit tests | `npm test` | 7/7 pass (watermark engine) | 🟢 PASS |
| Prod build | `npm run build` | **sandbox mein fail** — sirf `next/font` Google Fonts fetch block. Repo defect nahi, lekin deploy risk hai (§6.5) | 🟡 UNKNOWN |
| Headless UI installed | `grep -r "@headlessui/react" src` | **0 imports** (sirf `tailwind.config.ts` mein plugin) | 🔴 P1 |

> **Note:** Build ka sandbox failure `Inter`, `Outfit`, `Playfair Display` teeno ke Google Fonts fetch par tha. Iska matlab build **network par depend** karta hai — Vercel par theek chalega, lekin kisi bhi restricted runner par nahi.

### 1.2 Jo already theek hai (purane audit doc par bharosa na karein)

`docs/website-audit.md` (7 Nov) ki kuch findings **already fix ho chuki hain**. Agar antigravity inhein "open P0" bata de, to woh report copy kar raha hai, verify nahi kar raha:

| Old finding | Aaj ka status | Evidence |
|---|---|---|
| `user-scalable=no` viewport | ✅ **FIXED** | `src/app/layout.tsx:46-54` — sirf `width` + `initialScale`, koi `maximumScale` nahi |
| Mobile nav `aria-hidden` + focusable links | ✅ **FIXED** | `src/components/CompixorNavbar.jsx:585` — `inert={!mobileOpen ? "" : undefined}` |
| FAQ heading par `role="button"` | ✅ **FIXED** | `HomeFaqAccordion.tsx:37-44`, `page.tsx:646-653`, `FaqSection.tsx:68` — sab `<h3><button aria-expanded aria-controls>` |
| Hero card links bina accessible name | ✅ **FIXED** | `HeroRightCard.jsx` mein 7 × `aria-label` (e.g. line 302) |
| Hero background blur orbs | ✅ **FIXED (home only)** | `page.tsx` mein `blur-3xl` = 0 |

### 1.3 Jo asli mein open hai (measured)

| # | Area | Measurement | Severity |
|---|---|---|---|
| 1 | Headless UI | installed **0 usages**; 8 hand-rolled a11y widgets (modal focus trap, 4 accordions, dropdown, 12 native selects, 10 checkbox toggles, 0 real `role="tab"`) | **P1** |
| 2 | Gradient text | `bg-clip-text` **15 jagah / 13 files** — 12 tool pages par **same** `from-purple-500 via-pink-500 to-amber-400` h1 | **P1 (slop)** |
| 3 | Dead code | `Navbar.tsx` 37 KB (0 imports), `CxArtCard.tsx` 16 KB, `RelatedPdfTools.tsx` 8.6 KB, `CustomerTestimonials.tsx`, `HeroArtCard.tsx` (43-byte shim), `container-text-flip-demo.tsx` | **P1** |
| 4 | Repo artifacts | root par `cx-art-card.{css,html,jsx}` + `cx-premium-card.html` + `hero-mobile-minimal.css` (~82 KB). `hero-mobile-minimal.css` ka content **paste** kar diya gaya hai `globals.css` line 1720 par (banner "File: hero-mobile-minimal.css" abhi bhi andar hai) | **P2** |
| 5 | CSS bloat | `globals.css` 2,081 lines + 512 (`hero-card.css`) + 190 (`perf-smooth.css`) + 133 (`mobile-a11y.css`) + 130 + 169 = **3,215 lines**; `!important` **128** baar | **P2** |
| 6 | Token drift | hardcoded hex colors TSX mein **472**; inline `style={{...}}` **92** | **P2** |
| 7 | Duplicate components | FAQ accordion **4 implementations** (`page.tsx`, `HomeFaqAccordion`, `FaqSection`, `BlogFaqAccordion`); related-tools **3** (`RelatedTools` used, `RelatedToolsGrid` used once, `RelatedPdfTools` dead) | **P2** |
| 8 | A11y coverage | 220 `<button>` vs 68 `aria-label`; `focus-visible` sirf **7** jagah | **P2** |
| 9 | Type hygiene | `: any` **43**, `console.log` **2** | P3 |
| 10 | God files | `passport-photo-client.tsx` 3,803 lines; `pdf-organizer-client.tsx` 2,400; `PdfWatermarkClient.tsx` 2,225; `QrGeneratorStudio.tsx` 2,125 | P3 |

### 1.4 Headless UI migration inventory (P0 audit isi ko confirm/refine karega)

| # | Current hand-rolled widget | File | Target primitive | Risk |
|---|---|---|---|---|
| 1 | FAQ accordions ×4 | `page.tsx`, `HomeFaqAccordion.tsx`, `FaqSection.tsx`, `BlogFaqAccordion.tsx` | `Disclosure` (+ ek shared component) | Low |
| 2 | Share dropdown (outside-click + `aria-expanded`) | `ShareToolButton.tsx:27-107` | `Menu` / `Popover` | Low |
| 3 | Modal: manual Tab-trap + scroll-lock counter + portal | `CompixorModal.tsx:98-129,188-220` | `Dialog` + `DialogBackdrop` + `DialogPanel` | **Medium** |
| 4 | Feedback modal (28 KB) + star rating state | `FeedbackWidget.tsx` | `Dialog`, `RadioGroup` | Medium |
| 5 | 12 native `<select>` (contact, dp-maker, passport, qr, watermark, what-users-say) | various | `Listbox` / `Combobox` | Medium |
| 6 | 10 checkbox/toggle-style controls, theme toggle | `ThemeProvider.tsx`, tool pages | `Switch` / `RadioGroup` | Low |
| 7 | Tab-like UI **bina** `role="tab"` | tool result panels | `TabGroup`/`Tab`/`TabPanels` | Medium |
| 8 | Mobile nav drawer | `CompixorNavbar.jsx` | `Dialog` ya `Disclosure` | **High** |

**Total: 8 widget families.** Phase 2 mein sirf yeh, ek primitive = ek commit.

---

## 2. Order kyun yeh hai (Hallmark → Headless UI)

| Wajah | Detail |
|---|---|
| **1. Evidence ki tarteeb** | Headless UI DOM/ARIA/class structure badal deta hai. Agar pehle migration ho, to audit jo naapta hai woh "naya" state hai — aap ke paas comparison baseline nahi bachta. |
| **2. Delete pehle, build baad mein** | Hallmark ka aadha output "yeh hatao" hota hai (12 duplicate gradient h1, dead Navbar, 4 FAQ copies, 82 KB artifacts). Pehle migrate karna = delete hone wali cheezon par kaam. |
| **3. Risk containment** | Migration higher-risk hai (focus, portal, transition, SSR). Cheap + reversible fixes pehle → agar migration bigde to blast radius chhota aur rollback point saaf. |
| **4. Audit hi migration list deta hai** | P0 audit "interaction primitive inventory" banata hai. Us list ke bagair migration = guesswork. |

**Exception rule (ek hi):** agar koi **P0 a11y bug** kisi hand-rolled widget mein hai jo migration list par bhi hai, to Phase 1 mein sirf 1-line defensive patch karein (`inert`, `aria-expanded`, label) — widget rewrite Phase 2 mein. Double kaam se bachne ke liye rewrite jaldi na karein, warna phases mix ho jayenge aur rollback mushkil hoga.

**Agar aap dono ek hi session mein karwana chahte hain:** na karein. P0 aur P2 ke darmiyan kam az kam ek green build + ek commit gate rakhein.

---

## 3. Phase map (gates ke saath)

Har phase ka **exit gate** pass hona zaroori hai. Gate fail = next phase start nahi.

| Phase | Kya karna hai | Kya **NAHI** karna | Exit gate | Rollback |
|---|---|---|---|---|
| **P0 — Baseline audit (read-only)** | Health baseline, slop ledger (file:line), primitive inventory, dead-code list, copy-accuracy check, 8-dimension rubric score | Koi file edit nahi. Koi `npm install` nahi. Git clean rahe | Report + 4 artifacts + rubric scores, sab **evidence ke saath**; `git status` clean | N/A (read-only) |
| **P1 — A11y + slop fix pack** | Sirf P0/P1 items: dead code delete, duplicate FAQ → 1 component (bina Headless UI), focus-visible, contrast, labels, copy correction | Redesign nahi, Headless UI nahi, CSS refactor nahi, tool logic nahi | `tsc` + `lint` + `test` green; home + 3 tool routes 200; diff ≤ 8 files | `git revert <sha>` |
| **P2 — Headless UI migration** | §1.4 ki 8 families, risk order: Disclosure → Menu → Listbox → Switch → Dialog → Tabs → Nav drawer. Har primitive ke baad commit | Naye design tokens nahi, CSS rewrite nahi, 2 primitives ek commit mein nahi | Keyboard matrix pass (Tab/Shift-Tab/Esc/↑↓/Home/End/Enter/Space), screen-reader name non-empty, focus restore verified, no hydration error | Per-commit revert |
| **P3 — Hallmark craft pass** | Typography scale, spacing rhythm, surface honesty (orbs/gradient text), card hierarchy, dark-mode parity, contrast audit | Naya feature nahi, route add nahi, copy meaning change nahi | Rubric score before/after; contrast ≥ 4.5:1; CLS-safe; dark + light dono screenshots | `git revert` |
| **P4 — Deploy proof** | §6 ke fixes: version stamp, health `commit`, updater sync, post-deploy verifier | UI change nahi | `scripts/verify-deploy.sh` → sab PASS, live commit == tested commit | Vercel instant rollback / `git revert` |
| **P5 — Aap ka live test** | `02-LIVE-TEST-CHECKLIST.md` | — | 12/12 tools happy path + mobile + keyboard | Report failing step |

**Suggested session split:** P0 = 1 session. P1 = 1. P2 = 2–3 (8 primitives). P3 = 1–2. P4 = 1. Aik session = aik phase. Yahi "AI ghalti" ka sabse bara bachao hai.

---

## 4. Phase 0 ke 4 mandatory artifacts

Agar antigravity sirf prose report de aur yeh 4 cheezein na de, to report **reject** karein.

### A. Health baseline table
Har command + exit code + output ka 3-line tail. Bina iske koi "build pass" claim valid nahi.

### B. Slop ledger (har row mein file:line)
| id | severity | file:line | pattern | count | user impact | fix (1 line) |
|---|---|---|---|---|---|---|

Pattern vocabulary fix rakhein taake score reproducible rahe: `gradient-text`, `blur-orb`, `glass-card-overuse`, `badge-noise`, `duplicate-section`, `dead-component`, `token-drift`, `inline-style`, `!important-override`, `fake-tab`, `no-focus-visible`, `contrast-fail`, `copy-contradiction`.

### C. Interaction primitive inventory
§1.4 jaisa table + har row par: current ARIA status, keyboard status, dupe count, migration target, risk.

### D. Rubric score (8 dimensions, 0–10 each)

| Dimension | Weight | 0 kya | 10 kya |
|---|---|---|---|
| Typography system | 10% | 3+ fonts, random sizes | 2 fonts max, scale + tabular numbers |
| Color & contrast | 15% | hardcoded hex, <4.5:1 | tokens only, AA+ |
| Spacing & rhythm | 10% | har section apna padding | 4pt/8pt scale, consistent |
| Surface honesty | 15% | orbs, gradient text, glass everywhere | flat intentional surfaces |
| Motion discipline | 5% | har cheez animate, no reduced-motion | purposeful, reduced-motion respected |
| Copy & IA | 15% | contradictions, 4× repeat | ek authoritative statement |
| Component consistency | 15% | duplicate implementations | ek primitive, ek implementation |
| A11y semantics | 15% | missing names, fake tabs | full ARIA + keyboard |

**Rule:** har dimension ka score **counts** ke saath aana chahiye (e.g. "Color 4/10 — 472 hardcoded hex, 92 inline style"). "Overall 78/100" jaise bare numbers **reject**.

---

## 5. Anti-mistake protocol ("AI ghalti" layer)

### 5.1 Evidence ladder — sirf E1/E2 "proof" hain

| Level | Kya | Counts as proof? |
|---|---|---|
| **E1** | Command output (exit code + tail), HTTP status + body, file:line | ✅ |
| **E2** | Screenshot / Lighthouse JSON / test log | ✅ |
| **E3** | Reasoning ("should work", "likely fixed") | ❌ tag `UNVERIFIED` |
| **E4** | Yaad se claim (model memory) | ❌ **banned** |

### 5.2 Banned phrases (aaye to report fail)
`should work`, `probably`, `looks good`, `100% deployed`, `successfully pushed` (bina SHA ke), `all tests pass` (bina count ke), `fixed` (bina file:line ke), `verified in browser` (bina step list ke).

### 5.3 9 failure modes + rule

| # | Failure mode | Repo evidence | Rule |
|---|---|---|---|
| 1 | **Phantom deploy** — "push ho gya" = deployed | `update_vps.sh` sirf `main` branch se `main.py` uthata hai | Deploy claim sirf tab jab live commit SHA match kare (§7) |
| 2 | **Partial deploy** — kuch files gaye, kuch nahi | `update_vps.sh` **sirf `main.py`** copy karta hai; `pipeline/`, `bg_api_single.py`, `bg_remove.py`, `requirements.txt` kabhi sync nahi hotay | "Deployed" = service matrix ka har row PASS |
| 3 | **Purana audit copy karna** | `docs/website-audit.md` mein 4 findings already fixed | Har finding dobara verify; fixed ko "verified fixed" likhna |
| 4 | **Headless UI API hallucination** | v2.2.10 installed (v0.x/1.x se API different) | Code likhne se pehle `node_modules/@headlessui/react/dist/index.d.ts` parhein |
| 5 | **Naya component create karna** | Pehle se 3 related-tools + 4 accordions hain | Likhne se pehle `grep -rn "<Name>" src` — existing ho to edit, duplicate na banayein |
| 6 | **CSS append** | `globals.css:1720` par paste kiya gaya `hero-mobile-minimal.css` banner | Naya global CSS nahi; token/utility use karein |
| 7 | **Scope creep** — 5 concerns ek commit mein | 3,803-line god file already mojood | Diff budget: ≤ 8 files, ≤ 400 lines, 1 concern per commit |
| 8 | **Working tool todna** | 9/12 tools pure client-side (core USP) | `pdf-lib`, `pako`, `jszip`, canvas, WASM pipelines ko touch nahi; sirf UI layer |
| 9 | **Capability guess** | — | Agar browser/Lighthouse nahi chala sakta → `BLOCKED: no browser`, guess nahi |

### 5.4 Git discipline
- Kaam branch par, PR ke zariye. `main` par direct push nahi.
- `--force`, `--no-verify`, `git add .` **banned**.
- Commit format: `fix(a11y): add focus-visible ring to tool card actions` + body mein evidence line.
- Har phase ke baad tag: `p0-baseline`, `p1-a11y`, `p2-headlessui`, `p3-craft`, `p4-deploy-proof` → rollback 1 command.

---

## 6. "Push ho gya par 100% deploy nahi hota" — asli wajah (repo se)

Yeh aap ka sabse specific masla hai, aur iske **6 concrete causes** is repo mein mojood hain:

| # | Root cause | Evidence | Fix (P4) |
|---|---|---|---|
| **6.1** | **Backend updater sirf aik file uthata hai** | `update_vps.sh` → `curl .../main/hostinger-backend/main.py -o main.py`. `hostinger-backend/pipeline/*.py` (5 modules), `bg_api_single.py`, `bg_remove.py` kabhi update nahi hotay | Script `git clone/pull` + `rsync` kare (poora dir), ya SHA-pinned tarball |
| **6.2** | **Branch mismatch** | Script URL `main` par **hardcoded**: `raw.githubusercontent.com/Compixor-Ai-creator/Compixor.Ai/main/...` — feature branch par push = live par kuch nahi | Deploy sirf `main` se; script SHA parameter le |
| **6.3** | **CDN cache** | `raw.githubusercontent.com` cache (minutes) — turant re-run par purana file | Cache-bust: `?sha=<commit>` query + `sha256sum` verify |
| **6.4** | **Koi version stamp nahi** | `src/app/api/health/route.ts` sirf `status/timestamp/service/environment` deta hai — **commit SHA nahi** | `NEXT_PUBLIC_BUILD_SHA` + health mein `commit`, `buildTime` |
| **6.5** | **Build-time network dependency + env drift** | 3 × `next/font/google` (sandbox mein build fail hua); `.env.example` mein **13 keys**, 3 API URLs aur **hardcoded fallbacks** (`api-config.ts:9`, `backgroundMatting.ts:110`) — env missing = chup-chaap purana host | Fonts self-host ya build par tolerate; P4 mein env matrix verify (Vercel env vs `.env.example`) |
| **6.6** | **Do services, ek updater** | nginx: `/remove-bg` → `:8000`, `/` → `:8001`; `update_vps.sh` sirf `compixor-img2word` (8001) restart karta hai | Service matrix: dono services ka restart + health |

**Iska nateeja:** "push ho gya" ka matlab aaj ke setup mein kabhi bhi "live 100%" nahi ho sakta — kyunke proof ka koi mechanism hi nahi. P4 sirf yahi theek karta hai.

---

## 7. Deploy proof protocol (P4 ka gate)

Yeh 5 checks pass hon tabhi "deployed" keh sakte hain:

| # | Check | Expected |
|---|---|---|
| 1 | `git rev-parse --short HEAD` == `git ls-remote origin main` | same SHA |
| 2 | `curl -s https://compixor-ai.cloud/api/health` | `commit` == wahi SHA, `buildTime` aaj ka |
| 3 | Frontend headers | `x-vercel-id` present, `x-vercel-cache: MISS` pehli request par |
| 4 | Backend: `curl https://api.compixor-ai.cloud/health` + VPS par `sha256sum main.py` vs repo | hash match |
| 5 | Functional smoke: 3 API calls (img2word, remove-bg, health) | 200 + valid payload |

Aur rolling deploy ke liye: `curl -s https://compixor-ai.cloud/api/health | grep commit` 60 second tak poll — naya SHA aane par hi "deployed" announce karein.

`scripts/verify-deploy.sh` isi ko automate karta hai (Phase 4 ke baad `commit` field add hone par full PASS dega).

---

## 8. Aap ka live test (P5) — short version

Poori checklist: `docs/audit/02-LIVE-TEST-CHECKLIST.md`

Sabse pehle **3 killer tests** (agar yeh fail hon, baaki sab chhor dein):

1. **Deploy proof:** `bash scripts/verify-deploy.sh` — sab PASS?
2. **Paisa wala tool:** `/tools/pdf-compressor` par 5 MB PDF → download → Adobe/Preview mein khule? (client-side pipeline intact?)
3. **Keyboard-only:** `/` par `Tab` dabate jayein — 20 tabs tak focus **kabhi ghayab na ho**, mobile drawer band ho to andar ka focus na aaye.

---

## 9. Antigravity ka output mujhse confirm kaise karwayein

Antigravity se report lene ke baad yeh template bhar ke mujhe bhejein (ya report jaisi hai waisi paste kar dein):

```
PHASE: P0 | P1 | P2 | P3 | P4
EXIT_GATE: PASS | FAIL
COMMIT: <sha>
COMMANDS: <cmd> → exit <code>
FILES_CHANGED: <n> (<list>)
FINDINGS: <n> (<n> E1, <n> E2, <n> UNVERIFIED)
BLOCKED: <list ya none>
QUESTION FOR REVIEWER: <agar koi>
```

Main in 6 cheezon par check karunga:
1. Claims vs §1.3 baseline (jo aaj open tha, woh band hua? jo already fixed tha, usay dobara "fix" to nahi kiya?)
2. Diff budget aur scope (P1 mein Headless UI aa gaya? P3 mein copy change?)
3. `commit`/deploy claims — kya live SHA actually match karta hai?
4. Rubric scores counts ke saath hain ya bina?
5. Koi `UNVERIFIED` item gate pass kar raha hai?
6. Rollback possible hai? (tag + revert path)

---

## 10. Risk register

| Risk | Chance | Impact | Mitigation |
|---|---|---|---|
| Migration se modal/nav toot jaye | Medium | High | Ek primitive per commit, tag, keyboard matrix |
| Agent "done" bole par tool kaam na kare | **High** | High | E1 evidence + user live test + smoke tests |
| PDF/DOCX pipeline break ho | Low | **Critical** | UI-only allowlist; `npm test` + 3-file manual test |
| Deploy phir bhi partial | High | Medium | §7 ka 5-check protocol, `verify-deploy.sh` |
| Slop score "sudhar" jaye par design bigde | Medium | Medium | P3 se pehle rubric baseline, before/after screenshots |
| Scope creep (12 tool pages ek saath) | High | Medium | Diff budget, ek page per commit |

---

## 11. Aage kya

- `01-ANTIGRAVITY-MASTER-PROMPT.md` → copy-paste master prompt (phase-locked, evidence-only)
- `02-LIVE-TEST-CHECKLIST.md` → aap ke haath ka test plan
- `scripts/verify-deploy.sh` → deploy proof automation

Chahein to main **P0 khud chala kar** baseline report bana sakta hoon (browser ke bagair: static + build + lint + route inventory), phir antigravity ki report us se compare karenge — do azaad readings = sabse mazboot verification.
