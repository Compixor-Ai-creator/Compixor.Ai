#!/usr/bin/env node

/**
 * IndexNow submission script for compixor-ai.cloud
 * Key: a42d5bde8e494fce88b29709307991b2
 * Submits all public URLs to IndexNow API for instant indexing on Bing, Yandex, etc.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const HOST = 'compixor-ai.cloud';
const KEY = 'a42d5bde8e494fce88b29709307991b2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const INDEXNOW_API = 'https://api.indexnow.org/indexnow';

async function fetchSitemapUrls() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(SITEMAP_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Compixor-IndexNow/1.0' }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const xml = await res.text();
      const matches = [...xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)];
      if (matches.length > 0) {
        return matches.map((m) => m[1].trim());
      }
    }
  } catch (err) {
    console.warn(`[IndexNow] Could not fetch remote sitemap (${err.message}). Using local route generation...`);
  }
  return null;
}

function getLocalUrls() {
  const urls = new Set([
    `https://${HOST}`,
    `https://${HOST}/about`,
    `https://${HOST}/contact`,
    `https://${HOST}/privacy`,
    `https://${HOST}/terms`,
    `https://${HOST}/blog`,
  ]);

  // Read tools from src/data/tools.ts
  try {
    const toolsPath = resolve(rootDir, 'src/data/tools.ts');
    const toolsContent = readFileSync(toolsPath, 'utf8');
    const hrefMatches = toolsContent.matchAll(/href:\s*['"`]([^'"`]+)['"`]/g);
    for (const match of hrefMatches) {
      const path = match[1].trim();
      if (path.startsWith('/')) {
        urls.add(`https://${HOST}${path}`);
      }
    }
  } catch (err) {
    console.warn(`[IndexNow] Warning: Could not parse tools.ts: ${err.message}`);
  }

  // Read blogs from src/lib/blogsData.ts
  try {
    const blogsPath = resolve(rootDir, 'src/lib/blogsData.ts');
    const blogsContent = readFileSync(blogsPath, 'utf8');
    const slugMatches = blogsContent.matchAll(/slug:\s*['"`]([^'"`]+)['"`]/g);
    for (const match of slugMatches) {
      const slug = match[1].trim();
      if (slug) {
        urls.add(`https://${HOST}/blog/${slug}`);
      }
    }
  } catch (err) {
    console.warn(`[IndexNow] Warning: Could not parse blogsData.ts: ${err.message}`);
  }

  return Array.from(urls);
}

async function main() {
  console.log(`[IndexNow] Preparing submission for ${HOST}...`);

  let urlList = await fetchSitemapUrls();
  if (!urlList || urlList.length === 0) {
    urlList = getLocalUrls();
  }

  // Deduplicate and filter out any invalid URLs
  urlList = Array.from(new Set(urlList)).filter(url => url.startsWith(`https://${HOST}`));

  console.log(`[IndexNow] Found ${urlList.length} URLs to submit.`);
  if (urlList.length === 0) {
    console.error('[IndexNow] No URLs found. Aborting submission.');
    return;
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList,
  };

  try {
    console.log(`[IndexNow] Sending POST request to ${INDEXNOW_API}...`);
    const res = await fetch(INDEXNOW_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Compixor-IndexNow/1.0',
      },
      body: JSON.stringify(payload),
    });

    const status = res.status;
    const bodyText = await res.text().catch(() => '');

    if (status === 200) {
      console.log(`[IndexNow] Success (HTTP 200): All ${urlList.length} URLs submitted successfully.`);
    } else if (status === 202) {
      console.log(`[IndexNow] Accepted (HTTP 202): URLs received by IndexNow. Key validation is in progress.`);
    } else {
      console.warn(`[IndexNow] Received HTTP ${status}: ${res.statusText || 'Response'}`);
      if (bodyText) {
        console.warn(`[IndexNow] Response body: ${bodyText}`);
      }
    }
  } catch (error) {
    console.error(`[IndexNow] Network/Request error: ${error.message}`);
    // Handled without crashing build
  }
}

main().catch(err => {
  console.error('[IndexNow] Unexpected error:', err);
});
