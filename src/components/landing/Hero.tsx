import Image from "next/image";
import Link from "next/link";
import TabletFlatten from "./TabletFlatten";
import HeroTitle from "./HeroTitle";
import "./hero.css";

export default function Hero() {
  return (
    <section className="cx-hero" aria-labelledby="cx-hero-title">
      <div className="cx-hero__stage">
        <div className="cx-hero__inner">
          <div className="cx-badge cx-rise">
            <Image src="/brand/logo-c.png" alt="Compixor AI Logo" width={22} height={21} />
            All-in-One Private PDF &amp; Image Toolkit <i aria-hidden="true" /> Zero File Storage
          </div>

          <HeroTitle
            className="cx-h1"
            line1="Free Private PDF, Word &"
            line2="Photo Tools That Run in Your Browser"
          />

          <p className="cx-sub cx-rise" style={{ animationDelay: "320ms" }}>
            Compixor is a private web toolkit to compress, merge, protect, watermark, and convert
            documents directly in your browser. 9 tools run locally on your device with zero photo
            or document uploads. Specialized utilities (PDF to Word, Image to Word, and Passport
            Photo) process securely over HTTPS with zero permanent file storage.
          </p>

          <div className="cx-ctas cx-rise" style={{ animationDelay: "440ms" }}>
            <Link href="#tools" className="cx-hbtn cx-hbtn--primary">
              <span>Explore All 12 Tools</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link href="#what-happens" className="cx-hbtn cx-hbtn--ghost">See How It Works</Link>
          </div>
        </div>

        <div className="cx-stage-crop">
          <div className="cx-stage">
            <TabletFlatten>
              <Image
                className="cx-tablet__img"
                src="/brand/hero-orbit.png" width={1672} height={941} priority
                sizes="(max-width:768px) 92vw, 720px"
                alt="Compixor tools orbiting a PDF: compress, convert to Word, edit image, QR generator, merge and split, protect PDF"
              />
            </TabletFlatten>
          </div>
        </div>
      </div>
    </section>
  );
}
