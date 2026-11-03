/* ============================================================================
   PERF DIAGNOSE — kaun si cheez site ko hang kar rahi hai, exact naam ke saath
   ----------------------------------------------------------------------------
   CHALAYEIN: Chrome DevTools → Console → poora file paste → Enter
   Phir 5-6 second tak page scroll karein aur animations chalne dein.
   Fir console me `perfReport()` likhein.

   Yeh batata hai:
   • kaun se elements animate ho rahe hain AUR un par blur hai (= #1 jank)
   • kitne backdrop-filter / blur / box-shadow live hain
   • kitni infinite animations chal rahi hain
   • kaun se elements GPU layer bana rahe hain (VRAM)
   • actual FPS + dropped frames
   ============================================================================ */

(function perfDiagnose() {
  const report = {
    fps: null,
    worstFrame: null,
    droppedFrames: null,
    animatedWithBlur: [],
    liveBackdropFilters: [],
    infiniteAnimations: [],
    glowBlobs: [],
    gpuLayers: [],
    heavyShadows: 0,
    summary: '',
  };

  /* ---------- 1. live styles scan ---------- */
  function scanDOM() {
    report.animatedWithBlur = [];
    report.liveBackdropFilters = [];
    report.infiniteAnimations = [];
    report.glowBlobs = [];
    report.gpuLayers = [];
    report.heavyShadows = 0;

    const all = document.querySelectorAll('body *');
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none') continue;

      const name = (() => {
        if (el.id) return '#' + el.id;
        const c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        return el.tagName.toLowerCase() + (c ? '.' + c : '');
      })();

      const hasBlur = (cs.backdropFilter && cs.backdropFilter !== 'none') ||
                      (cs.filter && /blur/.test(cs.filter));
      const isAnimated = cs.animationName !== 'none';

      /* 1a. animated + blur = jank ka #1 source */
      if (hasBlur && isAnimated) {
        report.animatedWithBlur.push({
          element: name,
          animation: cs.animationName,
          backdrop: cs.backdropFilter || 'none',
          filter: cs.filter || 'none',
          area: Math.round(el.getBoundingClientRect().width) + 'x' + Math.round(el.getBoundingClientRect().height),
          webkit: el.style.webkitBackdropFilter ? 'inline' : 'css',
        });
      }
      /* 1b. blur elements (animated ho ya na ho) */
      else if (hasBlur) {
        const r = el.getBoundingClientRect();
        report.liveBackdropFilters.push({
          element: name,
          blur: cs.backdropFilter || cs.filter,
          area: Math.round(r.width) + 'x' + Math.round(r.height),
          pixels: Math.round(r.width * r.height),
        });
      }

      /* 1c. infinite animations */
      if (isAnimated && /infinite/.test(cs.animationIterationCount)) {
        report.infiniteAnimations.push({
          element: name,
          animation: cs.animationName,
          duration: cs.animationDuration,
          properties: cs.animationTimeline || 'auto',
        });
      }

      /* 1d. bade glow/blob — blur ke bina bhi mehngi */
      const w = el.getBoundingClientRect().width;
      const h = el.getBoundingClientRect().height;
      if (w > 200 && h > 200 && (cs.filter !== 'none' || /blob|glow|aurora|mesh/.test(el.className))) {
        if (cs.filter !== 'none') report.glowBlobs.push({ element: name, filter: cs.filter, area: Math.round(w) + 'x' + Math.round(h) });
      }

      /* 1e. GPU layer (VRAM) */
      if (cs.willChange !== 'auto' || cs.transform !== 'none' || cs.filter !== 'none') {
        if (cs.willChange !== 'auto') report.gpuLayers.push({ element: name, willChange: cs.willChange });
      }

      /* 1f. bhaari shadows */
      if (cs.boxShadow && cs.boxShadow !== 'none' && (cs.boxShadow.match(/\d+px/g) || []).length > 4) {
        report.heavyShadows++;
      }
    }
  }

  scanDOM();

  /* ---------- 2. FPS measure ---------- */
  const measureFPS = (ms) => new Promise((res) => {
    const frames = [];
    const t0 = performance.now();
    let last = t0;
    function loop(ts) {
      frames.push(ts - last);
      last = ts;
      if (ts - t0 < ms) requestAnimationFrame(loop);
      else {
        const elapsed = ts - t0;
        const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
        const dropped = frames.filter(f => f > 20).length;   // 20ms = 50fps se neeche
        res({
          fps: +(1000 / avg).toFixed(1),
          worstFrame: +Math.max(...frames).toFixed(1),
          droppedFrames: dropped,
          totalFrames: frames.length,
        });
      }
    }
    requestAnimationFrame(loop);
  });

  /* ---------- 3. summary + console output ---------- */
  window.perfReport = async function () {
    scanDOM();
    const fps = await measureFPS(3000);
    report.fps = fps.fps;
    report.worstFrame = fps.worstFrame;
    report.droppedFrames = fps.droppedFrames;

    const problems = [];
    if (report.animatedWithBlur.length) problems.push(`🔴 ${report.animatedWithBlur.length} element animate ho rahe hain JIN PAR BLUR HAI (yehi hang hai)`);
    if (fps.fps < 55) problems.push(`🔴 FPS ${fps.fps} (<55) — animation smooth nahi hai`);
    if (fps.worstFrame > 50) problems.push(`🟠 sab se slow frame ${fps.worstFrame}ms (16ms hona chahiye)`);
    if (report.liveBackdropFilters.length > 6) problems.push(`🟠 ${report.liveBackdropFilters.length} live blur — 4-5 se zyada bohat mehnga`);
    if (report.infiniteAnimations.length > 8) problems.push(`🟠 ${report.infiniteAnimations.length} infinite animations — CPU/GPU par bojh`);
    if (report.heavyShadows > 10) problems.push(`🟠 ${report.heavyShadows} bhaari box-shadows`);

    report.summary = problems.length ? problems.join('\n') : '✅ Sab theek lagta hai (55+ FPS, blur+wala animation nahi)';

    console.clear();
    console.log('%c PERF REPORT ', 'background:#5b21b6;color:#fff;font-weight:700;padding:5px 10px;border-radius:4px');
    console.log('%c FPS: ' + fps.fps + '  |  worst frame: ' + fps.worstFrame + 'ms  |  dropped: ' + fps.droppedFrames + '/' + fps.totalFrames,
      'color:' + (fps.fps >= 55 ? '#15803d' : '#b91c1c') + ';font-weight:700;font-size:13px');
    console.log('\n' + report.summary + '\n');

    if (report.animatedWithBlur.length) {
      console.log('%c 🔴 ANIMATED + BLUR (inhe fix karein — sab se pehle)', 'color:#b91c1c;font-weight:700');
      console.table(report.animatedWithBlur);
    }
    if (report.liveBackdropFilters.length) {
      console.log('%c Blur elements', 'color:#6d28d9;font-weight:600');
      console.table(report.liveBackdropFilters);
    }
    if (report.infiniteAnimations.length) {
      console.log('%c Infinite animations', 'color:#6d28d9;font-weight:600');
      console.table(report.infiniteAnimations);
    }
    if (report.gpuLayers.length) {
      console.log('%c GPU layers (will-change)', 'color:#6d28d9;font-weight:600');
      console.table(report.gpuLayers);
    }

    window.__perfReport = report;
    console.log('%c Copy: copy(__perfReport)', 'color:#6d28d9');
    return report;
  };

  console.log('%c PERF DIAGNOSE loaded ', 'background:#5b21b6;color:#fff;font-weight:700;padding:5px 10px;border-radius:4px');
  console.log('Ab 5-6 second tak page scroll karein aur animations chalne dein,');
  console.log('phir console me likhein:  perfReport()');
  return 'ready';
})();
