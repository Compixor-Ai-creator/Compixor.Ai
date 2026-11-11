# 08 — Deploy identity: "pushed but not live" ka permanent fix

**Date:** 11 Nov 2026
**Branch:** `arena/6c98d590-compixor-ai`
**Shipped code:** `7bba02f1e11b` (3 commits, pushed)
**Vercel deployment:** `dpl_B8hGjFxDuEZb5fpdq669xaoUUJZQ` — **READY**, 88.8 s build, `preview` / `STAGED`
**Deployment URL:** `compixor-3r9554v5a-compixor-ai-creator.vercel.app`
**Branch alias:** `compixor-ai-git-arena-6c98d590-compixor-ai-compixor-ai-creator.vercel.app`

---

## 1. Kya ship hua

| Commit | Change | Kya theek karta hai |
|---|---|---|
| `3d21bd1` | `perf(build)`: fonts self-hosted via `next/font/local` (`src/app/fonts/`, 4 woff2, SIL OFL 1.1) | build ka Google Fonts par dependency khatam |
| `280acec` | `feat(ops)`: build stamp — `/api/health` mein `commit` + `buildTime`, HTML mein `<meta name="compixor-build">` | "pushed but not deployed" ab detect hota hai |
| `7bba02f` | `fix(deps)`: `next` pinned `14.2.35` | same commit, do deploys, same framework code |

Fonts ke saare CSS variables (`--font-inter`, `--font-outfit`, `--font-playfair`), weights (variable 100–900) aur `display: swap` waise hi hain — sirf source badla hai. License notice: `src/app/fonts/OFL-NOTICE.md`.

---

## 2. Proof — Vercel par, local par nahi

Sabse bada sabak pichle round ka: **local build green hona proof nahi tha**, kyunki `c8ea1405` bhi local par kabhi pass hua tha aur Vercel par ERROR ho gaya tha. Isliye proof Vercel hi deta hai:

| Deployment | Commit | State | Evidence |
|---|---|---|---|
| `dpl_BPnRhrQTRqJ8Z8NDxjQSrJsaYCjN` | `c8ea1405` | **ERROR** | `type_error`, `npm run build` exit 1, `next/font` TypeError |
| `dpl_B8hGjFxDuEZb5fpdq669xaoUUJZQ` | `7bba02f1e11b` | **READY** | same pipeline, same step, 88.8 s |

Yeh exactly wahi step hai jo pehle toota tha (webpack / `next/font`). Same step, opposite result — matlab root cause gaya, symptom chhupaya nahi gaya.

Local par bhi verify kiya gaya (Vercel se pehle):
- `npm run build` **Google Fonts block hone par bhi** green — 37 routes
- `npx tsc --noEmit` clean · `npm test` 7/7 · lint sirf warnings
- font URLs `/_next/static/media/*.woff2` (koi `fonts.googleapis.com` nahi)

---

## 3. Build identity — ab 2 jagah se proof

| Kahan | Kya |
|---|---|
| `GET /api/health` | `{"status":"ok", …, "commit":"7bba02f1e11b", "buildTime":"2026-11-11T…Z"}` |
| HTML `<head>` | `<meta name="compixor-build" content="7bba02f1e11b">` |
| `scripts/verify-deploy.sh` section 2 | dono ko `EXPECTED_SHA` se compare karta hai |

`commit` Vercel ke `VERCEL_GIT_COMMIT_SHA` se aata hai (12 chars), local build par `dev`. Iska matlab: agar live `commit` aap ke HEAD se match nahi karta, to deploy nahi hua — yeh ab guesswork nahi, ek command ka jawab hai.

---

## 4. Aap khud chalayein

### 4a. Preview (abhi, bina production chhue)

```bash
cd Compixor.Ai
EXPECTED_SHA=7bba02f1e11baf913280c5331c5f11f46bef76a7 \
FRONTEND_URL=https://compixor-ai-git-arena-6c98d590-compixor-ai-compixor-ai-creator.vercel.app \
bash scripts/verify-deploy.sh
```

Brauzer mein bhi check kar lein (login Vercel account se, kyunki preview protected hai):

- [ ] `…vercel.app/api/health` → `"commit": "7bba02f1e11b"`
- [ ] Page source → `<meta name="compixor-build" content="7bba02f1e11b">`
- [ ] Network tab → koi `fonts.googleapis.com` request **nahi**, fonts `/_next/static/media/*.woff2` se

### 4b. Production (`compixor-ai.cloud`)

Production sirf `main` par deploy hota hai. PR #6 **merge ho gaya** (11 Nov, merge commit `ae0f5ec`) aur production usi par chal raha hai — details `10-PRODUCTION-RELEASE.md` mein. Verification:

```bash
EXPECTED_SHA=$(git rev-parse main) bash scripts/verify-deploy.sh
```

Aur `docs/audit/02-LIVE-TEST-CHECKLIST.md` section A dobara chalayein.

---

## 5. Jo abhi bhi baaki hai (aap ka kaam, 10 min)

Vercel env vars abhi bhi sirf `ADMIN_PASSWORD` hain. Iska seedha asar:

- `/api/feedback` → **503** har visitor ke liye (production datastore nahi hai)
- IP salt fallback (privacy ke liye weak)

Yeh fix env vars ke bina nahi ho sakta, aur Wave B (CompixorModal / FeedbackWidget) isi endpoint par ruka hai. Wave A (Disclosure, Menu, Listbox, Switch, TabGroup) is se independent hai — `07-P2-WAVE-A-SESSION-PACK.md`.

---

## 6. Caveats (honest list)

- Preview deployment `"public": false` hai — Vercel login ke bina 401 aayega. Yeh expected hai, bug nahi.
- `buildTime` build ke **start** ka timestamp hai, deploy ka nahi.
- `verify-deploy.sh` backend par `version`/`hash` field abhi `WARN` deta hai — backend `main.py` par stamp nahi hai (P4 item, VPS deploy chahiye).
- Fonts latin subset tak hain (pehle bhi `subsets: ['latin']` hi tha) — coverage same, size kam.
