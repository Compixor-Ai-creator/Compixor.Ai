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
