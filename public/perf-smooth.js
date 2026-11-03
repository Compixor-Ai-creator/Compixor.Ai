/* ============================================================================
   PERF SMOOTH — animated elements se blur khud hata deta hai (naam guess kiye baghair)
   ----------------------------------------------------------------------------
   PROBLEM
     Jab koi element animate hota hai (float / pulse / breathe) AUR usi par
     backdrop-filter ya filter:blur() laga ho, browser har frame par blur
     DOBARA chalata hai. 60fps ka budget 16ms hai — ek 16px blur us se zyada
     le leta hai. Isi se "hang" / "freeze" / "smooth nahi" wala ehsaas hota hai.

   YEH SCRIPT
     1. Page scan karta hai
     2. Har element dhoondta hai jispar animation + blur dono hon
     3. Sirf uspar se blur hata deta hai — animation chalti rehti hai
     4. Background thoda solid kar deta hai taake look na badle

   ⚠️ SIRF tab lagayein jab `perfReport()` ke "🔴 ANIMATED + BLUR" table me
      entries aayi hon. Table khali hai to is file ki zaroorat NAHI hai.

   ⚠️ YE SCRIPT `filter` KO TOUCH NAHI KARTA.
      Bahut si sites shadows/icons ke liye `filter: drop-shadow(...)` use karti
      hain. `filter: none` lagane se wo sab ghayab ho jayega.
      Sirf `backdrop-filter` (aur blur wala `filter`) hatta hai.

   Kaise lagayein:
     <script src="/perf-smooth.js" defer></script>   (</body> se pehle)

   Animation HATATI NAHI hai. Sirf blur hatta hai.
   ============================================================================ */

