# Live Test Checklist — Compixor AI (aap khud chalayein)

**Kab chalayein:** P4 ka gate PASS hone ke **baad** (deploy proof). Us se pehle chalana bekar hai — aap purana build test kar lenge.
**Kitna waqt:** ~45 min (desktop) + 10 min (mobile)
**Device:** 1 desktop (Chrome) + 1 phone (Safari/Chrome). Incognito window use karein (cache + localStorage clean).
**Sabse pehle:** hard refresh `Ctrl+Shift+R` / phone par private tab.

---

## A. Deploy proof (5 min) — "push hua par deploy nahi hua" ka jawab

| # | Step | Expected | PASS/FAIL |
|---|---|---|---|
| A1 | `bash scripts/verify-deploy.sh` | sab checks PASS ya WARN-with-reason | ☐ |
| A2 | `git rev-parse --short HEAD` vs live `/api/health` ka `commit` | same SHA | ☐ |
| A3 | Browser DevTools → Network → document request | `x-vercel-cache: MISS` pehli load par (ya `HIT` naye SHA ke saath) | ☐ |
| A4 | `curl -s https://api.compixor-ai.cloud/health` | 200 + JSON (version/hash agar add hua) | ☐ |
| A5 | VPS par: `sha256sum /var/www/.../main.py` vs repo ka `sha256sum hostinger-backend/main.py` | match | ☐ |

> A2 sabse important hai. Agar live `commit` aap ke local HEAD se match nahi karta, to baaki kuch test karne ka faida nahi — deploy hi nahi hua.
>
> A1/A2 ka exact command aur preview-vs-production ka farq: `docs/audit/08-DEPLOY-IDENTITY.md` section 4.

---

## B. Core tools — 12 tools, happy path

Har tool par: file/input do → process karo → output **download** karo → download ko **kholo** aur check karo. Sirf "download button aya" kafi nahi — **file valid honi chahiye**.

### PDF (client-side — yeh sabse zyada toot sakte hain)

| # | Route | Input | Expected | FAIL ka signature |
|---|---|---|---|---|
| B1 | `/tools/pdf-compressor` | 5–10 MB scanned PDF | size kam, pages same, file khulti hai | 0 KB file / "invalid PDF" / progress stuck 99% |
| B2 | `/tools/pdf-organizer` | 8-page PDF | reorder + merge + split sahi page order | blank pages / order galat |
| B3 | `/tools/add-watermark` | PDF + text watermark | har page par watermark, diagonal position | sirf page 1 par / text invisible |
| B4 | `/tools/remove-watermark` | B3 ka output | watermark hat jaye, text bacha rahe | poora content ud jaye (**bohot bara bug**) |
| B5 | `/tools/protect-pdf` | PDF + password | password maange bina open na ho, phir password se khule | file corrupt / password ignore |
| B6 | `/tools/unlock-pdf` | B5 ka protected PDF + password | password ke baad khule, restrictions clear | corrupt / wrong password error |
| B7 | `/tools/word-compressor` | DOCX with images (5 MB+) | size kam, text same, images dikhein | text gaya / images broken |

### Server-side (backend live hona chahiye)

| # | Route | Input | Expected | FAIL ka signature |
|---|---|---|---|---|
| B8 | `/tools/pdf-to-word` | 2-page text PDF | DOCX download, text + headings sahi | CORS error / 502 / timeout |
| B9 | `/tools/img-to-word` | Urdu/English notes ki photo | DOCX with readable text | empty DOCX / "Backend unavailable" |
| B10 | `/tools/passport-photo` | selfie | 35×45mm @300 DPI, face centered, bg white | crop galat / DPI 72 / bg remove fail |

### Media (client-side)

| # | Route | Input | Expected | FAIL ka signature |
|---|---|---|---|---|
| B11 | `/tools/full-dp-maker` | portrait photo | 1080×1920 no-crop DP | stretch / blur / black bars |
| B12 | `/tools/qr-generator` | URL + logo | QR scan ho (phone se), PNG + SVG dono download | QR scan na ho / logo QR tod de |

