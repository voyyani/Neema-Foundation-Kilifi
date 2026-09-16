#!/usr/bin/env node
/**
 * Full-page screenshots of every public route at 360px and 1440px.
 *
 * Usage:
 *   node scripts/design/screenshot.mjs --base http://localhost:4173 --out docs/design/baseline
 *
 * Playwright is not a project dependency; point NODE_PATH at an install of it
 * (e.g. the npx cache) or run `npx playwright@latest ...`. Entrance motion is
 * disabled via prefers-reduced-motion so no section is captured mid-animation.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);

const BASE = args.base ?? 'http://localhost:4173';
const OUT = args.out ?? 'docs/design/baseline';
const ONLY = args.only ? args.only.split(',') : null;
const FULL = !process.argv.includes('--viewport-only');

export const PUBLIC_ROUTES = [
  ['home', '/'],
  ['donate', '/donate'],
  ['bank-details', '/bank-details'],
  ['legacy-giving', '/legacy-giving'],
  ['volunteer', '/volunteer'],
  ['partner', '/partner'],
  ['sponsorship', '/sponsorship'],
  ['board', '/board'],
  ['programs', '/programs'],
  ['media', '/media'],
  ['maintenance', '/maintenance'],
  ['not-found', '/this-page-does-not-exist'],
];

const VIEWPORTS = [
  ['360', { width: 360, height: 780 }],
  ['1440', { width: 1440, height: 900 }],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  for (const [vpName, viewport] of VIEWPORTS) {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      isMobile: viewport.width < 600,
      hasTouch: viewport.width < 600,
    });
    const page = await context.newPage();
    for (const [name, route] of PUBLIC_ROUTES) {
      if (ONLY && !ONLY.includes(name)) continue;
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60_000 }).catch(() => {});
      // Let the loading screen (index.html) fade and lazy chunks settle.
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(600);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      const file = path.join(OUT, `${name}-${vpName}.png`);
      await page.screenshot({ path: file, fullPage: FULL });
      console.log('wrote', file);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
