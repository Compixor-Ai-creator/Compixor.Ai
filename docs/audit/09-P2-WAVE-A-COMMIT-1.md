# 09 — P2 Wave A, Commit 1: FAQ hand-rolled accordion → Headless UI `Disclosure`

**Date:** 11 Nov 2026
**Branch:** `arena/6c98d590-compixor-ai`
**Base commit:** `fb74002`
**Files changed: exactly 2** (as scoped in `07-P2-WAVE-A-SESSION-PACK.md`)

| File | Change |
|---|---|
| `src/components/BlogFaqAccordion.tsx` | `<Disclosure>` + `<h3><DisclosureButton>` + always-mounted `DisclosurePanel`, single-open preserved, collapse animation added |
| `src/app/page.tsx` | homepage inline FAQ → `<Disclosure>` per question, multi-open kept, search auto-open kept, ~25 lines of manual state deleted |

No other app file touched. `@headlessui/react@2.2.10` was already a dependency (installed in `c8ea140`), so no dependency change.

---

## 1. The finding that changed the implementation

The pack specified `<DisclosurePanel unmount={false}>` + `max-h-0 / max-h-96` CSS. **That does not work** — it is a silent animation killer, not a compile error.

Headless UI v2 renders a closed panel like this (verified by server-rendering the primitive, not by reading docs):

```
<div id="headlessui-disclosure-panel-:R2:" hidden="" style="display:none">A</div>
```

`display:none` cannot be transitioned. A `max-h-0 → max-h-96` animation on that element is dead code: the panel snaps open.

**Fix used instead:** `<DisclosurePanel static>`. `static` keeps the panel in the DOM in both states with no `hidden` attribute, and Headless UI puts a real marker on it when open:

```
open   -> <div data-headlessui-state="open" data-open="" class="… data-[open]:max-h-96 …">
closed -> <div data-headlessui-state=""      class="… max-h-0 opacity-0 …">
```

So the collapse is CSS on `data-open`, exactly as intended by the pack — just driven by the attribute instead of by `unmount`.

Verified in the compiled stylesheet (`data-[open]` utilities do get generated):

```
.data-\[open\]\:max-h-96[data-open]{max-height:24rem}
.data-\[open\]\:max-h-\[32rem\][data-open]{max-height:32rem}
.data-\[open\]\:opacity-100[data-open]{opacity:1}
.data-\[open\]\:pt-1[data-open]{padding-top:.25rem}
.data-\[open\]\:pb-4[data-open]{padding-bottom:1rem}
.sm\:data-\[open\]\:pb-5[data-open]{padding-bottom:1.25rem}
```

## 2. Second finding: `Disclosure` has no controlled `open` prop

`@headlessui/react@2.2.10` types: `DisclosureProps … , { defaultOpen?: boolean }` and `DisclosurePropsWeControl = never`. There is **no** `open`/`onChange`. Reactively forcing a panel open from parent state is therefore impossible without remounting.

That forced two design decisions:

**a) Blog accordion — single-open.** The previous code kept `openIndex` in the parent. Now each `Disclosure` owns its own state, and the "only one open" rule is enforced by holding each panel's own `close()` (the render-prop API) in a ref array and calling every *other* one when a question is opened. No remount, so closing siblings animates instead of snapping.

**b) Homepage — multi-open + search auto-open.** Open state is per-item, so multi-open is free. Search still has to force-open every match. Expressed with a remount key instead of state:

```tsx
const disclosureKey = `${faq.id}-${faqSearchActive ? 'filtered' : 'default'}`;
<Disclosure key={disclosureKey} defaultOpen={faqSearchActive || originalIndex === 0}>
```

Keys are stable across keystrokes, so refining a query does not re-collapse a question the reader opened by hand, and "Clear filter" returns to the previous default (first question open) — the same end state the old `setOpenFaqIndices([0])` produced.

Deleted as a result: `openFaqIndices` state, `toggleFaq()`, and the index-matching branch inside `handleFaqSearch()`.

## 3. One behaviour bug fixed on the way

Old home FAQ: `isOpen = openFaqIndices.includes(i) || faqSearch.trim().length > 0`. While filtering, every visible answer was forced open and clicking a trigger changed state that the `|| searching` term immediately overrode — **clicks did nothing during search**. Now a click collapses an individual answer even mid-filter. This is a deliberate change; nothing else about filtering changed.

## 4. Evidence

Environment limitation up front: **this sandbox has no browser** (no Chromium, and `playwright install` needs a CDN it cannot reach), so the pack's Playwright screenshots could not be produced. Instead of claiming "looks fine", the interaction was tested in a real DOM (`jsdom` + `react-dom/client` + real `MouseEvent`/`KeyboardEvent`), which is the part screenshots cannot prove anyway. Two harnesses are committed and re-runnable:

