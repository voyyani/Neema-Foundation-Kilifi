#!/usr/bin/env node
/**
 * Lighthouse (mobile) for the main public routes.
 *
 * Usage:
 *   node scripts/design/lighthouse.mjs --base https://localhost:4173 --out docs/design/baseline/lighthouse
 *
 * Requires a Chrome binary (CHROME_PATH) and network access for `npx lighthouse`.
 * Writes one JSON per route and prints a score table; `summary.md` is written
 * alongside so the numbers can be committed without the full reports.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);
const BASE = args.base ?? 'https://localhost:4173';
const OUT = args.out ?? 'docs/design/baseline/lighthouse';
const ROUTES = [
  ['home', '/'],
  ['donate', '/donate'],
  ['volunteer', '/volunteer'],
  ['programs', '/programs'],
  ['board', '/board'],
  ['media', '/media'],
  ['partner', '/partner'],
];
mkdirSync(OUT, { recursive: true });

const rows = [];
for (const [name, route] of ROUTES) {
  const outPath = path.join(OUT, `${name}-mobile.json`);
  try {
    execFileSync(
      'npx',
      [
        '--yes', 'lighthouse@12', BASE + route, '--quiet',
        '--chrome-flags=--headless=new --no-sandbox --ignore-certificate-errors',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--form-factor=mobile', '--output=json', `--output-path=${outPath}`,
      ],
      { stdio: 'inherit', timeout: 240_000 },
    );
    const j = JSON.parse(readFileSync(outPath, 'utf8'));
    const s = (k) => Math.round((j.categories[k]?.score ?? 0) * 100);
    const a = j.audits;
    rows.push({
      name, route,
      perf: s('performance'), a11y: s('accessibility'), bp: s('best-practices'), seo: s('seo'),
      lcp: a['largest-contentful-paint']?.displayValue ?? '',
      cls: a['cumulative-layout-shift']?.displayValue ?? '',
      tbt: a['total-blocking-time']?.displayValue ?? '',
    });
  } catch (e) {
    rows.push({ name, route, error: String(e.message).slice(0, 120) });
  }
}

const md = [
  `# Lighthouse (mobile) — ${new Date().toISOString().slice(0, 10)}`,
  '',
  '| Route | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |',
  '|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => r.error
    ? `| \`${r.route}\` | — | — | — | — | error: ${r.error} | | |`
    : `| \`${r.route}\` | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${r.lcp} | ${r.cls} | ${r.tbt} |`),
  '',
].join('\n');
writeFileSync(path.join(OUT, 'summary.md'), md);
console.log(md);
