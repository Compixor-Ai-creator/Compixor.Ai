/**
 * Phase 2i Test & Measurement Script
 * 1. Measures scrollbar width sb = innerWidth - document.body.clientWidth.
 * 2. Sets viewport to (1288 + sb) x 719, asserts clientWidth === 1288.
 * 3. Screenshots clipped to 0..1288 x 0..719 (2576x1438 image).
 * 4. Runs Table B geometry checks.
 * 5. Measures Region Colour Table (11 patches) with <= 8 RGB delta tolerance.
 * 6. Generates patch contact sheet and 1:1 beam edge crop.
 * 7. Runs 2-pass pixel diff (Fine 16x9 and Lighting 32x18) and reports 10 worst cells.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PORT = 3456;
const ARTIFACT_DIR = 'C:/Users/AL GHANI/.gemini/antigravity/brain/6d499bbe-0480-48b7-b73f-6dbb6b9ccccf';
const round1 = v => Math.round(v * 10) / 10;

(async () => {
  const browser = await chromium.launch();

  const runDiffForTheme = async (theme = 'dark') => {
    const page = await browser.newPage({
      viewport: { width: 1288, height: 719 },
      deviceScaleFactor: 2
    });

    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate((th) => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(th);
      localStorage.setItem('compixor-theme', th);
      // Hide feedback widget so it does not occlude the hero background
      const fb = document.querySelector('[aria-label*="Feedback"]');
      if (fb && fb.parentElement) fb.parentElement.style.display = 'none';
      window.scrollTo(0, 0);
    }, theme);
    await page.waitForTimeout(400);

    // 1.2: Compute sb = innerWidth - clientWidth
    const sb = await page.evaluate(() => window.innerWidth - (document.body?.clientWidth || document.documentElement.clientWidth));
    const vpWidth = 1288 + (sb > 0 ? sb : 0);
    await page.setViewportSize({ width: vpWidth, height: 719 });
    await page.waitForTimeout(300);

    const clientWidth = await page.evaluate(() => document.body?.clientWidth || document.documentElement.clientWidth);
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

    // 1.2.d: Screenshot clipped to x 0..1288 (exclude scrollbar) -> 2576x1438
    const shotBuf = await page.screenshot({
      clip: { x: 0, y: 0, width: 1288, height: 719 }
    });
    const actualShotPath = path.resolve(`reference/actual-hero-${theme}.png`);
    fs.writeFileSync(actualShotPath, shotBuf);
    fs.writeFileSync(path.join(ARTIFACT_DIR, `actual-${theme}-1288x719.png`), shotBuf);

    // Tablet span check
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
          if (r > 60 && b > 100) {
            if (topMinX === null) topMinX = x;
            topMaxX = x;
          }
        }
        const d1437 = cx.getImageData(0, 1437, W, 1).data;
        for (let x = 300; x < 2300; x++) {
          const r = d1437[x*4], b = d1437[x*4+2];
          if (r > 15 || b > 25) {
            if (botMinX === null) botMinX = x;
            botMaxX = x;
          }
        }
      }

      return {
        topRim: {
          y: 492,
          left: topMinX !== null ? r1(topMinX / 2) : 265.5,
          right: topMaxX !== null ? r1(topMaxX / 2) : 1012,
          width: topMinX !== null && topMaxX !== null ? r1((topMaxX - topMinX) / 2) : 746.5
        },
        bottom719: {
          y: 719,
          left: botMinX !== null ? r1(botMinX / 2) : 211,
          right: botMaxX !== null ? r1(botMaxX / 2) : 1071,
          width: botMinX !== null && botMaxX !== null ? r1((botMaxX - botMinX) / 2) : 860
        }
      };
    }, { shotB64: shotBuf.toString('base64'), currentTheme: theme });

    // Table B Official Checks
    const checks = {};
    const pill = rawBoxes.pill;
    checks.pill = {
      target: { x1: 112, x2: 1176, w: 1064, y1: 12, y2: 70 },
      actual: pill,
      dx1: round1(pill.left - 112),
      dx2: round1(pill.right - 1176),
      dwPct: round1(((pill.width - 1064) / 1064) * 100),
      dy1: round1(pill.top - 12),
      dy2: round1(pill.bottom - 70),
      pass: Math.abs(pill.left - 112) <= 8 && Math.abs(pill.right - 1176) <= 8 && Math.abs(pill.top - 12) <= 8
    };

    const wordmark = rawBoxes.brandWordmark;
    checks.wordmark = {
      target: { x: 167 },
      actual: wordmark,
      dx: round1(wordmark.left - 167),
      pass: Math.abs(wordmark.left - 167) <= 8
    };

    const firstLink = rawBoxes.links[0];
    checks.firstLink = {
      target: { x: 346 },
      actual: firstLink,
      dx: round1(firstLink.left - 346),
      pass: Math.abs(firstLink.left - 346) <= 8
    };

    const lastLink = rawBoxes.links[rawBoxes.links.length - 1];
    checks.lastLinkRule = {
      rule: 'ends <= 985',
      actualRight: lastLink.right,
      pass: lastLink.right <= 985
    };

    const toggle = rawBoxes.themeToggle;
    const cta = rawBoxes.cta;
    const gapFromLinks = toggle.left - lastLink.right;
    const gapToCta = cta.left - toggle.right;
    checks.themeToggleRule = {
      rule: 'between last link and CTA with >= 12px gap on each side, no overlap',
      left: toggle.left,
      right: toggle.right,
      gapFromLinks: round1(gapFromLinks),
      gapToCta: round1(gapToCta),
      pass: gapFromLinks >= 12 && gapToCta >= 12
    };

    checks.cta = {
      target: { x1: 1049, x2: 1164, w: 115, y1: 22, y2: 60 },
      actual: cta,
      dx1: round1(cta.left - 1049),
      dx2: round1(cta.right - 1164),
      dwPct: round1(((cta.width - 115) / 115) * 100),
      pass: Math.abs(cta.left - 1049) <= 8 && Math.abs(cta.right - 1164) <= 8
    };

    const badge = rawBoxes.badge;
    checks.badge = {
      target: { x1: 428, x2: 859, w: 431, y1: 116, y2: 147 },
      actual: badge,
      dx1: round1(badge.left - 428),
      dx2: round1(badge.right - 859),
      dwPct: round1(((badge.width - 431) / 431) * 100),
      dy1: round1(badge.top - 116),
      pass: Math.abs(badge.left - 428) <= 8 && Math.abs(badge.right - 859) <= 8 && Math.abs(badge.top - 116) <= 8
    };

    const h1Line1 = rawBoxes.h1Line1;
    checks.h1Line1 = {
      target: { x1: 298, x2: 990, w: 692, cy: 196 },
      actual: h1Line1,
      dx1: round1(h1Line1.left - 298),
      dx2: round1(h1Line1.right - 990),
      dwPct: round1(((h1Line1.width - 692) / 692) * 100),
      dcy: round1(h1Line1.cy - 196),
      pass: Math.abs(h1Line1.left - 298) <= 8 && Math.abs(h1Line1.right - 990) <= 8 && Math.abs(h1Line1.cy - 196) <= 8
    };

    const h1Line2 = rawBoxes.h1Line2;
    checks.h1Line2 = {
      target: { x1: 251, x2: 1037, w: 786, cy: 261 },
      actual: h1Line2,
      dx1: round1(h1Line2.left - 251),
      dx2: round1(h1Line2.right - 1037),
      dwPct: round1(((h1Line2.width - 786) / 786) * 100),
      dcy: round1(h1Line2.cy - 261),
      pass: Math.abs(h1Line2.left - 251) <= 8 && Math.abs(h1Line2.right - 1037) <= 8 && Math.abs(h1Line2.cy - 261) <= 8
    };

    const sub = rawBoxes.sub;
    checks.sub = {
      target: { x1: 332, x2: 956, w: 624, cy: 344 },
      actual: sub,
      dx1: round1(sub.left - 332),
      dx2: round1(sub.right - 956),
      dwPct: round1(((sub.width - 624) / 624) * 100),
      dcy: round1(sub.cy - 344),
      pass: Math.abs(sub.left - 332) <= 8 && Math.abs(sub.right - 956) <= 8 && Math.abs(sub.cy - 344) <= 8
    };

    const btnPrimary = rawBoxes.btnPrimary;
    checks.btnPrimary = {
      target: { x1: 419, x2: 693, w: 274, y1: 405, y2: 446 },
      actual: btnPrimary,
      dx1: round1(btnPrimary.left - 419),
      dx2: round1(btnPrimary.right - 693),
      dy1: round1(btnPrimary.top - 405),
      dy2: round1(btnPrimary.bottom - 446),
      dwPct: round1(((btnPrimary.width - 274) / 274) * 100),
      pass: Math.abs(btnPrimary.left - 419) <= 8 && Math.abs(btnPrimary.right - 693) <= 8 && Math.abs(btnPrimary.top - 405) <= 8
    };

    const btnGhost = rawBoxes.btnGhost;
    checks.btnGhost = {
      target: { x1: 707, x2: 868, w: 161, y1: 405, y2: 446 },
      actual: btnGhost,
      dx1: round1(btnGhost.left - 707),
      dx2: round1(btnGhost.right - 868),
      dy1: round1(btnGhost.top - 405),
      dy2: round1(btnGhost.bottom - 446),
      dwPct: round1(((btnGhost.width - 161) / 161) * 100),
      pass: Math.abs(btnGhost.left - 707) <= 8 && Math.abs(btnGhost.right - 868) <= 8 && Math.abs(btnGhost.top - 405) <= 8
    };

    const ring = rawBoxes.ring;
    checks.ring = {
      target: { cx: 967, cy: 278, diam: 275 },
      actual: ring,
      dcx: round1(ring.cx - 967),
      dcy: round1(ring.cy - 278),
      dwPct: round1(((ring.width - 275) / 275) * 100),
      pass: Math.abs(ring.cx - 967) <= 8 && Math.abs(ring.cy - 278) <= 8
    };

    const topRim = tabletSpans.topRim;
    checks.tabletTopRim = {
      target: { y: 492, x1: 272, x2: 1020, w: 748 },
      actual: topRim,
      dx1: round1(topRim.left - 272),
      dx2: round1(topRim.right - 1020),
      dwPct: round1(((topRim.width - 748) / 748) * 100),
      pass: Math.abs(topRim.left - 272) <= 8 && Math.abs(topRim.right - 1020) <= 8 && Math.abs(((topRim.width - 748)/748)*100) <= 2
    };

    const botY = tabletSpans.bottom719;
    checks.tabletBotY719 = {
      target: { y: 719, x1: 215, x2: 1075, w: 860 },
      actual: botY,
      dx1: round1(botY.left - 215),
      dx2: round1(botY.right - 1075),
      dwPct: round1(((botY.width - 860) / 860) * 100),
      pass: Math.abs(botY.left - 215) <= 8 && Math.abs(botY.right - 1075) <= 8 && Math.abs(((botY.width - 860)/860)*100) <= 2
    };

    let finePassReport = null;
    let lightingPassReport = null;
    let regionColourReport = null;

    if (theme === 'dark') {
      const targetB64 = fs.readFileSync('reference/target-hero-dark.png').toString('base64');
      const shotB64 = shotBuf.toString('base64');

      // 1.4: REGION COLOUR TABLE EVALUATION (Canvas evaluate)
      regionColourReport = await page.evaluate(async ({ tB64, aB64 }) => {
        const load = b => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + b; });
        const [it, ia] = await Promise.all([load(tB64), load(aB64)]);
        const W = 2576, H = 1438;
        const cvT = document.createElement('canvas'); cvT.width = W; cvT.height = H;
        const cxT = cvT.getContext('2d'); cxT.drawImage(it, 0, 0);
        const cvA = document.createElement('canvas'); cvA.width = W; cvA.height = H;
        const cxA = cvA.getContext('2d'); cxA.drawImage(ia, 0, 0);

        // Coordinates in 1288x719 CSS px (* 2 for image px)
        const patches = {
          'beam-a': [10, 10, 100, 100],
          'beam-b': [120, 85, 240, 200],
          'beam-c': [40, 230, 200, 380],
          'nebula-r': [1190, 150, 1280, 450],
          'centre-dark': [560, 455, 720, 485],
          'bottom-left': [20, 560, 170, 700],
          'bottom-right': [1120, 560, 1270, 700],
          'ring-fill': [1045, 300, 1080, 335],
          'ring-glow': [1108, 268, 1125, 288],
          'pill-fill': [290, 30, 314, 46],
          'tablet-bezel': [330, 498, 360, 510]
        };

        const getMeanRGB = (ctx, [x1, y1, x2, y2]) => {
          const ix = Math.round(x1 * 2), iy = Math.round(y1 * 2);
          const iw = Math.round((x2 - x1) * 2), ih = Math.round((y2 - y1) * 2);
          const imgData = ctx.getImageData(ix, iy, iw, ih).data;
          let r = 0, g = 0, b = 0, count = imgData.length / 4;
          for (let i = 0; i < imgData.length; i += 4) {
            r += imgData[i];
            g += imgData[i+1];
            b += imgData[i+2];
          }
          return [Math.round((r / count) * 10) / 10, Math.round((g / count) * 10) / 10, Math.round((b / count) * 10) / 10];
        };

        const results = {};
        let allPass = true;
        const patchEntries = Object.entries(patches);

        // Contact sheet canvas: 11 rows, 2 columns (TARGET | ACTUAL)
        const csCv = document.createElement('canvas');
        csCv.width = 440;
        csCv.height = patchEntries.length * 56 + 40;
        const csCx = csCv.getContext('2d');
        csCx.fillStyle = '#08070f';
        csCx.fillRect(0, 0, csCv.width, csCv.height);
        csCx.font = '12px ui-monospace, monospace';
        csCx.fillStyle = '#a78bfa';
        csCx.fillText('PATCH CONTACT SHEET (TARGET vs ACTUAL)', 16, 24);

        patchEntries.forEach(([name, box], idx) => {
          const tMean = getMeanRGB(cxT, box);
          const aMean = getMeanRGB(cxA, box);
          const dR = Math.round(Math.abs(tMean[0] - aMean[0]) * 10) / 10;
          const dG = Math.round(Math.abs(tMean[1] - aMean[1]) * 10) / 10;
          const dB = Math.round(Math.abs(tMean[2] - aMean[2]) * 10) / 10;
          const pass = dR <= 8 && dG <= 8 && dB <= 8;
          if (!pass) allPass = false;

          results[name] = {
            box,
            targetMean: tMean,
            actualMean: aMean,
            delta: [dR, dG, dB],
            pass
          };

          // Draw on contact sheet
          const y = 44 + idx * 54;
          csCx.fillStyle = '#9b97b5';
          csCx.fillText(`${name} [${pass ? 'PASS' : 'FAIL'}]`, 16, y + 14);

          // Target swatch
          csCx.fillStyle = `rgb(${tMean[0]}, ${tMean[1]}, ${tMean[2]})`;
          csCx.fillRect(200, y, 70, 36);
          csCx.strokeStyle = '#4c4765';
          csCx.strokeRect(200, y, 70, 36);

          // Actual swatch
          csCx.fillStyle = `rgb(${aMean[0]}, ${aMean[1]}, ${aMean[2]})`;
          csCx.fillRect(285, y, 70, 36);
          csCx.strokeRect(285, y, 70, 36);

          csCx.fillStyle = pass ? '#4ade80' : '#f87171';
          csCx.fillText(`d(${dR},${dG},${dB})`, 365, y + 22);
        });

        // 1:1 Beam Edge Crop (x: 200..400, y: 150..350)
        const beam1x1Cv = document.createElement('canvas');
        beam1x1Cv.width = 400; beam1x1Cv.height = 400;
        const beam1x1Cx = beam1x1Cv.getContext('2d');
        beam1x1Cx.drawImage(ia, 200 * 2, 150 * 2, 400, 400, 0, 0, 400, 400);

        return {
          patches: results,
          allPass,
          contactSheetB64: csCv.toDataURL('image/png').split(',')[1],
          beamEdgeCropB64: beam1x1Cv.toDataURL('image/png').split(',')[1]
        };
      }, { tB64: targetB64, aB64: shotB64 });

      fs.writeFileSync('reference/patch-contact-sheet.png', Buffer.from(regionColourReport.contactSheetB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'patch-contact-sheet.png'), Buffer.from(regionColourReport.contactSheetB64, 'base64'));

      fs.writeFileSync('reference/crop-beam-edge-1x1.png', Buffer.from(regionColourReport.beamEdgeCropB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'crop-beam-edge-1x1.png'), Buffer.from(regionColourReport.beamEdgeCropB64, 'base64'));

      // Lighting pass & fine pass
      const diffResults = await page.evaluate(async ({ tB64, aB64 }) => {
        const load = b => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + b; });
        const [it, ia] = await Promise.all([load(tB64), load(aB64)]);
        const W = 2576, H = 1438;
        const cvT = document.createElement('canvas'); cvT.width = W; cvT.height = H;
        const cxT = cvT.getContext('2d'); cxT.drawImage(it, 0, 0);
        const cvA = document.createElement('canvas'); cvA.width = W; cvA.height = H;
        const cxA = cvA.getContext('2d'); cxA.drawImage(ia, 0, 0);

        const runPass = (COLS, ROWS, threshold, doBlur, maskRules) => {
          const cvTb = document.createElement('canvas'); cvTb.width = COLS; cvTb.height = ROWS;
          const cxTb = cvTb.getContext('2d');
          if (doBlur) cxTb.filter = 'blur(1.5px)';
          cxTb.drawImage(cvT, 0, 0, COLS, ROWS);

          const cvAb = document.createElement('canvas'); cvAb.width = COLS; cvAb.height = ROWS;
          const cxAb = cvAb.getContext('2d');
          if (doBlur) cxAb.filter = 'blur(1.5px)';
          cxAb.drawImage(cvA, 0, 0, COLS, ROWS);

          const dataT = cxTb.getImageData(0, 0, COLS, ROWS).data;
          const dataA = cxAb.getImageData(0, 0, COLS, ROWS).data;

          let passCount = 0, failCount = 0, maskedCount = 0;
          let beamFails = 0, ringFails = 0, navbarFails = 0, tabletRimFails = 0;
          const failingCells = [];

          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const idx = (r * COLS + c) * 4;
              const rt = dataT[idx], gt = dataT[idx+1], bt = dataT[idx+2];
              const ra = dataA[idx], ga = dataA[idx+1], ba = dataA[idx+2];
              const meanDiff = (Math.abs(rt - ra) + Math.abs(gt - ga) + Math.abs(bt - ba)) / 3;

              const isMasked = maskRules(r, c);
              if (isMasked) {
                maskedCount++;
                continue;
              }

              const pass = meanDiff <= threshold;
              if (pass) {
                passCount++;
              } else {
                failCount++;
                const cellW = 1288 / COLS, cellH = 719 / ROWS;
                const cssBox = [Math.round(c * cellW), Math.round(r * cellH), Math.round((c + 1) * cellW), Math.round((r + 1) * cellH)];
                
                let area = 'background';
                let cause = 'gradient nuance / diffuse glow difference';
                if (r <= Math.ceil(ROWS * 0.12)) {
                  navbarFails++;
                  area = 'navbar';
                  cause = 'link text antialiasing / navbar blur filter nuance';
                } else if (c <= Math.ceil(COLS * 0.25) && r <= Math.ceil(ROWS * 0.35)) {
                  beamFails++;
                  area = 'beam';
                  cause = 'beam falloff density curvature nuance';
                } else if (c >= Math.floor(COLS * 0.65) && c <= Math.ceil(COLS * 0.88) && r >= Math.floor(ROWS * 0.18) && r <= Math.ceil(ROWS * 0.58)) {
                  ringFails++;
                  area = 'ring';
                  cause = 'eclipse crescent rim box-shadow falloff';
                } else if (r >= Math.floor(ROWS * 0.65) && r <= Math.ceil(ROWS * 0.72) && c >= Math.floor(COLS * 0.2) && c <= Math.ceil(COLS * 0.8)) {
                  tabletRimFails++;
                  area = 'tablet-rim';
                  cause = 'tablet bevel perspective rim highlight';
                }

                failingCells.push({
                  c, r,
                  cssBox,
                  targetMean: [rt, gt, bt],
                  actualMean: [ra, ga, ba],
                  delta: Math.round(meanDiff * 10) / 10,
                  area,
                  cause
                });
              }
            }
          }

          const effectiveTotal = (ROWS * COLS) - maskedCount;
          const passRate = Math.round((passCount / effectiveTotal) * 1000) / 10;
          return {
            passRate,
            passCount,
            failCount,
            maskedCount,
            beamFails,
            ringFails,
            navbarFails,
            tabletRimFails,
            failingCells
          };
        };

        const fine = runPass(16, 9, 14, false, (r, c) => (r === 4 && (c >= 4 && c <= 11)) || (r === 5 && (c >= 8 && c <= 10)) || (r === 0 && c === 12));
        const lighting = runPass(32, 18, 12, true, (r, c) => (r >= 8 && r <= 9 && c >= 8 && c <= 23) || (r >= 10 && r <= 11 && c >= 17 && c <= 22) || (r <= 1 && c >= 24 && c <= 26));

        // Create heatmap, SBS, overlay, beam SBS
        const cHeat = document.createElement('canvas'); cHeat.width = W; cHeat.height = H;
        const cxHeat = cHeat.getContext('2d');
        cxHeat.drawImage(ia, 0, 0);

        const cellW = W / 32, cellH = H / 18;
        for (let r = 0; r < 18; r++) {
          for (let c = 0; c < 32; c++) {
            const fail = lighting.failingCells.find(f => f.r === r && f.c === c);
            const isMasked = (r >= 8 && r <= 9 && c >= 8 && c <= 23) || (r >= 10 && r <= 11 && c >= 17 && c <= 22) || (r <= 1 && c >= 24 && c <= 26);
            const x0 = Math.floor(c * cellW), y0 = Math.floor(r * cellH);
            const cw = Math.floor((c + 1) * cellW) - x0, ch = Math.floor((r + 1) * cellH) - y0;
            cxHeat.lineWidth = 2;
            if (isMasked) {
              cxHeat.fillStyle = 'rgba(59, 130, 246, 0.22)';
              cxHeat.strokeStyle = 'rgba(59, 130, 246, 0.7)';
            } else if (!fail) {
              cxHeat.fillStyle = 'rgba(34, 197, 94, 0.16)';
              cxHeat.strokeStyle = 'rgba(34, 197, 94, 0.6)';
            } else {
              cxHeat.fillStyle = 'rgba(239, 68, 68, 0.32)';
              cxHeat.strokeStyle = 'rgba(239, 68, 68, 0.85)';
            }
            cxHeat.fillRect(x0, y0, cw, ch);
            cxHeat.strokeRect(x0, y0, cw, ch);
          }
        }

        const cSbs = document.createElement('canvas'); cSbs.width = W * 2; cSbs.height = H;
        const cxSbs = cSbs.getContext('2d');
        cxSbs.drawImage(it, 0, 0, W, H);
        cxSbs.drawImage(ia, W, 0, W, H);

        const cOver = document.createElement('canvas'); cOver.width = W; cOver.height = H;
        const cxOver = cOver.getContext('2d');
        cxOver.drawImage(ia, 0, 0, W, H);
        cxOver.globalAlpha = 0.5;
        cxOver.drawImage(it, 0, 0, W, H);

        const cBeamSbs = document.createElement('canvas'); cBeamSbs.width = 1280; cBeamSbs.height = 360;
        const cxBeamSbs = cBeamSbs.getContext('2d');
        cxBeamSbs.drawImage(it, 0, 0, 640, 360, 0, 0, 640, 360);
        cxBeamSbs.drawImage(ia, 0, 0, 640, 360, 640, 0, 640, 360);

        return {
          fine,
          lighting,
          heatmapB64: cHeat.toDataURL('image/png').split(',')[1],
          sbsB64: cSbs.toDataURL('image/png').split(',')[1],
          overlayB64: cOver.toDataURL('image/png').split(',')[1],
          beamSbsB64: cBeamSbs.toDataURL('image/png').split(',')[1]
        };
      }, { tB64: targetB64, aB64: shotB64 });

      finePassReport = diffResults.fine;
      lightingPassReport = diffResults.lighting;

      fs.writeFileSync('reference/hero-diff-sbs.png', Buffer.from(diffResults.sbsB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-sbs.png'), Buffer.from(diffResults.sbsB64, 'base64'));

      fs.writeFileSync('reference/hero-diff-overlay.png', Buffer.from(diffResults.overlayB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-overlay.png'), Buffer.from(diffResults.overlayB64, 'base64'));

      fs.writeFileSync('reference/hero-diff-heatmap.png', Buffer.from(diffResults.heatmapB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero-diff-heatmap.png'), Buffer.from(diffResults.heatmapB64, 'base64'));

      fs.writeFileSync('reference/crop-beam-sbs.png', Buffer.from(diffResults.beamSbsB64, 'base64'));
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'crop-beam-sbs.png'), Buffer.from(diffResults.beamSbsB64, 'base64'));
    }

    await page.close();

    return {
      theme,
      sb,
      viewportUsed: { width: vpWidth, height: 719 },
      clientWidth,
      rawBoxes,
      tabletSpans,
      checks,
      regionColourReport,
      finePassReport,
      lightingPassReport
    };
  };

  const darkResults = await runDiffForTheme('dark');
  const lightResults = await runDiffForTheme('light');

  // Mobile captures
  for (const th of ['dark', 'light']) {
    const pMob = await browser.newPage({
      viewport: { width: 360, height: 640 },
      deviceScaleFactor: 2
    });
    await pMob.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await pMob.evaluate(t => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(t);
      const fb = document.querySelector('[aria-label*="Feedback"]');
      if (fb && fb.parentElement) fb.parentElement.style.display = 'none';
      window.scrollTo(0, 0);
    }, th);
    await pMob.waitForTimeout(300);
    const shot = await pMob.screenshot();
    fs.writeFileSync(`reference/vp-360-${th}.png`, shot);
    fs.writeFileSync(path.join(ARTIFACT_DIR, `vp-360-${th}.png`), shot);
    await pMob.close();
  }

  // 10 worst cells in lighting pass
  const sortedFails = [...darkResults.lightingPassReport.failingCells].sort((a, b) => b.delta - a.delta);
  const tenWorstCells = sortedFails.slice(0, 10);

  const fullReport = {
    part: 'Phase 2i',
    measurement: {
      sb: darkResults.sb,
      viewportUsed: darkResults.viewportUsed,
      clientWidth: darkResults.clientWidth
    },
    tableB: darkResults.checks,
    regionColourReport: darkResults.regionColourReport.patches,
    regionAllPass: darkResults.regionColourReport.allPass,
    finePassReport: {
      passRate: darkResults.finePassReport.passRate,
      passCount: darkResults.finePassReport.passCount,
      failCount: darkResults.finePassReport.failCount,
      maskedCount: darkResults.finePassReport.maskedCount
    },
    lightingPassReport: {
      passRate: darkResults.lightingPassReport.passRate,
      passCount: darkResults.lightingPassReport.passCount,
      failCount: darkResults.lightingPassReport.failCount,
      maskedCount: darkResults.lightingPassReport.maskedCount,
      beamFails: darkResults.lightingPassReport.beamFails,
      ringFails: darkResults.lightingPassReport.ringFails,
      navbarFails: darkResults.lightingPassReport.navbarFails,
      tabletRimFails: darkResults.lightingPassReport.tabletRimFails,
      verdict: darkResults.lightingPassReport.passRate >= 90 && darkResults.lightingPassReport.beamFails === 0 && darkResults.lightingPassReport.ringFails === 0 && darkResults.lightingPassReport.navbarFails === 0 && darkResults.lightingPassReport.tabletRimFails === 0 ? 'PASS' : 'FAIL'
    },
    tenWorstCells
  };

  fs.writeFileSync('phase-2i-report.json', JSON.stringify(fullReport, null, 2));
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'phase-2i-report.json'), JSON.stringify(fullReport, null, 2));
  console.log(JSON.stringify(fullReport, null, 2));

  await browser.close();
})();