(function () {
  'use strict';

  var MARK = 'perf-noblur';
  var processed = new WeakSet();
  var fixedCount = 0;

  /* --------------------------------------------------------------------------
     STYLE — sirf backdrop-filter aur blur-type filter hatta hai
     -------------------------------------------------------------------------- */
  var style = document.createElement('style');
  style.id = 'perf-smooth-style';
  style.textContent = [
    /* 1. animated elements se blur hatao (animation chalti rahegi) */
    '.' + MARK + '{',
    '  -webkit-backdrop-filter: none !important;',
    '  backdrop-filter: none !important;',
    '}',

    /* 2. agar blur `filter` me tha (blur(), drop-shadow nahi) to sirf wo hataao */
    '.' + MARK + '.perf-blur-in-filter{',
    '  filter: brightness(1) !important;',
    '}',

    /* 3. blur jaaney ke baad glass halka lipta lagta hai — background bhar do.
          Sirf un elements par jo pehle se translucent background rakhte hain. */
    '.' + MARK + '[class*="glass"],',
    '.' + MARK + '[class*="card"],',
    '.' + MARK + '[class*="pill"]{',
    '  background-color: rgba(255,255,255,.86) !important;',
    '}',

    /* 4. blur pseudo-element (::before / ::after) par ho — wo bhi hatao */
    '.' + MARK + '-pseudo::before,',
    '.' + MARK + '-pseudo::after{',
    '  -webkit-backdrop-filter: none !important;',
    '  backdrop-filter: none !important;',
    '  filter: none !important;',
    '}',

    'html.dark .' + MARK + '[class*="glass"],',
    'html.dark .' + MARK + '[class*="card"],',
    'html.dark .' + MARK + '[class*="pill"],',
    '[data-theme="dark"] .' + MARK + '[class*="glass"],',
    '[data-theme="dark"] .' + MARK + '[class*="card"],',
    '[data-theme="dark"] .' + MARK + '[class*="pill"]{',
    '  background-color: rgba(24,18,38,.9) !important;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  /* --------------------------------------------------------------------------
     DETECTION
     -------------------------------------------------------------------------- */
  function getBackdrop(cs) {
    return cs.backdropFilter || cs.webkitBackdropFilter || 'none';
  }

  /* backdrop-filter ke ilawa `filter` me sirf blur() hai? (drop-shadow nahi) */
  function filterHasBlurOnly(cs) {
    var f = cs.filter;
    if (!f || f === 'none') return false;
    if (!/blur\(/.test(f)) return false;
    /* drop-shadow / brightness / contrast jaise functions ho to skip —
       unhe hataana visual damage karega */
    var withoutBlur = f
      .replace(/blur\([^)]*\)/g, '')
      .replace(/[\s,]+/g, '')
      .trim();
    return withoutBlur === '';
  }

  function hasBlur(cs) {
    return getBackdrop(cs) !== 'none' || filterHasBlurOnly(cs);
  }

  /* ::before / ::after par blur hai AUR wo animate ho raha hai? */
  function pseudoNeedsFix(el, elementAnimated) {
    var pseudo = ['::before', '::after'];
    for (var i = 0; i < pseudo.length; i++) {
      var ps;
      try { ps = getComputedStyle(el, pseudo[i]); } catch (e) { continue; }
      if (!ps) continue;
      /* content:none / display:none ho to pseudo exist nahi karta */
      if (!ps.content || ps.content === 'none' || ps.display === 'none') continue;
      if (getBackdrop(ps) === 'none' && !filterHasBlurOnly(ps)) continue;
      /* blur hai — ab dekho animate ho raha hai ya element khud */
      if (elementAnimated || isAnimated(ps)) return true;
    }
    return false;
  }

  function isAnimated(cs) {
    if (!cs.animationName || cs.animationName === 'none') return false;
    var dur = parseFloat(cs.animationDuration) || 0;
    return dur > 0;
  }

  /* --------------------------------------------------------------------------
     SCAN
     -------------------------------------------------------------------------- */
  function scan(root) {
    var nodes = (root || document).querySelectorAll('body *');
    var fixed = 0;

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (processed.has(el)) continue;

      var cs;
      try { cs = getComputedStyle(el); } catch (e) { continue; }
      if (!cs || cs.display === 'none' || cs.visibility === 'hidden') continue;

      /* ⚠️ SVG children ko chhodo — unke computed filter/backdrop ajeeb hote hain */
      if (el.ownerSVGElement) continue;

      var animated = isAnimated(cs);

      if (animated && hasBlur(cs)) {
        el.classList.add(MARK);
        if (filterHasBlurOnly(cs)) el.classList.add('perf-blur-in-filter');
        processed.add(el);
        fixed++;
      } else if (pseudoNeedsFix(el, animated)) {
        /* blur pseudo-element par hai — element khud saaf hai */
        el.classList.add(MARK + '-pseudo');
        processed.add(el);
        fixed++;
      } else if (hasBlur(cs)) {
        /* blur hai magar animation nahi — isse chhedna nahi hai */
        processed.add(el);
      }
    }
    return fixed;
  }

  /* pehla scan */
  fixedCount += scan();

  /* --------------------------------------------------------------------------
     React/Next.js baad me render karte hain — dobara scan
     -------------------------------------------------------------------------- */
  if ('MutationObserver' in window) {
    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        fixedCount += scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* --------------------------------------------------------------------------
     Hover ke baad animation start ho to bhi pakro
     -------------------------------------------------------------------------- */
  document.addEventListener('mouseover', function (e) {
    var el = e.target;
    if (!el || el.nodeType !== 1 || el.ownerSVGElement || processed.has(el)) return;
    var cs;
    try { cs = getComputedStyle(el); } catch (err) { return; }
    if (isAnimated(cs) && hasBlur(cs)) {
      el.classList.add(MARK);
      if (filterHasBlurOnly(cs)) el.classList.add('perf-blur-in-filter');
      processed.add(el);
      fixedCount++;
    }
  }, { passive: true });

  /* --------------------------------------------------------------------------
     REPORT
     -------------------------------------------------------------------------- */
  if (fixedCount) {
    console.log(
      '%c PERF SMOOTH %c ' + fixedCount + ' element se blur hataya (animation chalti hai) ',
      'background:#5b21b6;color:#fff;font-weight:700;padding:3px 8px;border-radius:4px 0 0 4px',
      'background:#15803d;color:#fff;font-weight:600;padding:3px 8px;border-radius:0 4px 4px 0'
    );
  }

  window.__perfSmooth = {
    rescan: function () { fixedCount += scan(); return fixedCount; },
    get count() { return fixedCount; },
    /* debug: jo elements fix hue un ki list */
    debug: function () {
      return Array.prototype.slice.call(document.querySelectorAll('.' + MARK)).map(function (el) {
        return (el.id ? '#' + el.id : el.tagName.toLowerCase()) +
               (typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '');
      });
    }
  };
})();
