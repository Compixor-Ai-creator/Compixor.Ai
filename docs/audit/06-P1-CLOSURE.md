# P1 Closure Review — Deployment Verified Independently

**Date:** 11 Nov 2026 · **Branch:** `arena/6c98d590-compixor-ai` (docs only)
**Method:** Vercel API (project `compixor-ai`, team `team_zFpKdYFukCoayURL2tJRWCmX`) + repo inspection at `c8ea1405`
**Verdict:** P1 is **deployed**. The agent's three live markers were **invalid by construction**, so its "NOT FOUND" proved nothing. P1 also shipped a **no-op commit** and left a **production data-loss bug** open.

---

## 1. Deployment — verified, not inferred

Project: `compixor-ai` (`prj_meRb42XvZg9gAFLxOMLUVMHhjv7T`), production branch `main`, domain `compixor-ai.cloud`.

| Deployment | Commit | Message | State | Created (UTC) | Ready (UTC) |
|---|---|---|---|---|---|
| `dpl_G8AFRMrph135xnbVJN8pQwqhHRSb` | `cf8875b9` | docs(audit): merge audit docs + verify-deploy (PR #6) | READY / PROMOTED | 06:27:39 | **06:29:16** |
| `dpl_2ek53C6LnTECV3PzmVSD6GzHkLuV` | `4ab21919` | fix(a11y): close remaining contrast failures (P1e) | READY / PROMOTED | 06:26:40 | **06:27:58** |

Both deployments carry the P1 work (`cf8875b9` is a descendant of `4ab21919`). The production alias `compixor-ai.cloud` points at `cf8875b9`.

### Timing explains the "cache HIT" story

| Event | Time (UTC) |
|---|---|
| P1e build ready | 06:27:58 |
| `verify-deploy.sh` run | **06:27:50** (8 s before P1e was ready) |
| Marker curl | **06:29:04** (12 s before the merge deploy was ready) |

The verification ran *while Vercel was still finishing the builds*. That, plus invalid markers, produced three misleading "NOT FOUND" lines.

---

## 2. Why all three markers were invalid

| Marker | Target | Why it can never appear in `curl` HTML |
|---|---|---|
| `id="qr-color-pattern"` | `QrGeneratorStudio.tsx` | `qr-generator/page.tsx:23-24` mounts it as `dynamic(() => import('./QrGeneratorStudio'), { ssr: false })` → **never server-rendered** |
| `Content Parameters</h2>` | same component | same reason |
| `9 tools run locally in your browser` | `src/data/faqs.ts` | **`faqs.ts` has zero importers in the whole repo** — nothing renders it |

**Rule for P4:** a deploy marker must be (a) server-rendered, and (b) sourced from a file that is actually imported. Otherwise it is theatre.

---

## 3. P1b was a no-op

`src/data/faqs.ts` (18,975 bytes) is imported by **no file** (checked `src`, tests, config, repo-wide). The "universal 100% local" copy the P0 audit flagged lives in dead data, so the P1b commit changed copy that no user can see.

Live copy is already accurate:
- `src/app/page.tsx:284` — 9 local + 3 HTTPS (authoritative)
- `src/data/toolsPrivacy.ts:85-98` — `processingType: 'server'` for passport-photo / pdf-to-word ✅
- `src/components/PrivacyBadge.tsx`, `src/components/Footer.tsx:36` — qualified wording

**Decision:** `faqs.ts` belongs on the dead-code list (delete in P2 cleanup), not on a copy-fix list. Any future FAQ render must use it deliberately, not by accident.

---

## 4. Blast radius the report understated

`ToolHowToVictory.tsx` is imported by `ToolSeoSection.tsx`, which is used by **13 tool pages** (`add-watermark`, `full-dp-maker`, `img-to-word`, `passport-photo`, `pdf-compressor`, `pdf-organizer`, `pdf-to-word`, `protect-pdf`, `qr-generator` ×2, `remove-watermark`, `unlock-pdf`, `word-compressor`).

P1e changed badge **backgrounds** there (`bg-indigo-500 → 600`, `bg-emerald-500 → 700`) and several `text-emerald-600 → 700`. So the commit titled "on qr generator page" actually restyled the SEO section of every tool page — and only qr-generator was re-audited.

Not wrong (contrast improved), but **verified scope ≠ changed scope**. Needs a spot check on ≥2 other tool pages plus screenshots before P3 snapshots become the "before" set.

---

## 5. Production bug found: only one env var is configured

`list_env_vars` on the Vercel project returns **exactly one** variable:

| Key | Target |
|---|---|
| `ADMIN_PASSWORD` | production |

`.env.example` expects 13. Missing in production:

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `FEEDBACK_SALT`, `IP_HASH_SALT`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BG_API_URL`, `NEXT_PUBLIC_BG_REMOVE_API_URL`, `NEXT_PUBLIC_IMG2WORD_API_URL`.

### Consequence 1 — feedback is silently lost (data loss)

`src/lib/supabase.ts:19-22` returns `null` when URL/key are missing.
`src/app/api/feedback/route.ts:238` then does `fallbackStore.unshift(...)` — an **in-memory** array (`route.ts:40-41`) and returns success.

On Vercel each serverless instance has its own memory, recycled constantly. So:
- the user sees "thanks for your feedback"
- the record disappears with the instance
- the Supabase-only safeguards (5/day IP rate limit, duplicate rejection, lines 183-215) never run
- `/admin/feedback` reads Supabase → shows nothing

### Consequence 2 — IP hashing uses a public salt

`route.ts:57` falls back to `'compixor-client-side-privacy-salt'` — a string committed to a public repo. Any stored `ip_hash` is reversible by dictionary attack, which undermines the privacy claim the site makes.

### Consequence 3 — API hosts are hardcoded fallbacks

`src/lib/api-config.ts:7-9` and `src/utils/backgroundMatting.ts:104-110` fall back to `https://api.compixor-ai.cloud`. It works today; when the backend moves, the frontend silently keeps talking to the old host.

**This is the exact shape of the user's original complaint:** deploy says 100%, feature is not 100%.

---

## 6. `verify-deploy.sh` run was void

The pasted run shows:

```
PASS local HEAD   47aa0992ac62 (master)
WARN local 'master' != deploy branch 'main'
WARN working tree clean   70 uncommitted item(s)
WARN remote origin/main   could not read
```

That is a **different worktree** (branch `master`, HEAD `47aa0992`, 70 dirty files) with no remote access — not the tree that produced `cf8875b9`. Its git section proves nothing, and its `FAIL 0` is not evidence of anything.

---

## 7. Close-out checklist (P1.5 — before P2)

| # | Task | Owner | Evidence |
|---|---|---|---|
| 1 | Set the 11 missing env vars in Vercel (production + preview) | user | `list_env_vars` shows them, values from `.env.local` |
| 2 | Redeploy so the new env applies | user | new deployment ID |
| 3 | Make `/api/feedback` **fail loudly** when Supabase is absent (503 + log) instead of accepting and dropping | agent | curl POST returns 503 pre-env, 200 post-env |
| 4 | Replace the public salt fallback with an env-required value (no default) | agent | `grep` shows no literal salt |
| 5 | Lighthouse + screenshot spot check on `/tools/pdf-compressor` and `/tools/add-watermark` (ToolHowToVictory blast radius) | agent | a11y ≥ 97, screenshots |
| 6 | Re-run `verify-deploy.sh` in the correct worktree, against a **server-rendered** marker | agent | PASS rows, correct SHA |
| 7 | Decide `faqs.ts`: delete (dead) or wire it deliberately | user | one-line decision |
| 8 | Record final SHAs + deployment IDs in the report | agent | table |

**Server-rendered markers that actually work** (for step 6):

| Commit | Marker | Where |
|---|---|---|
| P1e | `text-[10px] font-mono text-zinc-600` | `/tools/qr-generator` HTML (page.tsx:39, server-rendered) |
| P1e | `bg-emerald-700` / `text-emerald-700` badge classes | `/tools/pdf-compressor` HTML (ToolHowToVictory) |
| P1d | *not verifiable via curl* — client-only component; verify in a browser instead | — |
| P1b | *none* — no-op commit | — |

---

## 8. Corrections to my own earlier notes

- I treated `faqs.ts:59,101` as live copy. It is dead data — the P0 finding was real in the file but invisible to users.
- I said "P1c contrast node is `page.tsx:37-39`" (correct) but did not check that the *other* P1c targets (the 6 colour inputs) are inside a client-only component, which is why they can never be a curl marker. Verification method, not the fix, was the gap.

---

## 9. Status after this review

| Item | Status |
|---|---|
| P1 code (P1a–P1e) | ✅ complete, a11y 100 on `/tools/qr-generator` (local Lighthouse) |
| P1 deployed | ✅ confirmed via Vercel API (`cf8875b9`, READY, production alias) |
| Live verified by marker | ❌ markers invalid → re-verify with §7 step 6 |
| P1b value | ⚠️ no-op (dead data) |
| Production env completeness | ❌ 11 of 12 keys missing → feedback data loss |
| P2 readiness | ⏸ blocked on §7 steps 1–5 |

---

## 10. Incident found in Vercel build history (the original bug, proven)

`list_deployments` returned an **ERROR** production deployment that nobody had noticed:

| Deployment | Commit | State | Error |
|---|---|---|---|
| `dpl_BPnRhrQTRqJ8Z8NDxjQSrJsaYCjN` | `c8ea1405` — *feat(ui): install @headlessui/react…* | **ERROR** | `type_error` · `Command "npm run build" exited with 1` |

Build log (`get_deployment_events`), final lines:

```
src/app/layout.tsx
An error occurred in `next/font`.
TypeError: Cannot read properties of null (reading '1')
    at node_modules/next/dist/compiled/@next/font/dist/google/loader.js:112:78
    at async nextFontGoogleFontLoader (…/google/loader.js:94:33)
> Build failed because of webpack errors
Error: [BUILD_UTILS_SPAWN_1] Command "npm run build" exited with 1
```

### What this means

1. `c8ea1405` **never deployed**. Production stayed on `7f39d3ee` (the Dang.ai badge commit) from ≈10 Nov 16:22Z until P1e shipped at 11 Nov 06:27Z — roughly **14 hours of "pushed but not live"**.
2. The failure is **not** in application code. It is the `next/font/google` loader crashing while fetching `Inter`, `Outfit`, `Playfair Display` **at build time**. The same failure reproduces in any network-restricted environment (this sandbox fails identically at the same file).
3. It is **intermittent**: the P1 builds (`4ab21919`, `cf8875b9`) and `468ea08e` succeeded with the same fonts. So this is Google Fonts availability/rate-limiting — a random deploy failure waiting to happen again.
4. `next` is declared `^14.2.15` while the lockfile resolves `14.2.35`; Vercel logged "Detected Next.js version: 14.2.35". The caret range means the effective version can drift between machines.

### Verdict for P4

| Priority | Fix |
|---|---|
| **Highest** | Self-host the three fonts (`next/font/local` + woff2 in `public/fonts`, or a variable-font subset). Builds must not touch the network. This is the single change that removes the class of failure that started this audit. |
| High | Pin `next` to an exact version (drop the caret) so local and Vercel run the same compiler. |
| High | Build-stamp + deploy watcher: `/api/health` returning `commit`, and a check that fails loudly when `main` has an ERROR deployment. Nobody noticed a red production build for 14 hours. |
| Medium | Keep `verify-deploy.sh` asserting live SHA == `origin/main` (needs the stamp). |

---

## 11. P1.5 status (verified 11 Nov, 07:05Z)

| Task | Claim | Verified state |
|---|---|---|
| 1 — set 11 env vars in Vercel | "reminder" | ❌ **NOT DONE** — `list_env_vars` still returns only `ADMIN_PASSWORD` |
| 2 — fail loudly on missing Supabase | done | ✅ deployed: `dpl_2dMmHVVkyiwQswaHWrKzhsDqxsuy`, commit `468ea08e`, READY/PROMOTED, ready 07:00:20Z |
| 3 — cross-page a11y | 94 / 94, "baseline preserved" | ⚠️ measured, but **no pre-P1 baseline exists** for those pages (P0 only audited `/`, `/tools/qr-generator`) → "no regression" is unsupported. Counts to carry: pdf-compressor 20 contrast nodes + 1 heading-order; add-watermark 5 + 1 |
| 4 — verifier in correct worktree | 13 PASS / 3 WARN / 0 FAIL | ✅ ran on `main` at `cf8875b9`, clean tree, remote match. Markers pass but are generic (`text-zinc-600` = 2 can pre-exist); the stronger proof is the page byte delta 269,727 → 269,940 (+213 B) between the two runs |
| 5 — faqs.ts decision | delete in P2 cleanup | ✅ correct |

### Consequence of Task 1 being undone

`468ea08e` is live, so `/api/feedback` now returns **503 for every visitor** — honest instead of silently dropping data, but the feedback feature is **down in production** until the Supabase env vars exist. Either set them, or roll back `468ea08e` until they are set.
