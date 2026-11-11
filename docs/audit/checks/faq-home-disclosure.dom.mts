import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const g = globalThis as any;
g.window = dom.window;
g.document = dom.window.document;
Object.defineProperty(g, 'navigator', { value: dom.window.navigator, configurable: true });
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (key in g) continue;
  try {
    const v = (dom.window as any)[key];
    if (typeof v === 'function' || key.startsWith('HTML') || key.startsWith('SVG')) {
      Object.defineProperty(g, key, { value: v, configurable: true, writable: true });
    }
  } catch {}
}
g.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
g.requestAnimationFrame = (cb: any) => setTimeout(() => cb(Date.now()), 0);
g.cancelAnimationFrame = (id: any) => clearTimeout(id);
g.IS_REACT_ACT_ENVIRONMENT = true;
g.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
g.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
(dom.window as any).matchMedia = () => ({ matches: false, media: '', onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } });
g.matchMedia = (dom.window as any).matchMedia;
g.scrollTo = () => {};

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act } = await import('react-dom/test-utils');
(globalThis as any).React = React;
const HomePage = (await import('../../../src/app/page')).default;

const container = dom.window.document.getElementById('root')!;
const root = createRoot(container);
await act(async () => {
  root.render(React.createElement(HomePage));
});

let pass = 0, fail = 0;
const check = (name: string, cond: boolean, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); }
};

const faqSection = () => container.querySelector('#faq-section')!;
const triggers = () => Array.from(faqSection().querySelectorAll('h3 > button')) as any[];
const expanded = () => triggers().map((b) => b.getAttribute('aria-expanded'));

check('home FAQ renders 8 disclosure triggers', triggers().length === 8, `got ${triggers().length}`);
check('home FAQ: only the first question open on load', JSON.stringify(expanded()) === '["true","false","false","false","false","false","false","false"]', JSON.stringify(expanded()));
check('home FAQ: anchor ids preserved on triggers', triggers()[0].getAttribute('id') === 'what-is-compixor-faq', triggers()[0].getAttribute('id'));
check('home FAQ: answer ids preserved', faqSection().querySelector('#faq-answer-what-is-compixor-faq') !== null);

const click = async (el: any) => {
  await act(async () => {
    el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  });
};

await click(triggers()[3]);
check('home FAQ: multi-open allowed (item 0 stays open)', expanded()[0] === 'true' && expanded()[3] === 'true', JSON.stringify(expanded()));
await click(triggers()[0]);
check('home FAQ: clicking an open question closes only that one', expanded()[0] === 'false' && expanded()[3] === 'true', JSON.stringify(expanded()));

const input = faqSection().querySelector('#faq-query-input') as any;
const setValue = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!;
await act(async () => {
  setValue.call(input, 'watermark');
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
});

check('home FAQ search filters to matching questions', triggers().length > 0 && triggers().length < 8, `showing ${triggers().length}`);
check('home FAQ search auto-opens every match', expanded().every((v) => v === 'true'), JSON.stringify(expanded()));
check('home FAQ search shows the match counter', /Showing \d+ of 8 questions/.test(faqSection().textContent || ''));

await act(async () => {
  setValue.call(input, '');
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
});
check('clearing the filter restores all 8 questions', triggers().length === 8, `got ${triggers().length}`);
check('clearing the filter returns to the default open set (first only)', JSON.stringify(expanded()) === '["true","false","false","false","false","false","false","false"]', JSON.stringify(expanded()));

console.log(`\nRESULT ${pass} pass / ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
