# Passport Size Photo Maker: Search Keywords & Content Mapping

This document provides the complete keyword mapping, search intent, metadata definitions, URL mapping, and factual verification status for the **Passport Size Photo Maker** (`/tools/passport-photo`) and its 5 supporting educational guides.

---

## 1. Primary Tool Page: `/tools/passport-photo`

| Field | Value | Constraints / Notes |
|---|---|---|
| **Target URL** | `https://compixor-ai.cloud/tools/passport-photo` | Canonical URL |
| **Exact `<title>`** | `Passport Size Photo Maker Online Free - 300 DPI \| Compixor` | 58 characters ($\le 60$ char limit) |
| **Meta Description** | `Free passport size photo maker online. Create compliant 35x45 mm, NADRA CNIC & 2x2 inch photos. Print on A4, A5 & A6 sheets at 300 DPI with crop marks.` | 152 characters ($\le 155$ char limit) |
| **H1 Heading** | `Passport Size Photo Maker Online Free` | Keyword near start |
| **H2 Headings** | 1. Official Biometric Compliance Standards<br>2. Print Sheet Sizes & Photo Capacities (300 DPI)<br>3. How Passport Photo Prints Are Made at a Studio and at Home<br>4. About Passport Photo Maker — Official Biometric Standards<br>5. How to Use Passport Photo Maker Online<br>6. Why Privacy-First Matters<br>7. Frequently Asked Questions | Covers print, home, studio, and format intents |
| **Schema Types** | 1. `WebApplication` (`applicationCategory`: `MultimediaApplication`, `price`: `0`)<br>2. `FAQPage` (8 visible questions matching JSON-LD exactly)<br>3. `HowTo` (4-step walkthrough)<br>4. `BreadcrumbList` (Home > Tools > Passport Photo Maker) | Validated against Schema.org |
| **Primary Keyword** | `passport size photo maker online free` | High-intent transactional query |
| **Secondary Keywords** | `passport photo maker pakistan`, `nadra passport photo size`, `cnic photo size and maker`, `35x45 mm photo maker`, `passport photo white background online`, `passport photo print sheet a4 a5 a6`, `6 passport photos on a5`, `2 passport photos on a6`, `passport photo 300 dpi print`, `passport photo with crop marks`, `make passport photos at home and print`, `change photo background colour online free`, `passport photo blue white red background`, `id photo background changer`, `passport size photo banane ka tarika`, `passport size photo online banayen`, `nadra photo size kitna hota hai`, `photo ka background change kaise karen`, `پاسپورٹ سائز فوٹو آن لائن`, `شناختی کارڈ فوٹو سائز` | Multi-language & regional coverage |

---

## 2. Supporting Educational Blog Guides

All articles contain between 800 and 1,200 words, structured HTML tables, step-by-step walkthroughs, decision boxes, and bidirectional internal links to `/tools/passport-photo`.

### Master Educational Guide: Complete Passport Size Photo Maker Online Guide
- **Target URL**: `https://compixor-ai.cloud/blog/passport-size-photo-maker-online-free`
- **Target Keyword**: `passport size photo maker online free`
- **Consolidated Coverage**: Includes complete Pakistan NADRA & Pak-ID guidelines (formerly `/blog/passport-photo-size-pakistan`), AI studio edge matting & white background cutouts (formerly `/blog/change-photo-background-to-white-online`), and mobile photography & printer scaling rules (formerly `/blog/passport-size-photo-kaise-banayen`). 301 permanent redirects configured in `next.config.js`.

### Guide 2: Home & Studio Printing Setup
- **Target URL**: `https://compixor-ai.cloud/blog/how-to-print-passport-photos-at-home`
- **Target Keyword**: `how to print passport photos at home`
- **Exact `<title>`**: `How to Print Passport Photos at Home: A4, A5 & A6 Guide (300 DPI) | Compixor AI`
- **H1**: `How to Print Passport Photos at Home: A4, A5 & A6 Sheets (100% Scale Guide)`
- **Meta Description**: `Step-by-step tutorial on printing passport photos at home on A4, A5, and A6 photo paper. Avoid scaling errors with the 100% actual size rule and crop marks.`
- **Key Coverage**: The critical "100% Scale / Actual Size" rule (never use "Fit to page"), A6 (2 photos) vs A5 (6 photos) vs A4 (24 photos) layout capacities, 200–260 GSM semi-gloss/satin photo paper, outer corner crop mark cutting.

### Guide 3: Background Colour Rules by Country
- **Target URL**: `https://compixor-ai.cloud/blog/passport-photo-background-colour-by-country`
- **Target Keyword**: `passport photo background colour by country`
- **Exact `<title>`**: `Passport Photo Background Colour Rules by Country (2026 Guide) | Compixor AI`
- **H1**: `Passport Photo Background Colour by Country: Official White, Blue & Red Rules`
- **Meta Description**: `Comprehensive guide to passport photo background colour by country. White vs light blue vs royal blue vs red rules for US, UK, Pakistan, India, Canada & more.`
- **Key Coverage**: Verified rules for 10 nations: USA (White), UK (Light Gray/Cream), Schengen (Light Gray/White), Pakistan (Light Blue/White), India (White), Canada (White), Philippines (Royal Blue #1d4ed8), Australia (White/Light Gray), China (White), UAE (White).

---

## 3. Truthful Privacy Compliance Audit

In compliance with truthful advertising and architectural transparency:
- **No false absolute claims**: All instances of `"No Data Leak"`, `"Zero Cloud Uploads"`, `"100% client-side"`, and `"no server contact"` have been removed from the passport photo tool.
- **Accurate Privacy Disclosure**: The passport tool copy explicitly states:
  > *"AI background removal runs in memory on our secure HTTPS server (nothing stored), with an on-device option available."*
- **On-Device Fallback**: Users can choose *"Process on my device only"* to execute segmentation purely in browser memory via Transformers.js / ONNX.

---

## 4. Verification Status of Country Presets

| Country Preset | Dimension | Background | Verified Status | Official Source Reference |
|---|---|---|---|---|
| Pakistan | 35 x 45 mm | Light Blue / White | **Verified** | [DGIP Online MRP Requirements](https://onlinemrp.dgip.gov.pk/photo-requirements/) |
| United States | 2 x 2 in (51 x 51 mm) | Plain White | **Verified** | [US State Dept Passport Photos](https://travel.state.gov/content/travel/en/passports/how-apply/photos.html) |
| UK / Schengen | 35 x 45 mm | Light Gray / Off-White | **Verified** | [UK Gov Passport Photos](https://www.gov.uk/photos-for-passports) |
| India | 2 x 2 in (51 x 51 mm) | Plain White | **Verified** | [Passport Seva India](https://passportindia.gov.in/) |
| Canada | 50 x 70 mm | Plain White / Light Gray | **Verified** | [IRCC Canadian Passport Photos](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html) |
| Philippines | 35 x 45 mm | Royal Blue / White | **Verified** | [DFA Philippines Passport Office](https://dfa-oca.ph/passport/passport-requirements/) |
| China | 33 x 48 mm | White / Light Blue | **Verified** | [MFA Consular Service](https://www.fmprc.gov.cn/) |
| Australia | 35 x 45 mm | White / Light Gray | **Verified** | [Australian Passport Office](https://www.passports.gov.au/getting-passport-how-it-works/photo-requirements) |
| UAE & Gulf | 40 x 60 mm | White | **Verified** | [GDRFA Dubai](https://gdrfad.gov.ae/) |
| *Other / Custom* | Custom mm | Custom Hex | *Unverified* | Explicit user warning: *"Check the rules of the issuing authority before submitting."* |
