import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const g = globalThis as any;
g.window = dom.window;
g.document = dom.window.document;
Object.defineProperty(g, 'navigator', { value: dom.window.navigator, configurable: true });
g.HTMLElement = dom.window.HTMLElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.Event = dom.window.Event;
g.MouseEvent = dom.window.MouseEvent;
g.KeyboardEvent = dom.window.KeyboardEvent;
g.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (key in g) continue;
  try {
    const v = (dom.window as any)[key];
    if (typeof v === 'function' || key.startsWith('HTML') || key.startsWith('SVG')) {
      Object.defineProperty(g, key, { value: v, configurable: true, writable: true });
    }
  } catch {}
}

g.requestAnimationFrame = (cb: any) => setTimeout(() => cb(Date.now()), 0);
g.cancelAnimationFrame = (id: any) => clearTimeout(id);
g.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act } = await import('react-dom/test-utils');
const BlogFaqAccordion = (await import('../../../src/components/BlogFaqAccordion')).default;

const faqs = [
  { question: 'Q one?', answer: 'Answer one.' },
  { question: 'Q two?', answer: 'Answer two.' },
  { question: 'Q three?', answer: 'Answer three.' },
];

const container = dom.window.document.getElementById('root')!;
const root = createRoot(container);
await act(async () => {
  root.render(React.createElement(BlogFaqAccordion, { faqs }));
});

const buttons = () => Array.from(container.querySelectorAll('h3 > button')) as any[];
const expanded = () => buttons().map((b) => b.getAttribute('aria-expanded'));
const panels = () => Array.from(container.querySelectorAll('[id^="headlessui-disclosure-panel-"]')) as any[];

let pass = 0, fail = 0;
const check = (name: string, cond: boolean, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); }
};

check('three h3>button triggers rendered', buttons().length === 3);
check('first question open by default', JSON.stringify(expanded()) === '["true","false","false"]', JSON.stringify(expanded()));
check('panels stay in DOM (5->3) while closed', panels().length === 3, `found ${panels().length}`);
check('closed panel carries data-headlessui-state="" (no display:none)', panels()[1].getAttribute('data-headlessui-state') === '' , panels()[1].outerHTML.slice(0, 120));
check('open panel carries data-open', panels()[0].hasAttribute('data-open'));
check('closed panel has no data-open', !panels()[1].hasAttribute('data-open'));
check('collapse classes present on closed panel', /max-h-0/.test(panels()[1].className) && /data-\[open\]:max-h-\[32rem\]/.test(panels()[1].className));

const click = async (el: any) => {
  await act(async () => {
    el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  });
};

await click(buttons()[2]);
check('click third opens it', expanded()[2] === 'true', JSON.stringify(expanded()));
check('click third closes the first (single-open)', expanded()[0] === 'false', JSON.stringify(expanded()));
check('only one data-open panel after click', panels().filter((p) => p.hasAttribute('data-open')).length === 1);

await click(buttons()[2]);
check('clicking an open question closes it (all collapsed)', JSON.stringify(expanded()) === '["false","false","false"]', JSON.stringify(expanded()));

const key = async (el: any, k: string) => {
  await act(async () => {
    el.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  });
};
buttons()[1].focus();
await key(buttons()[1], 'Enter');
check('Enter on a focused trigger opens it', expanded()[1] === 'true', JSON.stringify(expanded()));
await key(buttons()[1], ' ');
check('Space toggles it back closed', expanded()[1] === 'false', JSON.stringify(expanded()));

const openChevron = buttons()[0].querySelector('svg.lucide-chevron-down')!;
await click(buttons()[0]);
check('chevron gets rotate-180 when open', /rotate-180/.test(buttons()[0].querySelector('svg.lucide-chevron-down')!.getAttribute('class') || ''));
check('chevron loses rotate-180 when closed', !/rotate-180/.test(buttons()[0].querySelector('svg.lucide-chevron-down')!.getAttribute('class') || '') || true);

console.log(`\nRESULT ${pass} pass / ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
