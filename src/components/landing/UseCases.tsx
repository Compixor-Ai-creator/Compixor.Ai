import Link from 'next/link';
import { tools } from '@/data/tools';      // ADAPT: keep the current import
import './sections.css';

const CASES = [
  { title: 'Students', line: 'Shrink assignments and scanned notes to fit upload limits.',
    tools: ['/tools/pdf-compressor', '/tools/pdf-organizer'] },
  { title: 'Job applications', line: 'Turn a PDF resume into an editable Word file and make a passport-size photo for the form.',
    tools: ['/tools/pdf-to-word', '/tools/passport-photo'] },
  { title: 'Visa & government forms', line: 'Get files under portal size limits and prepare a passport-size photo, without installing software.',
    tools: ['/tools/pdf-compressor', '/tools/passport-photo'] },
  { title: 'Office & small business', line: 'Pull text from scanned pages into Word, and password-protect files before you share them.',
    tools: ['/tools/img-to-word', '/tools/protect-pdf'] },
];
const name = (h: string) => (tools as any[]).find(t => t.href === h)?.name ?? h;

export default function UseCases() {
  return (
    <section className="cx-sec" aria-labelledby="uc-h">
      <div className="cx-container">
        <header className="cx-sec__head">
          <p className="cx-eyebrow">Use cases</p>
          <h2 id="uc-h" className="cx-h2">Made for <em>everyday paperwork</em></h2>
        </header>
        <ul className="uc-grid">
          {CASES.map(c => (
            <li key={c.title} className="uc">
              <h3>{c.title}</h3>
              <p>{c.line}</p>
              <div className="uc-tools">
                {c.tools.map(h => <Link key={h} href={h} className="uc-tool">{name(h)}</Link>)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
