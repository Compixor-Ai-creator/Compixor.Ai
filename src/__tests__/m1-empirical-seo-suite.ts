import test from 'node:test';
import assert from 'node:assert/strict';
import { seoConfig, getToolSchemas, ToolSlug } from '../lib/seo-config';
import { getBlogBySlug } from '../lib/blogsData';
import fs from 'fs';
import path from 'path';

test('1. Tool Page Schemas: SoftwareApplication, HowTo (6 steps), FAQPage (12 utility FAQs), BreadcrumbList', () => {
  const toolSlug: ToolSlug = 'full-dp-maker';
  const tool = seoConfig[toolSlug];
  assert.ok(tool, 'full-dp-maker configuration exists');

  const toolSchemas = getToolSchemas(toolSlug);
  assert.strictEqual(toolSchemas.length, 4, 'getToolSchemas returns exactly 4 schemas');

  // 1.1 SoftwareApplication / WebApplication Schema
  const webApp = toolSchemas.find((s) => {
    const type = s['@type'];
    return Array.isArray(type) ? type.includes('SoftwareApplication') : type === 'SoftwareApplication';
  });
  assert.ok(webApp, 'SoftwareApplication schema exists in getToolSchemas');
  assert.ok(
    Array.isArray(webApp['@type']) &&
      webApp['@type'].includes('SoftwareApplication') &&
      webApp['@type'].includes('WebApplication'),
    'SoftwareApplication schema includes both SoftwareApplication and WebApplication types'
  );
  assert.strictEqual(webApp.name, 'Full DP Maker');
  assert.strictEqual(webApp.url, 'https://compixor-ai.cloud/tools/full-dp-maker');
  assert.strictEqual(webApp.image, 'https://compixor-ai.cloud/blog/whatsapp-full-dp-maker-thumbnail.webp');
  assert.strictEqual(webApp.offers?.price, '0');
  assert.strictEqual(webApp.author?.name, 'Haroon Ali');
  assert.strictEqual(webApp.publisher?.name, 'Compixor AI');
  assert.ok(webApp.operatingSystem, 'operatingSystem is defined');
  assert.ok(webApp.applicationCategory, 'applicationCategory is defined');

  // 1.2 HowTo Schema (6 steps)
  const toolHowTo = toolSchemas.find((s) => s['@type'] === 'HowTo');
  assert.ok(toolHowTo, 'HowTo schema exists for tool');
  assert.ok(Array.isArray(toolHowTo.step), 'HowTo schema has steps array');
  assert.strictEqual(toolHowTo.step.length, 6, 'Tool HowTo has exactly 6 steps');
  toolHowTo.step.forEach((st: any, idx: number) => {
    assert.strictEqual(st['@type'], 'HowToStep');
    assert.strictEqual(st.position, idx + 1);
    assert.ok(st.name && st.name.length > 0, `Step ${idx + 1} name is non-empty`);
    assert.ok(st.text && st.text.length > 0, `Step ${idx + 1} text is non-empty`);
  });

  // 1.3 FAQPage Schema (12 utility FAQs)
  const toolFaq = toolSchemas.find((s) => s['@type'] === 'FAQPage');
  assert.ok(toolFaq, 'FAQPage schema exists for tool');
  assert.ok(Array.isArray(toolFaq.mainEntity), 'FAQPage schema has mainEntity array');
  assert.strictEqual(toolFaq.mainEntity.length, 12, 'Tool FAQPage has exactly 12 FAQs');
  toolFaq.mainEntity.forEach((f: any, idx: number) => {
    assert.strictEqual(f['@type'], 'Question');
    assert.ok(f.name && f.name.length > 0, `FAQ ${idx + 1} question is non-empty`);
    assert.strictEqual(f.acceptedAnswer?.['@type'], 'Answer');
    assert.ok(f.acceptedAnswer?.text && f.acceptedAnswer.text.length > 0, `FAQ ${idx + 1} answer is non-empty`);
  });

  // 1.4 BreadcrumbList Schema
  const toolBreadcrumb = toolSchemas.find((s) => s['@type'] === 'BreadcrumbList');
  assert.ok(toolBreadcrumb, 'BreadcrumbList schema exists for tool');
  assert.strictEqual(toolBreadcrumb.itemListElement.length, 3);
  assert.strictEqual(toolBreadcrumb.itemListElement[0].name, 'Home');
  assert.strictEqual(toolBreadcrumb.itemListElement[1].name, 'Tools');
  assert.strictEqual(toolBreadcrumb.itemListElement[2].name, 'Full DP Maker');
});