```bash
npm install --no-save jsdom        # harness dep, intentionally not in package.json
npx tsx docs/audit/checks/faq-blog-disclosure.dom.mts   # 15 assertions
npx tsx docs/audit/checks/faq-home-disclosure.dom.mts   # 11 assertions
```

**Blog accordion — 15/15 PASS**

| Assertion | Result |
|---|---|
| 3 triggers, first open by default | PASS |
| all panels stay in DOM while closed (3 of 3) | PASS |
| closed panel has `data-headlessui-state=""` and **no** `display:none` | PASS |
| `max-h-0` + `data-[open]:max-h-[32rem]` classes present while closed | PASS |
| open panel carries `data-open`, closed one does not | PASS |
| clicking question 3 opens it and closes question 1 (single-open) | PASS |
| exactly one `data-open` panel after the click | PASS |
| clicking an open question collapses it (all closed) | PASS |
| `Enter` on a focused trigger opens, `Space` toggles closed | PASS |
| chevron gains/loses `rotate-180` with state | PASS |

**Homepage FAQ — 11/11 PASS**

| Assertion | Result |
|---|---|
| 8 triggers rendered as `<h3><button>` | PASS |
| only the first question open on load | PASS |
| anchor ids preserved (`id="what-is-compixor-faq"`) and answer ids (`faq-answer-*`) | PASS |
| multi-open: opening 4 keeps 1 open | PASS |
| clicking an open question closes only that one | PASS |
| typing "watermark" filters the list | PASS |
| search auto-opens **every** remaining match | PASS |
| "Showing N of 8" counter renders | PASS |
| clearing the filter restores all 8 | PASS |
| clearing the filter returns to first-open-only | PASS |

**Gates**

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | exit 0, no output |
| `npm run lint` | 14 warnings, 0 errors (≤ 15 budget; none in the two touched files) |
| `npm test` | 7 pass / 0 fail |
| `npm run build` | ✓ 37 static pages |
| `/` · `/blog` · `/blog/passport-size-photo-maker-online-free` · `/tools/qr-generator` | 200 · 200 · 200 · 200 (`next start`, local) |
| SSR markup, `/` | 8× `<h3 class="m-0"><button … aria-expanded>`, first `true`, 8 `faq-answer-*` ids |
| SSR markup, blog post | 5× h3>button, 5 static panels, 5 `data-[open]:max-h-[32rem]` |
| git status | clean after commit; tag `p2a-disclosure` |
| Vercel preview `dpl_6S6GJFh9r1Wps98FuaiCEvr5UteZ` ← `f579775` | **READY** in 72.9 s, `preview`/`STAGED`, branch alias assigned |

The preview build is the deploy proof that matters: `f579775` builds through the same pipeline that ERRORed on `c8ea1405` (Google Fonts).

## 5. Cost (measured, not estimated)

Two full builds, one with the change stashed:

| Route | First Load JS before | after | Δ |
|---|---|---|---|
| `/` | 167 kB | 177 kB | **+10 kB** |
| `/blog/[slug]` | 115 kB | 125 kB | **+10 kB** |
| `/blog` | 153 kB | 153 kB | 0 (does not use the accordion) |
| `/tools/qr-generator` | 217 kB | 217 kB | 0 |
| shared by all | 87.6 kB | 87.6 kB | 0 |

Per-route size barely moves (21.2 → 21 kB), so the 10 kB is the Headless UI runtime for the disclosure family. Expect the marginal cost of families 2–5 (Menu, Listbox, Switch, TabGroup) to be much smaller now that the core is already in the bundle — worth confirming in commit 2 rather than assuming.

## 6. Deviations from the pack (all deliberate)

1. `static` instead of `unmount={false}` — `unmount={false}` yields `display:none`, which kills the animation it was supposed to protect.
2. No Playwright screenshots — no browser in this environment. Visual + keyboard pass is still a user task (see §7).
3. Search auto-open implemented via remount key, not controlled state — `Disclosure` has no controlled mode.
4. Blog FAQ answers now wrapped in `<p>` inside the panel, and the trigger sits inside `<h3>` (it had no heading before) — both required to preserve semantics while moving to `DisclosureButton`.

## 7. Deferred / still open

| Item | Why deferred |
|---|---|
| Visual + keyboard pass in a real browser (light/dark, 1440 ≈ 390) | needs a browser; use `docs/audit/02-LIVE-TEST-CHECKLIST.md` style screenshot pass on the preview URL |
| Wave A commit 2 (share `Menu`) | one family per commit |
| Wave A commits 3–5 (`Listbox`, `Switch`, `TabGroup`) | as above |
| Wave B (`CompixorModal` `Dialog`, FeedbackWidget) | needs the feedback endpoint; Vercel still has only `ADMIN_PASSWORD` |
| Wave C (mobile nav drawer) | highest risk, only after A and B are green |
