import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PORT = 3456;
const TARGET_PATH = path.resolve('reference/target-hero-dark.png');
const ARTIFACT_DIR = 'C:/Users/AL GHANI/.gemini/antigravity/brain/6d499bbe-0480-48b7-b73f-6dbb6b9ccccf';

(async () => {
  const browser = await chromium.launch();
  
  // 1. Screenshot "/" at 1288x719, DPR 2 (2576x1438)
  const page = await browser.newPage({
    viewport: { width: 1288, height: 719 },
    deviceScaleFactor: 2
  });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  // Measure getBoundingClientRect
  const bboxes = await page.evaluate(() => {
    const getBox = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x * 10) / 10,
        y: Math.round(r.y * 10) / 10,
        w: Math.round(r.width * 10) / 10,
        h: Math.round(r.height * 10) / 10,
        right: Math.round(r.right * 10) / 10,
        bottom: Math.round(r.bottom * 10) / 10,
        cx: Math.round((r.x + r.width / 2) * 10) / 10,
        cy: Math.round((r.y + r.height / 2) * 10) / 10
      };
    };

    return {
      pill: getBox('.cnav-pill'),
      cta: getBox('.cnav-cta'),
      themeToggle: getBox('.cnav-theme'),
      badge: getBox('.cx-badge'),
      h1Line1: getBox('.cx-h1 span:first-child'),
      h1Line2: getBox('.cx-h1 span.cx-grad'),
      sub: getBox('.cx-sub'),
      btnPrimary: getBox('.cx-hbtn--primary'),
      btnSecondary: getBox('.cx-hbtn--ghost'),
      ring: getBox('.cx-hero__ring'),
      tablet: getBox('.cx-tablet'),
      tabletTopRim: getBox('.cx-tablet')
    };
  });

  const actualBuf = await page.screenshot();
  const actualPath = path.resolve('reference/actual-hero-dark.png');
  fs.writeFileSync(actualPath, actualBuf);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'actual-hero-dark-2576x1438.png'), actualBuf);

  // 2. Perform pixel diff on 16x9 grid in Playwright canvas
  const canvasPage = await browser.newPage({
    viewport: { width: 1288, height: 719 },
    deviceScaleFactor: 2
  });

  const actualBase64 = actualBuf.toString('base64');
  const targetBase64 = fs.readFileSync(TARGET_PATH).toString('base64');

  const diffReport = await canvasPage.evaluate(async ({ actualBase64, targetBase64 }) => {
    const W = 2576;
    const H = 1438;
    const COLS = 16;
    const ROWS = 9;
    const cellW = W / COLS;
    const cellH = H / ROWS;

    const loadImg = (b64) => new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = 'data:image/png;base64,' + b64;
    });

    const [imgActual, imgTarget] = await Promise.all([
      loadImg(actualBase64),
      loadImg(targetBase64)
    ]);

    // Canvas for actual
    const cAct = document.createElement('canvas');
    cAct.width = W; cAct.height = H;
    const ctxAct = cAct.getContext('2d');
    ctxAct.drawImage(imgActual, 0, 0, W, H);
    const dataAct = ctxAct.getImageData(0, 0, W, H).data;

    // Canvas for target
    const cTgt = document.createElement('canvas');
    cTgt.width = W; cTgt.height = H;
    const ctxTgt = cTgt.getContext('2d');
    ctxTgt.drawImage(imgTarget, 0, 0, W, H);
    const dataTgt = ctxTgt.getImageData(0, 0, W, H).data;

    // Mask definition: cells containing legitimately changed text
    // Sub paragraph lines 2-3: row 4, cols 4..11
    // Secondary button: row 5, cols 8..11
    const isMasked = (r, c) => {
      if (r === 4 && c >= 4 && c <= 11) return true;
      if (r === 5 && c >= 8 && c <= 11) return true;
      return false;
    };

    // Critical regions definition (must have 0 failures)
    const isNavbar = (r, c) => r === 0;
    const isBeam = (r, c) => r <= 3 && c <= 4;
    const isRing = (r, c) => (r >= 1 && r <= 3) && (c >= 11 && c <= 14);
    const isTabletRim = (r, c) => r === 6 && (c >= 2 && c <= 13);

    const grid = [];
    let passCount = 0;
    let failCount = 0;
    let maskedCount = 0;

    let navbarFails = 0;
    let beamFails = 0;
    let ringFails = 0;
    let tabletRimFails = 0;

    // Heatmap canvas
    const cHeat = document.createElement('canvas');
    cHeat.width = W; cHeat.height = H;
    const ctxHeat = cHeat.getContext('2d');
    ctxHeat.drawImage(imgActual, 0, 0, W, H);

    for (let r = 0; r < ROWS; r++) {
      const rowArr = [];
      const yStart = Math.floor(r * cellH);
      const yEnd = Math.floor((r + 1) * cellH);

      for (let c = 0; c < COLS; c++) {
        const xStart = Math.floor(c * cellW);
        const xEnd = Math.floor((c + 1) * cellW);

        let sumDiff = 0;
        let count = 0;

        for (let y = yStart; y < yEnd; y += 2) {
          for (let x = xStart; x < xEnd; x += 2) {
            const idx = (y * W + x) * 4;
            const dr = Math.abs(dataAct[idx] - dataTgt[idx]);
            const dg = Math.abs(dataAct[idx + 1] - dataTgt[idx + 1]);
            const db = Math.abs(dataAct[idx + 2] - dataTgt[idx + 2]);
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
          if (isNavbar(r, c)) navbarFails++;
          if (isBeam(r, c)) beamFails++;
          if (isRing(r, c)) ringFails++;
          if (isTabletRim(r, c)) tabletRimFails++;
        }

        // Draw heatmap box
        ctxHeat.lineWidth = 2;
        if (masked) {
          ctxHeat.fillStyle = 'rgba(59, 130, 246, 0.25)';
          ctxHeat.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        } else if (pass) {
          ctxHeat.fillStyle = 'rgba(34, 197, 94, 0.20)';
          ctxHeat.strokeStyle = 'rgba(34, 197, 94, 0.7)';
        } else {
          ctxHeat.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctxHeat.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        }
        ctxHeat.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
        ctxHeat.strokeRect(xStart, yStart, xEnd - xStart, yEnd - yStart);

        rowArr.push({
          row: r,
          col: c,
          meanDiff: Math.round(meanDiff * 10) / 10,
          pass,
          masked
        });
      }
      grid.push(rowArr);
    }

    const totalCells = COLS * ROWS;
    const effectiveTotal = totalCells - maskedCount;
    const passRate = (passCount / effectiveTotal) * 100;

    // Overlay 50%
    const cOver = document.createElement('canvas');
    cOver.width = W; cOver.height = H;
    const ctxOver = cOver.getContext('2d');
    ctxOver.drawImage(imgActual, 0, 0, W, H);
    ctxOver.globalAlpha = 0.5;
    ctxOver.drawImage(imgTarget, 0, 0, W, H);

    return {
      passRate: Math.round(passRate * 10) / 10,
      passCount,
      failCount,
      maskedCount,
      navbarFails,
      beamFails,
      ringFails,
      tabletRimFails,
      overallPass: passRate >= 90 && navbarFails === 0 && beamFails === 0 && ringFails === 0 && tabletRimFails === 0,
      grid,
      heatmapBase64: cHeat.toDataURL('image/png').split(',')[1],
      overlayBase64: cOver.toDataURL('image/png').split(',')[1]
    };
  }, { actualBase64, targetBase64 });

  // Save artifacts
  fs.writeFileSync(path.resolve('reference/hero-diff-heatmap.png'), Buffer.from(diffReport.heatmapBase64, 'base64'));
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-heatmap.png'), Buffer.from(diffReport.heatmapBase64, 'base64'));

  fs.writeFileSync(path.resolve('reference/hero-diff-overlay.png'), Buffer.from(diffReport.overlayBase64, 'base64'));
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-overlay.png'), Buffer.from(diffReport.overlayBase64, 'base64'));

  // Side-by-side
  const sbsPage = await browser.newPage({ viewport: { width: 2576, height: 719 } });
  await sbsPage.setContent(`
    <html><body style="margin:0;overflow:hidden;background:#000;">
      <canvas id="c" width="2576" height="719"></canvas>
    </body></html>
  `);
  await sbsPage.evaluate(({ actualBase64, targetBase64 }) => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const imgT = new Image();
    imgT.src = 'data:image/png;base64,' + targetBase64;
    const imgA = new Image();
    imgA.src = 'data:image/png;base64,' + actualBase64;
    return Promise.all([
      new Promise(r => imgT.onload = r),
      new Promise(r => imgA.onload = r)
    ]).then(() => {
      ctx.drawImage(imgT, 0, 0, 1288, 719);
      ctx.drawImage(imgA, 1288, 0, 1288, 719);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('TARGET REFERENCE', 24, 36);
      ctx.fillText('ACTUAL (PHASE 2f)', 1312, 36);
    });
  }, { actualBase64, targetBase64 });
  const sbsBuf = await sbsPage.screenshot();
  fs.writeFileSync(path.resolve('reference/hero-diff-sbs.png'), sbsBuf);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-sbs.png'), sbsBuf);

  // Compare bounding boxes to Target
  const targetBoxes = {
    pill: { x: 112, y: 12, w: 1063, h: 58 },
    cta: { x: 1075, y: 22, w: 124, h: 39 },
    badge: { x: 428, y: 116, w: 431, h: 31 },
    h1Line1: { x: 298, y: 158, w: 692, h: 70 },
    h1Line2: { x: 251, y: 227, w: 786, h: 74 },
    sub: { x: 332, y: 313, w: 624, h: 70 },
    btnPrimary: { x: 419, y: 398, w: 274, h: 42 },
    btnSecondary: { x: 707, y: 398, w: 161, h: 42 },
    ring: { cx: 967, cy: 278, w: 275, h: 275 },
    tabletTopRim: { y: 490 }
  };

  const toleranceCheck = (target, actual) => {
    if (!actual) return { pass: false, delta: 'MISSING' };
    const dx = actual.x !== undefined ? actual.x - target.x : 0;
    const dy = actual.y !== undefined ? actual.y - target.y : 0;
    const dwPct = target.w ? ((actual.w - target.w) / target.w) * 100 : 0;
    const passPos = Math.abs(dx) <= 8 && Math.abs(dy) <= 8;
    const passWidth = Math.abs(dwPct) <= 2;
    return {
      pass: passPos && passWidth,
      dx: Math.round(dx * 10) / 10,
      dy: Math.round(dy * 10) / 10,
      dwPct: Math.round(dwPct * 10) / 10
    };
  };

  const bboxResults = {
    pill: { target: targetBoxes.pill, actual: bboxes.pill, check: toleranceCheck(targetBoxes.pill, bboxes.pill) },
    badge: { target: targetBoxes.badge, actual: bboxes.badge, check: toleranceCheck(targetBoxes.badge, bboxes.badge) },
    h1Line1: { target: targetBoxes.h1Line1, actual: bboxes.h1Line1, check: toleranceCheck(targetBoxes.h1Line1, bboxes.h1Line1) },
    h1Line2: { target: targetBoxes.h1Line2, actual: bboxes.h1Line2, check: toleranceCheck(targetBoxes.h1Line2, bboxes.h1Line2) },
    sub: { target: targetBoxes.sub, actual: bboxes.sub, check: toleranceCheck(targetBoxes.sub, bboxes.sub) },
    btnPrimary: { target: targetBoxes.btnPrimary, actual: bboxes.btnPrimary, check: toleranceCheck(targetBoxes.btnPrimary, bboxes.btnPrimary) },
    btnSecondary: { target: targetBoxes.btnSecondary, actual: bboxes.btnSecondary, check: toleranceCheck(targetBoxes.btnSecondary, bboxes.btnSecondary) },
    ring: {
      target: targetBoxes.ring,
      actual: { cx: bboxes.ring?.cx, cy: bboxes.ring?.cy, w: bboxes.ring?.w, h: bboxes.ring?.h },
      check: {
        pass: Math.abs(bboxes.ring.cx - 967) <= 8 && Math.abs(bboxes.ring.cy - 278) <= 8,
        dcx: Math.round((bboxes.ring.cx - 967) * 10) / 10,
        dcy: Math.round((bboxes.ring.cy - 278) * 10) / 10
      }
    },
    tabletTopRim: {
      target: 490,
      actual: bboxes.tabletTopRim?.y,
      check: {
        pass: Math.abs(bboxes.tabletTopRim.y - 490) <= 8,
        dy: Math.round((bboxes.tabletTopRim.y - 490) * 10) / 10
      }
    }
  };

  const fullReport = {
    bboxes,
    bboxResults,
    pixelDiff: {
      passRate: diffReport.passRate,
      passCount: diffReport.passCount,
      failCount: diffReport.failCount,
      maskedCount: diffReport.maskedCount,
      navbarFails: diffReport.navbarFails,
      beamFails: diffReport.beamFails,
      ringFails: diffReport.ringFails,
      tabletRimFails: diffReport.tabletRimFails,
      overallPass: diffReport.overallPass
    }
  };

  console.log(JSON.stringify(fullReport, null, 2));

  await browser.close();
})();
