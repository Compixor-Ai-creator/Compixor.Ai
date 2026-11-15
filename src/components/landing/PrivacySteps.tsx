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
    <section className="cx-sec" style={{ position: 'relative', overflow: 'hidden' }} aria-labelledby="how-h">
      <Stars count={70} />
      <div className="cx-container" style={{ position: 'relative', zIndex: 1 }}>
        <header className="cx-sec__head">
          <p className="cx-eyebrow">How it works</p>
          <h2 id="how-h" className="cx-h2">What happens to <em>your file</em></h2>
        </header>
        <ol className="st-grid">
          <li className="st">
            <span className="st-label"><b>01</b>/ Choose</span>
            <h3>Pick a file</h3>
            <p>Select the file you want to work on from your device.</p>
          </li>
          <li className="st st--main">
            <span className="st-label"><b>02</b>/ Process</span>
            <h3>Processed on your device, or securely</h3>
            <div className="st-paths">
              <div className="st-path">
                <span className="cx-chip cx-chip--device"><Cpu />On-device</span>
                <p>9 tools do the work inside your browser, on your own device.</p>
              </div>
              <div className="st-path">
                <span className="cx-chip cx-chip--server"><Lock />Secure server processing</span>
                <p>PDF to Word, Image to Word and Passport Photo use our server: the file travels
                   over encrypted HTTPS, is not stored, and is deleted right after processing
                   once the result is returned.</p>
              </div>
            </div>
            <Link href="/privacy" className="st-link">Read our Privacy Policy →</Link>
          </li>
          <li className="st">
            <span className="st-label"><b>03</b>/ Download</span>
            <h3>Download the result</h3>
            <p>Save the finished file straight to your device.</p>
          </li>
        </ol>
      </div>
    </section>
  );
}
