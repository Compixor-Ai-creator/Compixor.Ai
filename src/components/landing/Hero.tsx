import Image from "next/image";
import Link from "next/link";
import TabletFlatten from "./TabletFlatten";
import "./hero.css";

export default function Hero() {
  return (
    <section className="cx-hero" aria-labelledby="cx-hero-title">
      <div className="cx-hero__bg" aria-hidden="true">
        <div className="cx-hero__stars" />
        <div className="cx-hero__beam" />
        <div className="cx-hero__nebula" />
      </div>
      <div className="cx-hero__ring" aria-hidden="true" />

      <div className="cx-hero__inner">
        <div className="cx-badge cx-rise">
          <Image src="/brand/logo-c.png" alt="" width={22} height={21} />
          All-in-One Private PDF &amp; Image Toolkit <i aria-hidden="true" /> Zero File Storage
        </div>

        <h1 id="cx-hero-title" className="cx-h1 cx-rise" style={{ animationDelay: "80ms" }}>
          <span>Free Private PDF, Word &amp;</span>
          <span className="cx-grad">Photo Tools in Your Browser</span>
        </h1>

        <p className="cx-sub cx-rise" style={{ animationDelay: "160ms" }}>
          Compixor is a private web toolkit to compress, merge, protect, watermark, and
          convert documents directly in your browser. 9 of our 12 tools run locally on your
          device with zero photo or document uploads.
        </p>

        <div className="cx-ctas cx-rise" style={{ animationDelay: "240ms" }}>
          {/* use the ORIGINAL hrefs from commit 3f460873 */}
          <Link href="#tools" className="cx-hbtn cx-hbtn--primary">
            Start Now — Make Your Life Easy
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link href="#tools" className="cx-hbtn cx-hbtn--ghost">Explore All 12 Tools</Link>
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
    </section>
  );
}
