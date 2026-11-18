import Link from 'next/link';
import Stars from './Stars';
import './sections.css';

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Cpu = () => (<Svg><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></Svg>);
const Lock = () => (<Svg><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Svg>);

export default function PrivacySteps() {
  return (
    <section id="what-happens" className="cx-sec scroll-mt-20" style={{ position: 'relative', overflow: 'hidden' }} aria-labelledby="how-h">
      <Stars count={70} />
      <div className="cx-container" style={{ position: 'relative', zIndex: 1 }}>
        <header className="cx-sec__head">
          <p className="cx-eyebrow">Data Architecture</p>
          <h2 id="how-h" className="cx-h2">What happens to <em>your file</em></h2>
        </header>
        <ol className="st-grid">
          <li className="st">
            <span className="st-label"><b>01</b>/ Ingest</span>
            <h3>Loaded in RAM</h3>
            <p>Your document is read directly into your browser memory (RAM) through standard web APIs without outbound transmission.</p>
          </li>
          <li className="st st--main">
            <span className="st-label"><b>02</b>/ Process</span>
            <h3>Processed on your device, or securely</h3>
            <div className="st-paths">
              <div className="st-path">
                <span className="cx-chip cx-chip--device"><Cpu />On-device (9 tools)</span>
                <p>9 client-side tools execute transforms 100% inside your browser WebAssembly sandbox.</p>
              </div>
              <div className="st-path">
                <span className="cx-chip cx-chip--server"><Lock />Secure HTTPS (3 tools)</span>
                <p>PDF to Word, Image to Word and Passport Photo process over encrypted HTTPS and are permanently deleted right after return.</p>
              </div>
            </div>
            <Link href="/privacy" className="st-link">Read our Privacy Policy →</Link>
          </li>
          <li className="st">
            <span className="st-label"><b>03</b>/ Export</span>
            <h3>Direct download</h3>
            <p>The transformed file buffer is written directly to your device disk with zero server retention or copies.</p>
          </li>
        </ol>
      </div>
    </section>
  );
}
