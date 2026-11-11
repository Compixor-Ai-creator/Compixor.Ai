# 10 — Production release: PR #6 merged, `compixor-ai.cloud` on `ae0f5ec`

**Date:** 11 Nov 2026
**PR:** [#6](https://github.com/Compixor-Ai-creator/Compixor.Ai/pull/6) — **MERGED** at 08:34:55Z
**Merge commit:** `ae0f5ec4e6891d3581e5cb963e94819e53a9a718`
**Production deployment:** `dpl_4NQLKiewyWuGemwq52DjzFWMxvFM` — **READY / PROMOTED** (107.8 s), alias assigned
**Live domain:** `https://compixor-ai.cloud`

---

## 1. Why the merge did not just work

`gh pr merge 6 --merge` refused:

```
X Pull request #6 is not mergeable: the merge commit cannot be cleanly created.
```

The look at local git explained both the refusal and the earlier "branch silently lost its commits"
incidents: **the sandbox checkout was shallow** (`.git/shallow` pinned `c8ea1405` and `468ea08` as
roots). With no real merge base, `git merge-base origin/main HEAD` exited 1 and
`git merge` refused to touch unrelated histories — while `git rev-list --count` happily returned
garbage. After `git fetch --unshallow` the repo reported 311 commits on `main`, merge base `c8ea1405`.

`main` had moved 7 commits ahead of the branch's base:

| Commit | Effect on the merge |
|---|---|
| `45186bb` chore(cleanup): prune 13 dead components | deletes `Navbar`, `FaqSection`, `HomeFaqAccordion`, `CustomerTestimonials`, `CxArtCard`, `RelatedPdfTools`, `container-text-flip-demo`, prototype artifacts |
| `70f33c1` copy: FAQ privacy claims | touches `src/data/faqs.ts` |
| `34d6f0a` / `3cf4f6f` / `4ab2191` a11y (P1) | qr-generator files |
| `cf8875b` docs merge | `docs/audit/*` + `scripts/verify-deploy.sh` |
| `468ea08` fail loudly on feedback 503 | `src/app/api/feedback/route.ts` |

**One conflict only**, `docs/audit/02-LIVE-TEST-CHECKLIST.md` (add/add). Main's copy and the branch's
copy differed by exactly two lines — the pointer to `08-DEPLOY-IDENTITY.md` §4. Resolved by keeping the
branch copy, i.e. main's text plus the pointer.

**Dangling-import check before committing the merge:** grepped the whole tree for imports of all eight
pruned components — zero hits, so deleting them cannot break a build. Confirmed afterwards by a full
build (37 pages).

Merge result: 18 files changed, +95 / −3337 lines relative to the branch.

## 2. Gates on the merged tree (not on the branch tip)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | 14 warnings, 0 errors |
| `npm test` | 7 pass / 0 fail |
| `npm run build` | ✓ 37 static pages |
| merge pushed as `34c9f22`, PR state | `mergeable=MERGEABLE` → merged |

## 3. Deploy ledger

| Deployment | Commit | Target | State |
|---|---|---|---|
| `dpl_4NQLKiewyWuGemwq52DjzFWMxvFM` | `ae0f5ec` | production | **READY / PROMOTED**, 107.8 s |
| `dpl_6S6GJFh9r1Wps98FuaiCEvr5UteZ` | `f579775` | preview | READY, 72.9 s |
| `dpl_B8hGjFxDuEZb5fpdq669xaoUUJZQ` | `7bba02f` | preview | READY, 88.8 s |
| `dpl_BPnRhrQTRqJ8Z8NDxjQSrJsaYCjN` | `c8ea1405` | production | **ERROR** — the `next/font` failure this work exists to kill |

Production now serves: self-hosted fonts (no `fonts.googleapis.com` at build or runtime), the build
stamp, the pinned `next@14.2.35`, the P1 a11y work, the fail-loudly feedback route, and P2 Wave A
commit 1 (FAQ accordions on `Disclosure`).

## 4. Aap khud verify karein (2 min)

```bash
cd Compixor.Ai
EXPECTED_SHA=ae0f5ec4e6891d3581e5cb963e94819e53a9a718 bash scripts/verify-deploy.sh
```

Manual, in the browser (hard refresh / private window):

- [ ] `GET https://compixor-ai.cloud/api/health` → `"commit": "ae0f5ec4e689"` (12 chars)
- [ ] Home page source → `<meta name="compixor-build" content="ae0f5ec4e689">`
- [ ] Network tab → **no** `fonts.googleapis.com`; fonts load from `/_next/static/media/*.woff2`
- [ ] Home FAQ: first question open, open another → both stay open, click again → closes
- [ ] Blog post FAQ: opening a question closes the previous one, panel slides instead of snapping
- [ ] Keyboard: `Tab` to a question, `Enter`/`Space` toggles, `aria-expanded` flips in DevTools
- [ ] Home FAQ search "watermark" → matches auto-open, counter shows `Showing N of 8`, `Clear filter` resets

Rollback is available and cheap: the deployment is `isRollbackCandidate: true`, so Vercel's
"Promote an existing deployment" or `git revert ae0f5ec` both work.

## 5. Ab bhi baaki (jo is merge se theek nahi hua)

| Item | State |
|---|---|
| Vercel env vars | **still only `ADMIN_PASSWORD`** (re-checked) → `/api/feedback` returns **503** to every visitor; feedback is not being stored |
| Wave A commit 2 (share `Menu`) | not started; +10 kB first-load was paid by commit 1, expect a smaller marginal cost — measure, do not assume |
| Wave A commits 3–5 (`Listbox`, `Switch`, `TabGroup`) | not started |
| Wave B (`CompixorModal` `Dialog`, FeedbackWidget) | blocked on the endpoint |
| Wave C (mobile nav drawer) | last, highest risk |
| Backend version stamp | `verify-deploy.sh` still WARNs on backend `version`; needs a VPS deploy |
| `src/data/faqs.ts` | still zero importers → delete in the first P2 cleanup commit |

## 6. Repo state

- Session branch `arena/6c98d590-compixor-ai`: merged into `main`, still checked out locally.
- `main`: `ae0f5ec` = merge of `34c9f22` (the base merge) and previous `468ea08`.
- Tags: `p1-a11y`, `p1-verified`, `p2a-disclosure`.
- This note is committed on the session branch after the merge, so it is **not** on `main` until a
  follow-up docs PR lands. Ask and I will open that one-line PR.