---

## C. Mobile (390 px) — 10 min

Phone par kholein, **sirf real device** (DevTools emulation kaafi nahi, touch behaviour alag hota hai):

| # | Test | Expected | ☐ |
|---|---|---|---|
| C1 | Home page scroll | koi horizontal scroll nahi, koi element screen se bahar nahi | ☐ |
| C2 | Pinch-to-zoom | **kaam kare** (a11y fix verify) | ☐ |
| C3 | Hamburger menu kholo → band karo → `Tab` (keyboard/BT keyboard) | band hone par andar ka focus **na** aaye | ☐ |
| C4 | B1 (pdf-compressor) mobile par | 5 MB PDF process ho | ☐ |
| C5 | B10 (passport-photo) camera/gallery se | photo select ho, output sahi | ☐ |
| C6 | Dark mode toggle → reload | choice yaad rahe (localStorage `compixor-theme`) | ☐ |
| C7 | Sabse bhaari page (passport-photo) load time | < 5 s on 4G | ☐ |

---

## D. Keyboard-only pass (7 min)

Mouse **bilkul** use na karein.

| # | Test | Expected | ☐ |
|---|---|---|---|
| D1 | Home par 20 × `Tab` | focus ring **har** element par nazar aaye, kahin ghayab na ho | ☐ |
| D2 | FAQ question par `Enter` / `Space` | khule/band ho, focus wahi rahe | ☐ |
| D3 | Footer/social icon buttons | `aria-label` se screen reader naam bole (VoiceOver/NVDA on) | ☐ |
| D4 | Modal kholo (`/contact` ya feedback) → `Tab` 10× | focus modal ke andar **qaid** rahe | ☐ |
| D5 | Modal mein `Esc` | band ho, focus wapas trigger button par | ☐ |
| D6 | Share dropdown → `↑` `↓` `Esc` | menu items navigate hon, Esc band kare | ☐ |
| D7 | Native `<select>` wale form (`/contact`) | keyboard se value select ho, announce ho | ☐ |

---

## E. Regression (jo toota to sabse mehnga) — 5 min

| # | Test | Expected | ☐ |
|---|---|---|---|
| E1 | `npm test` locally | 7/7 pass | ☐ |
| E2 | `npm run build` locally | pass (agar fonts self-host hue to bina network bhi) | ☐ |
| E3 | Home → kisi bhi tool → back → scroll position | theek rahe | ☐ |
| E4 | `/sitemap.xml`, `/robots.txt`, `/api/health` | 200 + valid | ☐ |
| E5 | Console | **zero** red errors, zero hydration warnings | ☐ |
| E6 | 3 tools ka processing **network tab** mein | **koi file upload nahi** (local tools ke liye) — privacy claim verify | ☐ |

> E6 non-negotiable hai. Agar koi local tool file upload karne lage, woh product ka core promise tod raha hai — turant rollback.

---

## F. Result kaise report karein

Har FAIL ke liye yeh 4 cheezein likhein, phir mujhe bhejein:

```
TOOL: /tools/pdf-compressor
STEP: 5MB PDF upload → compress → download
EXPECTED: size kam, file khulti hai
ACTUAL: 0 KB file, "invalid PDF"
CONSOLE: <error ka first line>
NETWORK: <failed request URL + status>
```

Main iske against root cause locate karke next phase ka scoped fix bata dunga.

---

## G. Rollback (agar kuch bara toot jaye)

| Situation | Command |
|---|---|
| Frontend bug | Vercel dashboard → Deployments → pichla deployment → **Instant Rollback** |
| Ya git se | `git revert <sha> && git push origin main` |
| Backend (VPS) | `git -C /var/www/compixor-backend checkout <previous-sha>` + `systemctl restart compixor-img2word` + bg service |
| Phase 2 ke baad | `git revert p2-headlessui` range (per-commit tags hone chahiye) |

**Rollback hamesha mumkin hona chahiye.** Agar kisi phase ke baad rollback ka rasta saaf nahi, to woh phase adhoora hai.
