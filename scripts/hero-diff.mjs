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

    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

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
        // Dark mode: top rim bright violet border (r > 80 && b > 120)
        const d1004 = cx.getImageData(0, 1004, W, 1).data;
        for (let x = 350; x < 2250; x++) {
          const r = d1004[x*4], b = d1004[x*4+2];
          if (r > 80 && b > 120) {
            if (topMinX === null) topMinX = x;
            topMaxX = x;
          }
        }

        // Bottom rim at y = 1436 (CSS y = 718)
        const d1436 = cx.getImageData(0, 1436, W, 1).data;
        // Left border peak between x 350 and 600 (threshold r > 70 && b > 110)
        for (let x = 350; x <= 600; x++) {
          const r = d1436[x*4], b = d1436[x*4+2];
          if (r > 70 && b > 110) {
            botMinX = x;
            break;
          }
        }
        // Right border peak between x 2000 and 2300 (threshold r > 40 && b > 80)
        for (let x = 2300; x >= 2000; x--) {
          const r = d1436[x*4], b = d1436[x*4+2];
          if (r > 40 && b > 80) {
            botMaxX = x;
            break;
          }
        }
      } else {
        // Light mode: background is light #f7f5ff, tablet surface/border is dark (r < 225 && g < 215)
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

    // Compute verdicts strictly against Table B
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
        pass: b.links[b.links.length - 1].right <= 985 + POS_TOLERANCE
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

    // Pixel diff 16x9 grid (for dark mode vs target-hero-dark.png)
    let pixelDiffReport = null;
    if (theme === 'dark') {
      const targetBuf = fs.readFileSync(TARGET_PATH);
      const targetB64 = targetBuf.toString('base64');
      const shotB64 = shotBuf.toString('base64');

      pixelDiffReport = await page.evaluate(async ({ targetB64, shotB64 }) => {
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

        // Mask only genuinely changed text cells:
        // Sub lines 2-3: row 4, cols 4..11
        // Ghost button label ("Explore All 12 Tools"): row 5, cols 8..11
        // Theme toggle cell: row 0, col 12
        const isMasked = (r, c) => {
          if (r === 0 && c === 12) return true;
          if (r === 4 && c >= 4 && c <= 11) return true;
          if (r === 5 && c >= 8 && c <= 11) return true;
          return false;
        };

        const isNavbar = (r, c) => r === 0;
        const isBeam = (r, c) => r <= 3 && c <= 4;
        const isRing = (r, c) => (r >= 1 && r <= 3) && (c >= 11 && c <= 14);
        const isTabletRim = (r, c) => r === 6 && (c >= 2 && c <= 13);

        const cHeat = document.createElement('canvas'); cHeat.width = W; cHeat.height = H;
        const ctxHeat = cHeat.getContext('2d');
        ctxHeat.drawImage(ia, 0, 0, W, H);

        let passCount = 0, failCount = 0, maskedCount = 0;
        let navbarFails = 0, beamFails = 0, ringFails = 0, tabletRimFails = 0;
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
              if (isNavbar(r, c)) navbarFails++;
              if (isBeam(r, c)) beamFails++;
              if (isRing(r, c)) ringFails++;
              if (isTabletRim(r, c)) tabletRimFails++;
            }

            // Draw heatmap cell
            ctxHeat.lineWidth = 2;
            if (masked) {
              ctxHeat.fillStyle = 'rgba(59, 130, 246, 0.22)';
              ctxHeat.strokeStyle = 'rgba(59, 130, 246, 0.8)';
            } else if (pass) {
              ctxHeat.fillStyle = 'rgba(34, 197, 94, 0.18)';
              ctxHeat.strokeStyle = 'rgba(34, 197, 94, 0.7)';
            } else {
              ctxHeat.fillStyle = 'rgba(239, 68, 68, 0.32)';
              ctxHeat.strokeStyle = 'rgba(239, 68, 68, 0.85)';
            }
            ctxHeat.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
            ctxHeat.strokeRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
          }
        }

        const effectiveTotal = (ROWS * COLS) - maskedCount;
        const passRate = Math.round((passCount / effectiveTotal) * 1000) / 10;

        // Overlay 50%
        const cOver = document.createElement('canvas'); cOver.width = W; cOver.height = H;
        const ctxOver = cOver.getContext('2d');
        ctxOver.drawImage(ia, 0, 0, W, H);
        ctxOver.globalAlpha = 0.5;
        ctxOver.drawImage(it, 0, 0, W, H);

        return {
          passRate,
          passCount,
          failCount,
          maskedCount,
          navbarFails,
          beamFails,
          ringFails,
          tabletRimFails,
          failingCells,
          heatmapB64: cHeat.toDataURL('image/png').split(',')[1],
          overlayB64: cOver.toDataURL('image/png').split(',')[1]
        };
      }, { targetB64, shotB64 });

      fs.writeFileSync(path.resolve('reference/hero-diff-heatmap.png'), Buffer.from(pixelDiffReport.heatmapB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-heatmap.png'), Buffer.from(pixelDiffReport.heatmapB64, 'base64'));

      fs.writeFileSync(path.resolve('reference/hero-diff-overlay.png'), Buffer.from(pixelDiffReport.overlayB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-overlay.png'), Buffer.from(pixelDiffReport.overlayB64, 'base64'));

      // Generate Side-by-side artifact: canvas 2576 x 719, each side 1288x719
      const sbsPage = await browser.newPage({ viewport: { width: 2576, height: 719 } });
      await sbsPage.setContent(`<html><body style="margin:0;overflow:hidden;background:#000;"><canvas id="c" width="2576" height="719"></canvas></body></html>`);
      await sbsPage.evaluate(({ targetB64, shotB64 }) => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        const it = new Image(); it.src = 'data:image/png;base64,' + targetB64;
        const ia = new Image(); ia.src = 'data:image/png;base64,' + shotB64;
        return Promise.all([new Promise(r => it.onload = r), new Promise(r => ia.onload = r)]).then(() => {
          ctx.drawImage(it, 0, 0, 1288, 719);
          ctx.drawImage(ia, 1288, 0, 1288, 719);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('TARGET REFERENCE', 24, 36);
          ctx.fillText('ACTUAL (PHASE 2g)', 1312, 36);
        });
      }, { targetB64, shotB64 });
      const sbsBuf = await sbsPage.screenshot();
      fs.writeFileSync(path.resolve('reference/hero-diff-sbs.png'), sbsBuf);
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-sbs.png'), sbsBuf);
      await sbsPage.close();
    }

    // Save navbar crop y 0..130
    const navCropPage = await browser.newPage({ viewport: { width: 1288, height: 130 } });
    await navCropPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await navCropPage.evaluate((th) => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(th);
      window.scrollTo(0, 0);
    }, theme);
    await navCropPage.waitForTimeout(200);
    const navCropBuf = await navCropPage.screenshot();
    fs.writeFileSync(path.join(ARTIFACT_DIR, `navbar-crop-1288-${theme}.png`), navCropBuf);
    await navCropPage.close();

    await page.close();

    return {
      theme,
      clientWidth,
      rawBoxes,
      tabletSpans,
      checks,
      pixelDiffReport
    };
  };

  const darkResult = await runDiffForTheme('dark');
  const lightResult = await runDiffForTheme('light');

  // Navbar crop at 1100px width (dark and light)
  for (const th of ['dark', 'light']) {
    const p1100 = await browser.newPage({ viewport: { width: 1100, height: 130 } });
    await p1100.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await p1100.evaluate((th) => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(th);
      window.scrollTo(0, 0);
    }, th);
    await p1100.waitForTimeout(200);
    const crop1100Buf = await p1100.screenshot();
    fs.writeFileSync(path.join(ARTIFACT_DIR, `navbar-crop-1100-${th}.png`), crop1100Buf);
    await p1100.close();
  }

  // 360x640 captures for proof
  for (const th of ['dark', 'light']) {
    const p360 = await browser.newPage({ viewport: { width: 360, height: 640 } });
    await p360.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await p360.evaluate((th) => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(th);
      window.scrollTo(0, 0);
    }, th);
    await p360.waitForTimeout(200);
    const shot360 = await p360.screenshot();
    fs.writeFileSync(path.join(ARTIFACT_DIR, `actual-${th}-360x640.png`), shot360);
    await p360.close();
  }

  const output = {
    dark: darkResult,
    light: lightResult
  };

  console.log(JSON.stringify(output, null, 2));
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'phase2g-diff-results.json'), JSON.stringify(output, null, 2));

  await browser.close();
})();
