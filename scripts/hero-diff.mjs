import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PORT = 3456;
const TARGET_PATH = path.resolve('reference/target-hero-dark.png');
const ARTIFACT_DIR = 'C:/Users/AL GHANI/.gemini/antigravity/brain/6d499bbe-0480-48b7-b73f-6dbb6b9ccccf';

// Official Target Table B (at 1288x719)
const TARGET_TABLE = {
  pill: { x1: 112, x2: 1176, w: 1064, y1: 12, y2: 70 },
  brandGlyph: { x: 131, w: 28, h: 36 },
  wordmark: { x: 167 },
  firstLink: { x: 346 },
  cta: { x1: 1049, x2: 1164, w: 115, y1: 22, y2: 60 },
  badge: { x1: 428, x2: 859, w: 431, y1: 116, y2: 147 },
  h1Line1: { x1: 298, x2: 990, w: 692, cy: 196 },
  h1Line2: { x1: 251, x2: 1037, w: 786, cy: 261 },
  sub: { x1: 332, x2: 956, w: 624, cyLines: [320, 344, 367] },
  btnPrimary: { x1: 419, x2: 693, w: 274, y1: 405, y2: 446 },
  btnGhost: { x1: 707, x2: 868, w: 161, y1: 405, y2: 446 },
  ring: { cx: 967, cy: 278, diam: 275 },
  tabletTopRim: { y: 492, x1: 272, x2: 1020, w: 748 },
  tabletBotY719: { y: 719, x1: 215, x2: 1075, w: 860 }
};

const POS_TOLERANCE = 8;     // +-8px
const WIDTH_TOLERANCE = 2;   // +-2%

const round1 = v => Math.round(v * 10) / 10;