test('2. Blog Page Schemas: BlogPosting, HowTo (5 steps), FAQPage (12 informational FAQs), BreadcrumbList', () => {
  const blogSlug = 'how-to-set-full-dp-on-whatsapp-without-cropping';
  const blog = getBlogBySlug(blogSlug);
  assert.ok(blog, 'Blog post with canonical slug exists');

  // Dates
  assert.strictEqual(blog.datePublished, '2025-01-15T00:00:00.000Z', 'datePublished is 2025-01-15T00:00:00.000Z');
  assert.strictEqual(blog.dateModified, '2025-10-31T00:00:00.000Z', 'dateModified is 2025-10-31T00:00:00.000Z');

  // Blog content & metadata
  assert.strictEqual(blog.title, 'How to Set Full DP on WhatsApp Without Cropping (Tested Guide)');
  assert.strictEqual(blog.metaTitle, 'How to Set Full DP on WhatsApp Without Cropping (2025 Guide)');
  assert.ok(blog.metaDescription.startsWith('Learn how to set full DP on WhatsApp without cropping'));

  // HowTo Steps (5 steps)
  assert.ok(Array.isArray(blog.content.steps), 'Blog has content.steps array');
  assert.strictEqual(blog.content.steps.length, 5, 'Blog HowTo has exactly 5 steps');
  blog.content.steps.forEach((s, idx) => {
    assert.strictEqual(s.stepNumber, idx + 1);
    assert.ok(s.title && s.title.length > 0, `Step ${idx + 1} title is non-empty`);
    assert.ok(s.description && s.description.length > 0, `Step ${idx + 1} description is non-empty`);
  });

  // Blog FAQs (12 informational FAQs)
  assert.ok(Array.isArray(blog.content.faqs), 'Blog has content.faqs array');
  assert.strictEqual(blog.content.faqs.length, 12, 'Blog has exactly 12 informational FAQs');
  blog.content.faqs.forEach((f, idx) => {
    assert.ok(f.question && f.question.length > 0, `Blog FAQ ${idx + 1} question is non-empty`);
    assert.ok(f.answer && f.answer.length > 0, `Blog FAQ ${idx + 1} answer is non-empty`);
  });
});

test('3. FAQ Non-duplication: Zero duplicate questions between Tool and Blog FAQs', () => {
  const tool = seoConfig['full-dp-maker'];
  const blog = getBlogBySlug('how-to-set-full-dp-on-whatsapp-without-cropping');
  assert.ok(tool && blog);

  const toolQuestions = tool.faqs.map((f) => f.q.trim().toLowerCase().replace(/[^\w\s]/g, ''));
  const blogQuestions = blog.content.faqs.map((f) => f.question.trim().toLowerCase().replace(/[^\w\s]/g, ''));

  const duplicates = toolQuestions.filter((q) => blogQuestions.includes(q));
  assert.strictEqual(duplicates.length, 0, 'There must be zero exact or normalized duplicate questions between Tool and Blog FAQs');
});

test('4. 301 Permanent Redirect: next.config.js routes legacy URL with permanent: true', async () => {
  const nextConfigPath = path.resolve(__dirname, '../../next.config.js');
  assert.ok(fs.existsSync(nextConfigPath), 'next.config.js exists');

  const nextConfig = require(nextConfigPath);
  const redirects = await nextConfig.redirects();

  const targetRedirect = redirects.find((r: any) => r.source === '/blog/how-to-set-full-dp-whatsapp-without-cropping');
  assert.ok(targetRedirect, 'Redirect rule exists for legacy URL');
  assert.strictEqual(targetRedirect.destination, '/blog/how-to-set-full-dp-on-whatsapp-without-cropping');
  assert.strictEqual(targetRedirect.permanent, true, 'Redirect must be permanent (HTTP 301)');
});

