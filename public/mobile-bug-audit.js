/* ============================================================================
   MOBILE BUG AUDIT  —  apni website par chalayein
   ----------------------------------------------------------------------------
   KAISE CHALAYEIN:
   1. Chrome me apni site kholein
   2. DevTools (F12) → Console tab
   3. `mobileAudit()` likh kar Enter dabayein
      (ya yeh poora file console me paste karein — khud chal jayegi)
   4. Neeche table me har bug + us element ka exact CSS selector milega

   YA phone se test karne ke liye:
   1. DevTools → Toggle device toolbar (Ctrl+Shift+M)
   2. 5 device widths par chalao: 320, 360, 390, 414, 768

   Kya check hota hai:
   • horizontal scroll (mobile ka #1 bug)
   • 44px se chhote tap targets
   • 12px se chhote fonts
   • 16px se chhote inputs (iOS khud zoom kar deta hai)
   • aisi images jo screen se bahar nikalti hain
   • fixed px widths jo viewport se bade hain
   • text jo clip ho raha hai
   • viewport meta tag missing
   ============================================================================ */

function mobileAudit() {
  const DE0 = document.documentElement;
  const VW = DE0.clientWidth;                 /* asli layout width */
  const WIN = window.innerWidth;
  const issues = [];
  const noMeta = !document.querySelector('meta[name="viewport"]');

  const sel = (el) => {
    if (!el || el.nodeType !== 1) return '?';
    if (el.id) return '#' + el.id;
    let s = el.tagName.toLowerCase();
    if (typeof el.className === 'string' && el.className.trim()) {
      s += '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.');
    }
    const p = el.parentElement;
    if (p && p !== document.body && p.id) s = '#' + p.id + ' > ' + s;
    return s;
  };

  // element ko koi ancestor clip kar raha hai? (overflow hidden/auto/scroll)
  const isClipped = (el) => {
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const o = getComputedStyle(p);
      if (/(hidden|auto|scroll|clip)/.test(o.overflowX) || /(hidden|auto|scroll|clip)/.test(o.overflow)) {
        const r = p.getBoundingClientRect();
        if (r.right <= VW + 1) return true;
      }
      p = p.parentElement;
    }
    return false;
  };

  const push = (type, el, detail, fix) => {
    issues.push({
      BUG: type,
      ELEMENT: sel(el),
      DETAIL: detail,
      FIX: fix && fix.slice(0, 90),
    });
  };

  /* ---------- 1. viewport meta ---------- */
  const vp = document.querySelector('meta[name="viewport"]');
  if (!vp) {
    push('VIEWPORT META MISSING', document.head, 'phone par desktop layout dikhega',
         '<meta name="viewport" content="width=device-width, initial-scale=1">');
  } else if (!/width\s*=\s*device-width/.test(vp.content)) {
    push('VIEWPORT WIDTH', document.head, 'content="' + vp.content + '"',
         'width=device-width lagayein');
  }

  /* ---------- 2. horizontal scroll ---------- */
  const DE = document.documentElement;
  if (DE.scrollWidth > VW + 1) {
    push('PAGE HORIZONTAL SCROLL', document.body,
         `scrollWidth ${DE.scrollWidth}px > viewport ${VW}px`,
         'neeche wale OVERFLOW-X elements ko fix karein');
  }
  if (noMeta) {
    console.warn('%c NOTE: viewport meta nahi hai — browser 980px layout bana raha hai.\n' +
      'Overflow bugs tab tak chhup jate hain. Pehle meta tag lagayein, phir audit dobara chalayein.',
      'color:#b45309;font-weight:600');
  }

  /* ---------- 3. har element scan ---------- */
  const all = document.body.querySelectorAll('*');
  const seenImg = new Set();

  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    if (el.ownerSVGElement) continue;

    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (el.matches('.sr-only, [class*="sr-only"]') || (r.width <= 1 && r.height <= 1)) continue;

    /* 3a. screen se bahar */
    const overRight = r.right > VW + 1;
    const overLeft  = r.left < -1;
    if ((overRight || overLeft) && !isClipped(el)) {
      push('OVERFLOW-X', el,
           `left=${Math.round(r.left)} right=${Math.round(r.right)} vw=${VW}`,
           'max-width:100%; box-sizing:border-box; ya width kam karein');
    }

    /* 3b. tap target */
    const isTap = el.matches('a[href], button, [role="button"], input[type="submit"], input[type="button"], select, summary');
    if (isTap) {
      /* prose ke andar wala text link 44px ka nahi hota — usko chhod dein,
         sirf button/icon/short links check karein */
      const isInlineTextLink = (el.tagName === 'A'
        && cs.display === 'inline'
        && (el.textContent || '').trim().length > 20)
        || el.closest('nav[aria-label*="breadcrumb" i], [itemtype*="BreadcrumbList"]');
      /* inline element par min-height ka koi asar nahi hota — note kar lein */
      const inlineWarn = cs.display === 'inline' ? ' [display:inline — min-height kaam nahi karega]' : '';
      if (!isInlineTextLink) {
        if (el.tagName === 'A') {
          /* Text links: WCAG 2.5.5 exception — sirf height 44px check hoti hai */
          if (r.height < 43.5) {
            push('SMALL TAP TARGET', el,
                 `${Math.round(r.width)}x${Math.round(r.height)}px (min height 44px)${inlineWarn}`,
                 'min-height:44px; display:inline-flex;');
          }
        } else if (r.height < 43.5 || r.width < 43.5) {
          push('SMALL TAP TARGET', el,
               `${Math.round(r.width)}x${Math.round(r.height)}px (min 44x44)${inlineWarn}`,
               'min-height:44px; min-width:44px; display:inline-flex bhi lagayein');
        }
      }
    }

    /* 3c. chhota font (sirf leaf text nodes) */
    const leafText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (leafText) {
      const fs = parseFloat(cs.fontSize);
      if (fs && fs < 12) {
        push('FONT TOO SMALL', el, `${fs}px "${el.textContent.trim().slice(0, 22)}"`,
             'font-size kam se kam 12px (body text 15–16px)');
      }
    }

    /* 3d. iOS input zoom */
    if (el.matches('input, select, textarea')) {
      const fs = parseFloat(cs.fontSize);
      if (fs && fs < 16) {
        push('IOS INPUT ZOOM', el, `input font-size ${fs}px`,
             'font-size:16px — warna iOS focus par page zoom kar deta hai');
      }
    }

    /* 3e. image screen se bahar */
    if (el.tagName === 'IMG' && !seenImg.has(el)) {
      seenImg.add(el);
      if (r.width > VW + 1) {
        push('IMAGE TOO WIDE', el, `img ${Math.round(r.width)}px > ${VW}px`,
             'img{max-width:100%;height:auto}');
      }
      if (cs.maxWidth === 'none') {
        push('IMAGE NO MAX-WIDTH', el, 'img ka max-width none hai',
             'img{max-width:100%;height:auto}');
      }
    }

    /* 3f. fixed px width viewport se bada */
    const w = parseFloat(cs.width);
    if (!isNaN(w) && w > VW + 1 && cs.maxWidth === 'none' && cs.position !== 'fixed' && !isClipped(el) && !el.closest('table')) {
      push('FIXED WIDTH TOO BIG', el, `width:${Math.round(w)}px > vw ${VW}`,
           'width:100%; max-width:' + Math.round(w) + 'px');
    }

    /* 3g. text clip */
    if (leafText && el.scrollWidth > el.clientWidth + 2 &&
        (/(hidden|clip)/.test(cs.overflowX) || cs.whiteSpace === 'nowrap') &&
        cs.textOverflow !== 'ellipsis') {
      push('TEXT CLIPPED', el, `"${el.textContent.trim().slice(0, 24)}" ${el.scrollWidth}px > ${el.clientWidth}px`,
           'white-space ko wrap karein, ya font-size kam karein');
    }
  }

  /* ---------- 4. body scroll hijack ---------- */
  const bodyOv = getComputedStyle(document.body).overflowY;
  if (bodyOv === 'hidden' && document.body.scrollHeight > window.innerHeight + 40) {
    push('BODY SCROLL LOCKED', document.body, 'body overflow-y:hidden hai, content lamba hai',
         'mobile par body scroll allow karein');
  }

  /* ---------- 5. hover-only tap ---------- */
  const hoverOnly = [...document.querySelectorAll('a, button, [role="button"]')].filter(el => {
    const cs = getComputedStyle(el);
    return parseFloat(cs.opacity) === 0 && cs.pointerEvents !== 'none';
  });
  if (hoverOnly.length) {
    push('INVISIBLE TAPPABLE', hoverOnly[0], hoverOnly.length + ' element opacity 0 par clickable',
         'mobile par display:none karein');
  }

  /* ---------- REPORT ---------- */
  const uniq = [];
  const keys = new Set();
  for (const i of issues) {
    const k = i.BUG + i.ELEMENT;
    if (!keys.has(k)) { keys.add(k); uniq.push(i); }
  }

  console.log('%c MOBILE AUDIT — ' + VW + 'px ',
    'background:#5b21b6;color:#fff;font-weight:700;padding:4px 8px;border-radius:4px');
  console.log('%c ' + uniq.length + ' issue(s) mile ',
    'color:' + (uniq.length ? '#b91c1c' : '#15803d') + ';font-weight:700');

  if (uniq.length) {
    console.table(uniq);
    console.log('%c Copy karne ke liye: copy(__mobileAuditResult)',
      'color:#6d28d9;font-weight:600');
  } else {
    console.log('%c ✅ Is width par koi bug nahi mila. Agli width try karein (320/360/390/414/768).',
      'color:#15803d;font-weight:600');
  }

  window.__mobileAuditResult = uniq;
  return uniq;
}

/* console se call karne ke liye global expose — `mobileAudit()` likhein */
window.mobileAudit = mobileAudit;

/* auto-run: page load par ek dafa chalta hai (DevTools bundle ke andar bhi) */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { mobileAudit(); });
} else {
  mobileAudit();
}
