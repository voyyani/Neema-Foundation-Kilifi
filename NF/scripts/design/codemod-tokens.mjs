#!/usr/bin/env node
/**
 * Phase 2 codemod: hardcoded colours → tokens.
 *
 *   node scripts/design/codemod-tokens.mjs [--dry] [dir ...]
 *
 * 1. Tailwind arbitrary-value classes `bg-[#B01C2E]`, `from-[#8A1624]`,
 *    `text-[#B01C2E]/80` … become their token (`bg-brand-600`, …).
 * 2. `red-*` utilities become `danger-*` under src/admin (a status colour —
 *    visually identical to Tailwind's red) and `brand-*` on public paths,
 *    where red was the brand written by hand.
 * 3. Remaining raw hex literals in JS/TS (style objects, SVG fills) are
 *    reported, not rewritten: each is a judgement call.
 *
 * Run once per directory, review the diff, commit.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const dirs = args.filter((a) => !a.startsWith('--'));
if (dirs.length === 0) dirs.push('src');

// Hex → token name (used inside Tailwind class brackets). Case-insensitive.
const HEX_TO_TOKEN = {
  // brand maroon and its hand-typed neighbours
  b01c2e: 'brand-600',
  '9a1827': 'brand-700',
  '9a1826': 'brand-700',
  '8a1624': 'brand-700',
  '8a1522': 'brand-700',
  '700f1a': 'brand-800',
  '6b111c': 'brand-800',
  d42a3f: 'brand-500',
  d4213d: 'brand-500',
  '2a0a10': 'brand-950',
  fef2f2: 'brand-50',
  fde8e9: 'brand-100',
  fbbcc0: 'brand-200',
  // neutrals
  '111827': 'content',
  '374151': 'content-2',
  '6b7280': 'content-3',
  '9ca3af': 'content-4',
  e5e7eb: 'border',
  c4c9d0: 'border-strong',
  f3f4f6: 'surface-paper-2',
  f0f0f0: 'surface-paper-2',
  f9fafb: 'surface-paper',
  ffffff: 'white',
  fff: 'white',
  '000000': 'black',
  '000': 'black',
  // status
  dc2626: 'danger-600',
  ef4444: 'danger-500',
  d97706: 'warning-600',
  f59e0b: 'warning-500',
  '16a34a': 'success-600',
  '10b981': 'success-500',
};

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '__tests__') continue;
      walk(p, out);
    } else if (/\.(tsx?|jsx?|css)$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
};

let changedFiles = 0;
const leftovers = [];

for (const dir of dirs) {
  for (const file of walk(dir)) {
    const before = readFileSync(file, 'utf8');
    let after = before;

    // 1. Arbitrary hex classes → tokens (keeps any /opacity suffix).
    after = after.replace(/\[#([0-9a-fA-F]{3,6})\]/g, (m, hex) => {
      const token = HEX_TO_TOKEN[hex.toLowerCase()];
      return token ? token : m;
    });

    // 2. red-* → danger-* (admin) or brand-* (public).
    const isAdmin = file.includes(`${path.sep}admin${path.sep}`);
    const target = isAdmin ? 'danger' : 'brand';
    after = after.replace(/(^|[^a-zA-Z0-9-])((?:[a-z-]+:)*(?:bg|text|border|ring|from|via|to|fill|stroke|outline|decoration|divide|placeholder|shadow|accent|caret|border-[trblxy]|ring-offset))-red-(\d{2,3})(\b)/g,
      (m, pre, util, shade) => `${pre}${util}-${target}-${shade}`);

    if (after !== before) {
      changedFiles += 1;
      if (!dry) writeFileSync(file, after);
    }

    // 3. Report leftover raw hex (outside class brackets) for hand review.
    const remaining = after.match(/#[0-9a-fA-F]{6}\b/g);
    if (remaining) leftovers.push(`${file}: ${[...new Set(remaining)].join(' ')}`);
  }
}

console.log(`${dry ? '[dry] ' : ''}${changedFiles} file(s) rewritten`);
if (leftovers.length) {
  console.log('\nRaw hex still present (review by hand):');
  for (const l of leftovers) console.log('  ' + l);
}