test('5. Date Consistency & Cleanliness across codebase (Zero 2026, Zero TODO)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const editedFiles = [
    'src/app/tools/full-dp-maker/page.tsx',
    'src/lib/seo-config.ts',
    'src/lib/blogsData.ts',
    'src/app/blog/[slug]/page.tsx',
    'src/components/Footer.tsx',
    'src/components/ToolSeoSection.tsx',
    'next.config.js',
    'src/app/sitemap.ts',
    'src/app/privacy/page.tsx',
    'src/app/terms/page.tsx',
  ];

  for (const relPath of editedFiles) {
    const fullPath = path.join(rootDir, relPath);
    assert.ok(fs.existsSync(fullPath), `File exists: ${relPath}`);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const matches2026 = (content.match(/2026/g) || []).length;
    const matchesTodo = (content.match(/TODO/g) || []).length;
    assert.strictEqual(matches2026, 0, `Expected 0 matches of 2026 in ${relPath}, found ${matches2026}`);
    assert.strictEqual(matchesTodo, 0, `Expected 0 matches of TODO in ${relPath}, found ${matchesTodo}`);
  }

  // Footer
  const footerContent = fs.readFileSync(path.join(rootDir, 'src/components/Footer.tsx'), 'utf-8');
  assert.ok(footerContent.includes('© 2025 Compixor AI.'), 'Footer has © 2025 Compixor AI.');
  assert.ok(footerContent.includes('Updated October 2025'), 'Footer has Updated October 2025');

  // Privacy & Terms
  const privacyContent = fs.readFileSync(path.join(rootDir, 'src/app/privacy/page.tsx'), 'utf-8');
  assert.ok(privacyContent.includes('Last Updated: October 2025'), 'Privacy has October 2025');

  const termsContent = fs.readFileSync(path.join(rootDir, 'src/app/terms/page.tsx'), 'utf-8');
  assert.ok(termsContent.includes('Last Updated: August 2025'), 'Terms has August 2025');

  // Sitemap
  const sitemapContent = fs.readFileSync(path.join(rootDir, 'src/app/sitemap.ts'), 'utf-8');
  assert.ok(sitemapContent.includes('2025-10-25T00:00:00.000Z'), 'Sitemap has 2025 siteBuildDate');
  assert.ok(!sitemapContent.includes('2026'), 'Sitemap has zero 2026 occurrences');
});

test('6. Internal Links: Bidirectional Tool ↔ Blog and links to 5 target tools', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const toolPageContent = fs.readFileSync(path.join(rootDir, 'src/app/tools/full-dp-maker/page.tsx'), 'utf-8');

  // Tool page has link to blog
  assert.ok(
    toolPageContent.includes('/blog/how-to-set-full-dp-on-whatsapp-without-cropping'),
    'Tool page links to companion blog'
  );

  // Tool page has links to 5 target tools
  assert.ok(toolPageContent.includes('/tools/passport-photo'), 'Tool page links to /tools/passport-photo');
  assert.ok(toolPageContent.includes('/tools/qr-generator'), 'Tool page links to /tools/qr-generator');
  assert.ok(toolPageContent.includes('/tools/pdf-compressor'), 'Tool page links to /tools/pdf-compressor');
  assert.ok(toolPageContent.includes('/tools/word-compressor'), 'Tool page links to /tools/word-compressor');
  assert.ok(toolPageContent.includes('/tools/pdf-to-word'), 'Tool page links to /tools/pdf-to-word');

  // Blog has link to tool
  const blog = getBlogBySlug('how-to-set-full-dp-on-whatsapp-without-cropping');
  assert.ok(blog);
  assert.strictEqual(blog.toolPath, '/tools/full-dp-maker');

  // Blog relatedTools includes tools
  const relatedToolPaths = (blog.relatedTools || []).map((t) => t.toolPath);
  assert.ok(relatedToolPaths.includes('/tools/full-dp-maker'), 'Blog relatedTools includes /tools/full-dp-maker');
  assert.ok(relatedToolPaths.includes('/tools/passport-photo'), 'Blog relatedTools includes /tools/passport-photo');
  assert.ok(relatedToolPaths.includes('/tools/qr-generator'), 'Blog relatedTools includes /tools/qr-generator');
  assert.ok(relatedToolPaths.includes('/tools/pdf-compressor'), 'Blog relatedTools includes /tools/pdf-compressor');
  assert.ok(relatedToolPaths.includes('/tools/word-compressor'), 'Blog relatedTools includes /tools/word-compressor');

  // ToolSeoSection links to blog
  const toolSeoContent = fs.readFileSync(path.join(rootDir, 'src/components/ToolSeoSection.tsx'), 'utf-8');
  assert.ok(
    toolSeoContent.includes("href: '/blog/how-to-set-full-dp-on-whatsapp-without-cropping'"),
    'ToolSeoSection TOOL_GUIDE_MAP links to canonical blog slug'
  );
});