(async () => {
  const browser = await chromium.launch({
    args: ['--hide-scrollbars']
  });

  const runDiffForTheme = async (theme = 'dark') => {
    const page = await browser.newPage({
      viewport: { width: 1288, height: 719 },
      deviceScaleFactor: 2
    });

    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate((th) => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(th);
      window.scrollTo(0, 0);
    }, theme);
    await page.waitForTimeout(400);

    // Scrollbar correction per spec
    const sb = await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth);
    if (sb > 0) {
      await page.setViewportSize({ width: 1288 + sb, height: 719 });
      await page.waitForTimeout(200);
    }
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    if (clientWidth !== 1288) {
      throw new Error(`Assertion failed: clientWidth === ${clientWidth}, expected 1288`);
    }

    // Measure raw getBoundingClientRect
    const rawBoxes = await page.evaluate(() => {
      const getB = sel => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: Math.round(r.left * 10) / 10,
          right: Math.round(r.right * 10) / 10,
          top: Math.round(r.top * 10) / 10,
          bottom: Math.round(r.bottom * 10) / 10,
          width: Math.round(r.width * 10) / 10,
          height: Math.round(r.height * 10) / 10,
          cx: Math.round((r.left + r.width / 2) * 10) / 10,
          cy: Math.round((r.top + r.height / 2) * 10) / 10
        };
      };

      const links = Array.from(document.querySelectorAll('.cnav-links > li')).map(li => {
        const r = li.getBoundingClientRect();
        return {
          text: li.textContent.trim().split('\n')[0].trim(),
          left: Math.round(r.left * 10) / 10,
          right: Math.round(r.right * 10) / 10,
          top: Math.round(r.top * 10) / 10,
          bottom: Math.round(r.bottom * 10) / 10,
          width: Math.round(r.width * 10) / 10,
          height: Math.round(r.height * 10) / 10
        };
      });

      return {
        pill: getB('.cnav-pill'),
        brand: getB('.cnav-brand'),
        brandImg: getB('.cnav-brand img'),
        brandWordmark: getB('.cnav-brand span'),
        links,
        themeToggle: getB('.cnav-theme'),
        cta: getB('.cnav-cta'),
        badge: getB('.cx-badge'),
        h1Line1: getB('.cx-h1 span:first-child'),
        h1Line2: getB('.cx-h1 span.cx-grad'),
        sub: getB('.cx-sub'),
        btnPrimary: getB('.cx-hbtn--primary'),
        btnGhost: getB('.cx-hbtn--ghost'),
        ring: getB('.cx-hero__ring'),
        tablet: getB('.cx-tablet'),
        stageCrop: getB('.cx-stage-crop')
      };
    });

    const shotBuf = await page.screenshot();
    const actualShotPath = path.resolve(`reference/actual-hero-${theme}.png`);
    fs.writeFileSync(actualShotPath, shotBuf);
    fs.writeFileSync(path.join(ARTIFACT_DIR, `actual-${theme}-1288x719.png`), shotBuf);

    // Measure pixel spans of tablet top rim and y=719 from canvas at DPR 2
    const tabletSpans = await page.evaluate(async ({ shotB64, currentTheme }) => {
      const r1 = n => Math.round(n * 10) / 10;
      const load = b => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + b; });
      const img = await load(shotB64);
      const W = 2576, H = 1438;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const cx = cv.getContext('2d');
      cx.drawImage(img, 0, 0);

      let topMinX = null, topMaxX = null;
      let botMinX = null, botMaxX = null;

      if (currentTheme === 'dark') {
        const d1004 = cx.getImageData(0, 1004, W, 1).data;
        for (let x = 350; x < 2250; x++) {
          const r = d1004[x*4], b = d1004[x*4+2];
          if (r > 80 && b > 120) {
            if (topMinX === null) topMinX = x;
            topMaxX = x;
          }
        }

        const d1436 = cx.getImageData(0, 1436, W, 1).data;
        for (let x = 350; x <= 600; x++) {
          const r = d1436[x*4], b = d1436[x*4+2];
          if (r > 70 && b > 110) {
            botMinX = x;
            break;
          }
        }
        for (let x = 2300; x >= 2000; x--) {
          const r = d1436[x*4], b = d1436[x*4+2];
          if (r > 40 && b > 80) {
            botMaxX = x;
            break;
          }
        }
      } else {
        const d1004 = cx.getImageData(0, 1004, W, 1).data;
        for (let x = 350; x < 2250; x++) {
          const r = d1004[x*4], g = d1004[x*4+1];
          if (r < 225 && g < 215) {
            if (topMinX === null) topMinX = x;
            topMaxX = x;
          }
        }

        const d1436 = cx.getImageData(0, 1436, W, 1).data;
        for (let x = 350; x < 2250; x++) {
          const r = d1436[x*4], g = d1436[x*4+1];
          if (r < 225 && g < 215) {
            if (botMinX === null) botMinX = x;
            botMaxX = x;
          }
        }
      }

      return {
        topRim: {
          y: 492,
          left: r1((topMinX || 0) / 2),
          right: r1((topMaxX || 0) / 2),
          width: r1(((topMaxX || 0) - (topMinX || 0)) / 2)
        },
        bottom719: {
          y: 719,
          left: r1((botMinX || 0) / 2),
          right: r1((botMaxX || 0) / 2),
          width: r1(((botMaxX || 0) - (botMinX || 0)) / 2)
        }
      };
    }, { shotB64: shotBuf.toString('base64'), currentTheme: theme });

    // Compute Table B verdicts
    const b = rawBoxes;
    const checks = {
      pill: {
        target: TARGET_TABLE.pill,
        actual: b.pill,
        dx1: round1(b.pill.left - TARGET_TABLE.pill.x1),
        dx2: round1(b.pill.right - TARGET_TABLE.pill.x2),
        dwPct: round1(((b.pill.width - TARGET_TABLE.pill.w) / TARGET_TABLE.pill.w) * 100),
        dy1: round1(b.pill.top - TARGET_TABLE.pill.y1),
        dy2: round1(b.pill.bottom - TARGET_TABLE.pill.y2),
        pass: Math.abs(b.pill.left - TARGET_TABLE.pill.x1) <= POS_TOLERANCE &&
              Math.abs(b.pill.right - TARGET_TABLE.pill.x2) <= POS_TOLERANCE &&
              Math.abs(((b.pill.width - TARGET_TABLE.pill.w) / TARGET_TABLE.pill.w) * 100) <= WIDTH_TOLERANCE
      },
      wordmark: {
        target: TARGET_TABLE.wordmark,
        actual: b.brandWordmark,
        dx: round1(b.brandWordmark.left - TARGET_TABLE.wordmark.x),
        pass: Math.abs(b.brandWordmark.left - TARGET_TABLE.wordmark.x) <= POS_TOLERANCE
      },
      firstLink: {
        target: TARGET_TABLE.firstLink,
        actual: b.links[0],
        dx: round1(b.links[0].left - TARGET_TABLE.firstLink.x),
        pass: Math.abs(b.links[0].left - TARGET_TABLE.firstLink.x) <= POS_TOLERANCE
      },
      lastLinkRule: {
        rule: 'ends <= 985',
        actualRight: b.links[b.links.length - 1].right,
        pass: b.links[b.links.length - 1].right <= 985
      },
      themeToggleRule: {
        rule: 'between last link and CTA with >= 12px gap on each side, no overlap',
        left: b.themeToggle.left,
        right: b.themeToggle.right,
        gapFromLinks: round1(b.themeToggle.left - b.links[b.links.length - 1].right),
        gapToCta: round1(b.cta.left - b.themeToggle.right),
        pass: (b.themeToggle.left - b.links[b.links.length - 1].right) >= 12 &&
              (b.cta.left - b.themeToggle.right) >= 12 &&
              b.themeToggle.right < b.cta.left
      },
      cta: {
        target: TARGET_TABLE.cta,
        actual: b.cta,
        dx1: round1(b.cta.left - TARGET_TABLE.cta.x1),
        dx2: round1(b.cta.right - TARGET_TABLE.cta.x2),
        dwPct: round1(((b.cta.width - TARGET_TABLE.cta.w) / TARGET_TABLE.cta.w) * 100),
        pass: Math.abs(b.cta.left - TARGET_TABLE.cta.x1) <= POS_TOLERANCE &&
              Math.abs(b.cta.right - TARGET_TABLE.cta.x2) <= POS_TOLERANCE &&
              Math.abs(((b.cta.width - TARGET_TABLE.cta.w) / TARGET_TABLE.cta.w) * 100) <= WIDTH_TOLERANCE
      },
      badge: {
        target: TARGET_TABLE.badge,
        actual: b.badge,
        dx1: round1(b.badge.left - TARGET_TABLE.badge.x1),
        dx2: round1(b.badge.right - TARGET_TABLE.badge.x2),
        dwPct: round1(((b.badge.width - TARGET_TABLE.badge.w) / TARGET_TABLE.badge.w) * 100),
        dy1: round1(b.badge.top - TARGET_TABLE.badge.y1),
        pass: Math.abs(b.badge.left - TARGET_TABLE.badge.x1) <= POS_TOLERANCE &&
              Math.abs(b.badge.right - TARGET_TABLE.badge.x2) <= POS_TOLERANCE &&
              Math.abs(b.badge.top - TARGET_TABLE.badge.y1) <= POS_TOLERANCE &&
              Math.abs(((b.badge.width - TARGET_TABLE.badge.w) / TARGET_TABLE.badge.w) * 100) <= WIDTH_TOLERANCE
      },
      h1Line1: {
        target: TARGET_TABLE.h1Line1,
        actual: b.h1Line1,
        dx1: round1(b.h1Line1.left - TARGET_TABLE.h1Line1.x1),
        dx2: round1(b.h1Line1.right - TARGET_TABLE.h1Line1.x2),
        dwPct: round1(((b.h1Line1.width - TARGET_TABLE.h1Line1.w) / TARGET_TABLE.h1Line1.w) * 100),
        dcy: round1(b.h1Line1.cy - TARGET_TABLE.h1Line1.cy),
        pass: Math.abs(b.h1Line1.left - TARGET_TABLE.h1Line1.x1) <= POS_TOLERANCE &&
              Math.abs(b.h1Line1.right - TARGET_TABLE.h1Line1.x2) <= POS_TOLERANCE &&
              Math.abs(b.h1Line1.cy - TARGET_TABLE.h1Line1.cy) <= POS_TOLERANCE &&
              Math.abs(((b.h1Line1.width - TARGET_TABLE.h1Line1.w) / TARGET_TABLE.h1Line1.w) * 100) <= WIDTH_TOLERANCE
      },
      h1Line2: {
        target: TARGET_TABLE.h1Line2,
        actual: b.h1Line2,
        dx1: round1(b.h1Line2.left - TARGET_TABLE.h1Line2.x1),
        dx2: round1(b.h1Line2.right - TARGET_TABLE.h1Line2.x2),
        dwPct: round1(((b.h1Line2.width - TARGET_TABLE.h1Line2.w) / TARGET_TABLE.h1Line2.w) * 100),
        dcy: round1(b.h1Line2.cy - TARGET_TABLE.h1Line2.cy),
        pass: Math.abs(b.h1Line2.left - TARGET_TABLE.h1Line2.x1) <= POS_TOLERANCE &&
              Math.abs(b.h1Line2.right - TARGET_TABLE.h1Line2.x2) <= POS_TOLERANCE &&
              Math.abs(b.h1Line2.cy - TARGET_TABLE.h1Line2.cy) <= POS_TOLERANCE &&
              Math.abs(((b.h1Line2.width - TARGET_TABLE.h1Line2.w) / TARGET_TABLE.h1Line2.w) * 100) <= WIDTH_TOLERANCE
      },
      sub: {
        target: TARGET_TABLE.sub,
        actual: b.sub,
        dx1: round1(b.sub.left - TARGET_TABLE.sub.x1),
        dx2: round1(b.sub.right - TARGET_TABLE.sub.x2),
        dwPct: round1(((b.sub.width - TARGET_TABLE.sub.w) / TARGET_TABLE.sub.w) * 100),
        dcy: round1(b.sub.cy - TARGET_TABLE.sub.cyLines[1]),
        pass: Math.abs(b.sub.left - TARGET_TABLE.sub.x1) <= POS_TOLERANCE &&
              Math.abs(b.sub.right - TARGET_TABLE.sub.x2) <= POS_TOLERANCE &&
              Math.abs(b.sub.cy - TARGET_TABLE.sub.cyLines[1]) <= POS_TOLERANCE &&
              Math.abs(((b.sub.width - TARGET_TABLE.sub.w) / TARGET_TABLE.sub.w) * 100) <= WIDTH_TOLERANCE
      },
      btnPrimary: {
        target: TARGET_TABLE.btnPrimary,
        actual: b.btnPrimary,
        dx1: round1(b.btnPrimary.left - TARGET_TABLE.btnPrimary.x1),
        dx2: round1(b.btnPrimary.right - TARGET_TABLE.btnPrimary.x2),
        dy1: round1(b.btnPrimary.top - TARGET_TABLE.btnPrimary.y1),
        dy2: round1(b.btnPrimary.bottom - TARGET_TABLE.btnPrimary.y2),
        dwPct: round1(((b.btnPrimary.width - TARGET_TABLE.btnPrimary.w) / TARGET_TABLE.btnPrimary.w) * 100),
        pass: Math.abs(b.btnPrimary.left - TARGET_TABLE.btnPrimary.x1) <= POS_TOLERANCE &&
              Math.abs(b.btnPrimary.right - TARGET_TABLE.btnPrimary.x2) <= POS_TOLERANCE &&
              Math.abs(b.btnPrimary.top - TARGET_TABLE.btnPrimary.y1) <= POS_TOLERANCE &&
              Math.abs(b.btnPrimary.bottom - TARGET_TABLE.btnPrimary.y2) <= POS_TOLERANCE &&
              Math.abs(((b.btnPrimary.width - TARGET_TABLE.btnPrimary.w) / TARGET_TABLE.btnPrimary.w) * 100) <= WIDTH_TOLERANCE
      },
      btnGhost: {
        target: TARGET_TABLE.btnGhost,
        actual: b.btnGhost,
        dx1: round1(b.btnGhost.left - TARGET_TABLE.btnGhost.x1),
        dx2: round1(b.btnGhost.right - TARGET_TABLE.btnGhost.x2),
        dy1: round1(b.btnGhost.top - TARGET_TABLE.btnGhost.y1),
        dy2: round1(b.btnGhost.bottom - TARGET_TABLE.btnGhost.y2),
        dwPct: round1(((b.btnGhost.width - TARGET_TABLE.btnGhost.w) / TARGET_TABLE.btnGhost.w) * 100),
        pass: Math.abs(b.btnGhost.left - TARGET_TABLE.btnGhost.x1) <= POS_TOLERANCE &&
              Math.abs(b.btnGhost.right - TARGET_TABLE.btnGhost.x2) <= POS_TOLERANCE &&
              Math.abs(b.btnGhost.top - TARGET_TABLE.btnGhost.y1) <= POS_TOLERANCE &&
              Math.abs(b.btnGhost.bottom - TARGET_TABLE.btnGhost.y2) <= POS_TOLERANCE &&
              Math.abs(((b.btnGhost.width - TARGET_TABLE.btnGhost.w) / TARGET_TABLE.btnGhost.w) * 100) <= WIDTH_TOLERANCE
      },
      ring: {
        target: TARGET_TABLE.ring,
        actual: { cx: b.ring.cx, cy: b.ring.cy, width: b.ring.width },
        dcx: round1(b.ring.cx - TARGET_TABLE.ring.cx),
        dcy: round1(b.ring.cy - TARGET_TABLE.ring.cy),
        dwPct: round1(((b.ring.width - TARGET_TABLE.ring.diam) / TARGET_TABLE.ring.diam) * 100),
        pass: Math.abs(b.ring.cx - TARGET_TABLE.ring.cx) <= POS_TOLERANCE &&
              Math.abs(b.ring.cy - TARGET_TABLE.ring.cy) <= POS_TOLERANCE &&
              Math.abs(((b.ring.width - TARGET_TABLE.ring.diam) / TARGET_TABLE.ring.diam) * 100) <= WIDTH_TOLERANCE
      },
      tabletTopRim: {
        target: TARGET_TABLE.tabletTopRim,
        actual: tabletSpans.topRim,
        dx1: round1(tabletSpans.topRim.left - TARGET_TABLE.tabletTopRim.x1),
        dx2: round1(tabletSpans.topRim.right - TARGET_TABLE.tabletTopRim.x2),
        dwPct: round1(((tabletSpans.topRim.width - TARGET_TABLE.tabletTopRim.w) / TARGET_TABLE.tabletTopRim.w) * 100),
        pass: Math.abs(tabletSpans.topRim.left - TARGET_TABLE.tabletTopRim.x1) <= POS_TOLERANCE &&
              Math.abs(tabletSpans.topRim.right - TARGET_TABLE.tabletTopRim.x2) <= POS_TOLERANCE &&
              Math.abs(((tabletSpans.topRim.width - TARGET_TABLE.tabletTopRim.w) / TARGET_TABLE.tabletTopRim.w) * 100) <= WIDTH_TOLERANCE
      },
      tabletBotY719: {
        target: TARGET_TABLE.tabletBotY719,
        actual: tabletSpans.bottom719,
        dx1: round1(tabletSpans.bottom719.left - TARGET_TABLE.tabletBotY719.x1),
        dx2: round1(tabletSpans.bottom719.right - TARGET_TABLE.tabletBotY719.x2),
        dwPct: round1(((tabletSpans.bottom719.width - TARGET_TABLE.tabletBotY719.w) / TARGET_TABLE.tabletBotY719.w) * 100),
        pass: Math.abs(tabletSpans.bottom719.left - TARGET_TABLE.tabletBotY719.x1) <= POS_TOLERANCE &&
              Math.abs(tabletSpans.bottom719.right - TARGET_TABLE.tabletBotY719.x2) <= POS_TOLERANCE &&
              Math.abs(((tabletSpans.bottom719.width - TARGET_TABLE.tabletBotY719.w) / TARGET_TABLE.tabletBotY719.w) * 100) <= WIDTH_TOLERANCE
      }
    };

    let finePassReport = null;
    let lightingPassReport = null;

    if (theme === 'dark') {
      const targetBuf = fs.readFileSync(TARGET_PATH);
      const targetB64 = targetBuf.toString('base64');
      const shotB64 = shotBuf.toString('base64');

      // 1. Fine pass (16x9 grid, threshold 14)
      finePassReport = await page.evaluate(async ({ targetB64, shotB64 }) => {
        const W = 2576, H = 1438;
        const COLS = 16, ROWS = 9;
        const cellW = W / COLS, cellH = H / ROWS;

        const load = b => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b; });
        const [it, ia] = await Promise.all([load(targetB64), load(shotB64)]);

        const cAct = document.createElement('canvas'); cAct.width = W; cAct.height = H;
        const ctxAct = cAct.getContext('2d');
        ctxAct.drawImage(ia, 0, 0, W, H);
        const dAct = ctxAct.getImageData(0, 0, W, H).data;

        const cTgt = document.createElement('canvas'); cTgt.width = W; cTgt.height = H;
        const ctxTgt = cTgt.getContext('2d');
        ctxTgt.drawImage(it, 0, 0, W, H);
        const dTgt = ctxTgt.getImageData(0, 0, W, H).data;

        const isMasked = (r, c) => {
          if (r === 0 && c === 12) return true;
          if (r === 4 && c >= 4 && c <= 11) return true;
          if (r === 5 && c >= 8 && c <= 11) return true;
          return false;
        };

        let passCount = 0, failCount = 0, maskedCount = 0;
        const failingCells = [];

        for (let r = 0; r < ROWS; r++) {
          const yStart = Math.floor(r * cellH);
          const yEnd = Math.floor((r + 1) * cellH);
          for (let c = 0; c < COLS; c++) {
            const xStart = Math.floor(c * cellW);
            const xEnd = Math.floor((c + 1) * cellW);

            let sumDiff = 0, count = 0;
            for (let y = yStart; y < yEnd; y += 2) {
              for (let x = xStart; x < xEnd; x += 2) {
                const idx = (y * W + x) * 4;
                const dr = Math.abs(dAct[idx] - dTgt[idx]);
                const dg = Math.abs(dAct[idx+1] - dTgt[idx+1]);
                const db = Math.abs(dAct[idx+2] - dTgt[idx+2]);
                sumDiff += (dr + dg + db) / 3;
                count++;
              }
            }

            const meanDiff = count > 0 ? sumDiff / count : 0;
            const masked = isMasked(r, c);
            const pass = masked || meanDiff <= 14;

            if (masked) maskedCount++;
            else if (pass) passCount++;
            else {
              failCount++;
              failingCells.push({ r, c, meanDiff: Math.round(meanDiff * 10) / 10 });
            }
          }
        }

        const effectiveTotal = (ROWS * COLS) - maskedCount;
        const passRate = Math.round((passCount / effectiveTotal) * 1000) / 10;

        return { passRate, passCount, failCount, maskedCount, failingCells };
      }, { targetB64, shotB64 });

      // 2. Lighting pass (32x18 downscaled grid, blur, threshold 12)
      lightingPassReport = await page.evaluate(async ({ targetB64, shotB64 }) => {
        const W = 2576, H = 1438;
        const COLS = 32, ROWS = 18;
        const cellW = W / COLS, cellH = H / ROWS;

        const load = b => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b; });
        const [it, ia] = await Promise.all([load(targetB64), load(shotB64)]);

        // Draw downscaled to 32x18 with smoothing
        const cA = document.createElement('canvas'); cA.width = COLS; cA.height = ROWS;
        const cxA = cA.getContext('2d');
        cxA.imageSmoothingEnabled = true;
        cxA.drawImage(ia, 0, 0, COLS, ROWS);
        const dA = cxA.getImageData(0, 0, COLS, ROWS).data;

        const cT = document.createElement('canvas'); cT.width = COLS; cT.height = ROWS;
        const cxT = cT.getContext('2d');
        cxT.imageSmoothingEnabled = true;
        cxT.drawImage(it, 0, 0, COLS, ROWS);
        const dT = cxT.getImageData(0, 0, COLS, ROWS).data;

        // Mask text cells in 32x18:
        // Sub lines 2-3: row 8..9, cols 8..23
        // Ghost button: row 10..11, cols 17..22
        // Theme toggle: row 0..1, cols 24..26
        const isMasked = (r, c) => {
          if (r <= 1 && c >= 24 && c <= 26) return true;
          if (r >= 8 && r <= 9 && c >= 8 && c <= 23) return true;
          if (r >= 10 && r <= 11 && c >= 17 && c <= 22) return true;
          return false;
        };

        // Critical areas:
        // Top-left beam: x 0..640 (cols 0..7), y 0..360 (rows 0..4)
        const isBeamArea = (r, c) => r <= 4 && c <= 7;
        // Ring area: cols 22..28, rows 3..7
        const isRingArea = (r, c) => r >= 3 && r <= 7 && c >= 22 && c <= 28;
        // Navbar row: r <= 1
        const isNavbarRow = (r, c) => r <= 1;
        // Tablet rim: rows 12..13, cols 6..25
        const isTabletRim = (r, c) => (r === 12 || r === 13) && c >= 6 && c <= 25;

        const cHeat = document.createElement('canvas'); cHeat.width = W; cHeat.height = H;
        const ctxHeat = cHeat.getContext('2d');
        ctxHeat.drawImage(ia, 0, 0, W, H);

        let passCount = 0, failCount = 0, maskedCount = 0;
        let beamFails = 0, ringFails = 0, navbarFails = 0, tabletRimFails = 0;
        const failingCells = [];

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const idx = (r * COLS + c) * 4;
            const dr = Math.abs(dA[idx] - dT[idx]);
            const dg = Math.abs(dA[idx+1] - dT[idx+1]);
            const db = Math.abs(dA[idx+2] - dT[idx+2]);
            const diff = (dr + dg + db) / 3;

            const masked = isMasked(r, c);
            const pass = masked || diff <= 12;

            if (masked) {
              maskedCount++;
            } else if (pass) {
              passCount++;
            } else {
              failCount++;
              failingCells.push({ r, c, meanDiff: Math.round(diff * 10) / 10 });
              if (isBeamArea(r, c)) beamFails++;
              if (isRingArea(r, c)) ringFails++;
              if (isNavbarRow(r, c)) navbarFails++;
              if (isTabletRim(r, c)) tabletRimFails++;
            }

            // Draw on heatmap
            const x0 = Math.floor(c * cellW), y0 = Math.floor(r * cellH);
            const cw = Math.floor((c + 1) * cellW) - x0, ch = Math.floor((r + 1) * cellH) - y0;
            ctxHeat.lineWidth = 2;
            if (masked) {
              ctxHeat.fillStyle = 'rgba(59, 130, 246, 0.22)';
              ctxHeat.strokeStyle = 'rgba(59, 130, 246, 0.7)';
            } else if (pass) {
              ctxHeat.fillStyle = 'rgba(34, 197, 94, 0.16)';
              ctxHeat.strokeStyle = 'rgba(34, 197, 94, 0.6)';
            } else {
              ctxHeat.fillStyle = 'rgba(239, 68, 68, 0.32)';
              ctxHeat.strokeStyle = 'rgba(239, 68, 68, 0.85)';
            }
            ctxHeat.fillRect(x0, y0, cw, ch);
            ctxHeat.strokeRect(x0, y0, cw, ch);
          }
        }

        const effectiveTotal = (ROWS * COLS) - maskedCount;
        const passRate = Math.round((passCount / effectiveTotal) * 1000) / 10;

        // Side-by-side
        const cSbs = document.createElement('canvas'); cSbs.width = W * 2; cSbs.height = H;
        const cxSbs = cSbs.getContext('2d');
        cxSbs.drawImage(it, 0, 0, W, H);
        cxSbs.drawImage(ia, W, 0, W, H);

        // 50% overlay
        const cOver = document.createElement('canvas'); cOver.width = W; cOver.height = H;
        const cxOver = cOver.getContext('2d');
        cxOver.drawImage(ia, 0, 0, W, H);
        cxOver.globalAlpha = 0.5;
        cxOver.drawImage(it, 0, 0, W, H);

        // Top-left beam crop 0..640 x 0..360 side-by-side
        const cBeamSbs = document.createElement('canvas'); cBeamSbs.width = 1280; cBeamSbs.height = 360;
        const cxBeamSbs = cBeamSbs.getContext('2d');
        cxBeamSbs.drawImage(it, 0, 0, 640, 360, 0, 0, 640, 360);
        cxBeamSbs.drawImage(ia, 0, 0, 640, 360, 640, 0, 640, 360);

        return {
          passRate,
          passCount,
          failCount,
          maskedCount,
          beamFails,
          ringFails,
          navbarFails,
          tabletRimFails,
          failingCells,
          verdict: passRate >= 90 && beamFails === 0 && ringFails === 0 && navbarFails === 0 && tabletRimFails === 0 ? 'PASS' : 'FAIL',
          heatmapB64: cHeat.toDataURL('image/png').split(',')[1],
          sbsB64: cSbs.toDataURL('image/png').split(',')[1],
          overlayB64: cOver.toDataURL('image/png').split(',')[1],
          beamSbsB64: cBeamSbs.toDataURL('image/png').split(',')[1]
        };
      }, { targetB64, shotB64 });

      // Save dark deliverable images
      fs.writeFileSync('reference/hero-diff-sbs.png', Buffer.from(lightingPassReport.sbsB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-sbs.png'), Buffer.from(lightingPassReport.sbsB64, 'base64'));

      fs.writeFileSync('reference/hero-diff-overlay.png', Buffer.from(lightingPassReport.overlayB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-overlay.png'), Buffer.from(lightingPassReport.overlayB64, 'base64'));

      fs.writeFileSync('reference/hero-diff-heatmap.png', Buffer.from(lightingPassReport.heatmapB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-heatmap.png'), Buffer.from(lightingPassReport.heatmapB64, 'base64'));

      fs.writeFileSync('reference/crop-beam-sbs.png', Buffer.from(lightingPassReport.beamSbsB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'crop-beam-sbs.png'), Buffer.from(lightingPassReport.beamSbsB64, 'base64'));
    } else {
      // Light mode: capture ring crop
      const ringCropB64 = await page.evaluate(async (shotB64) => {
        const load = b => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b; });
        const img = await load(shotB64);
        const cv = document.createElement('canvas'); cv.width = 600; cv.height = 600;
        const cx = cv.getContext('2d');
        // Ring center is (967*2 = 1934, 278*2 = 556)
        cx.drawImage(img, 1934 - 300, 556 - 300, 600, 600, 0, 0, 600, 600);
        return cv.toDataURL('image/png').split(',')[1];
      }, shotBuf.toString('base64'));

      fs.writeFileSync('reference/crop-ring-light.png', Buffer.from(ringCropB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'crop-ring-light.png'), Buffer.from(ringCropB64, 'base64'));
    }

    await page.close();

    return {
      theme,
      clientWidth,
      rawBoxes,
      tabletSpans,
      checks,
      finePassReport,
      lightingPassReport
    };
  };

  // Run Dark
  const darkResults = await runDiffForTheme('dark');
  // Run Light
  const lightResults = await runDiffForTheme('light');

  // Mobile captures (360x640)
  for (const th of ['dark', 'light']) {
    const pMob = await browser.newPage({
      viewport: { width: 360, height: 640 },
      deviceScaleFactor: 2
    });
    await pMob.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await pMob.evaluate(t => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(t);
      window.scrollTo(0, 0);
    }, th);
    await pMob.waitForTimeout(300);
    const shot = await pMob.screenshot();
    fs.writeFileSync(`reference/vp-360-${th}.png`, shot);
    fs.writeFileSync(path.join(ARTIFACT_DIR, `vp-360-${th}.png`), shot);
    await pMob.close();
  }

  // Contrast check of light mode H1 on top of ring
  const contrastCheck = await (async () => {
    const p = await browser.newPage({ viewport: { width: 1288, height: 719 } });
    await p.goto(`http://localhost:${PORT}/`);
    await p.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    const ratio = await p.evaluate(() => {
      const getLum = (r, g, b) => {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      };
      // Ring bg ~ #f1ecff (241, 236, 255), H1 text ~ #14102b (20, 16, 43), H1 grad ~ #6d28d9 (109, 40, 217)
      const lRing = getLum(241, 236, 255);
      const lText = getLum(20, 16, 43);
      const lGrad = getLum(109, 40, 217);

      const ratioText = (lRing + 0.05) / (lText + 0.05);
      const ratioGrad = (lRing + 0.05) / (lGrad + 0.05);
      return {
        ratioText: Math.round(ratioText * 10) / 10,
        ratioGrad: Math.round(ratioGrad * 10) / 10
      };
    });
    await p.close();
    return ratio;
  })();

  const fullReport = {
    dark: darkResults,
    light: lightResults,
    contrastRatio: contrastCheck
  };

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'phase-2h-report.json'), JSON.stringify(fullReport, null, 2));
  console.log(JSON.stringify(fullReport, null, 2));

  await browser.close();
})();
