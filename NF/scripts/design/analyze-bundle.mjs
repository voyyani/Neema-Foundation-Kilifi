#!/usr/bin/env node
/**
 * Bundle composition report: what each emitted chunk is made of.
 *
 *   node scripts/design/analyze-bundle.mjs [--all]
 *
 * Builds to a scratch directory with rollup-plugin-visualizer's raw-data
 * template and prints, for the entry chunk (or every chunk with --all), the
 * top contributors by rendered size grouped by package / source folder.
 */
import { build, loadConfigFromFile } from 'vite';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';

const all = process.argv.includes('--all');
const scratch = mkdtempSync(path.join(tmpdir(), 'nf-analyze-'));
const statsFile = path.join(scratch, 'stats.json');

const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, path.resolve('vite.config.ts'));
const c = { ...loaded.config };
c.plugins = (c.plugins || []).filter((p) => !(p && p.name === 'vite-plugin-checker'));
c.plugins.push(visualizer({ filename: statsFile, template: 'raw-data', gzipSize: true }));
c.build = { ...c.build, outDir: path.join(scratch, 'dist') };
c.logLevel = 'error';
await build({ ...c, configFile: false });

const s = JSON.parse(readFileSync(statsFile, 'utf8'));
const walk = (n, acc) => {
  if (n.children) n.children.forEach((ch) => walk(ch, acc));
  else acc.push([n.name, s.nodeParts[n.uid]?.renderedLength || 0, s.nodeParts[n.uid]?.gzipLength || 0]);
};
const groupKey = (p) => {
  const m = p.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
  if (m) return m[1];
  return p.replace(/^.*?\/src\//, 'src/').split('/').slice(0, 3).join('/');
};

for (const top of s.tree.children) {
  const isEntry = /^assets\/index-[^/]+\.js$/.test(top.name);
  if (!all && !isEntry) continue;
  const acc = [];
  walk(top, acc);
  const total = acc.reduce((a, b) => a + b[1], 0);
  const gz = acc.reduce((a, b) => a + b[2], 0);
  console.log(`\n== ${top.name}  ${Math.round(total / 1024)} kB rendered · ~${Math.round(gz / 1024)} kB gzip`);
  const agg = {};
  for (const [p, l, g] of acc) {
    const k = groupKey(p);
    agg[k] = agg[k] || [0, 0];
    agg[k][0] += l;
    agg[k][1] += g;
  }
  Object.entries(agg)
    .sort((a, b) => b[1][0] - a[1][0])
    .slice(0, 30)
    .forEach(([k, [v, g]]) => console.log(`  ${String(Math.round(v / 1024)).padStart(5)} kB  ${String(Math.round(g / 1024)).padStart(4)} gz  ${k}`));
}
