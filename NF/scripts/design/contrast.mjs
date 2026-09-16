#!/usr/bin/env node
/**
 * WCAG 2.2 contrast check for every documented token pair.
 *
 *   node scripts/design/contrast.mjs
 *
 * Exits 1 when a pair used for running text falls below 4.5:1, or a pair used
 * for large text / UI components falls below 3:1. The pair list is the
 * contract recorded in DESIGN.md; add a row here when a new pairing ships.
 */
import config from '../../tailwind.config.js';

const { theme } = config;
const c = theme.extend.colors;

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const lum = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => {
  const a = lum(fg);
  const b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

// [label, foreground, background, minimum]
const PAIRS = [
  // Paper
  ['content on paper', c.content.DEFAULT, c.surface.paper, 4.5],
  ['content-2 on paper', c.content[2], c.surface.paper, 4.5],
  ['content-3 on paper (secondary text)', c.content[3], c.surface.paper, 4.5],
  ['content-3 on paper-2', c.content[3], c.surface['paper-2'], 4.5],
  ['content on white', c.content.DEFAULT, c.surface.DEFAULT, 4.5],
  ['brand-600 text on paper', c.brand[600], c.surface.paper, 4.5],
  ['brand-700 text on paper', c.brand[700], c.surface.paper, 4.5],
  ['brand-600 text on paper-2', c.brand[600], c.surface['paper-2'], 4.5],
  ['brand-600 text on brand-50', c.brand[600], c.brand[50], 4.5],
  ['brand-700 text on brand-100', c.brand[700], c.brand[100], 4.5],
  ['content-4 as decoration on paper (3:1 floor)', c.content[4], c.surface.paper, 3],
  ['border-strong on paper (UI component)', c.border.strong, c.surface.paper, 3],
  // Controls
  ['white on brand-600 (primary button)', '#FFFFFF', c.brand[600], 4.5],
  ['white on brand-700 (primary hover)', '#FFFFFF', c.brand[700], 4.5],
  ['white on brand-500 (light accent, large text only)', '#FFFFFF', c.brand[500], 3],
  ['brand-600 focus ring on paper', c.brand[600], c.surface.paper, 3],
  // Board (chalkboard)
  ['chalk on board', c.content.chalk, c.surface.board, 4.5],
  ['chalk-2 on board', c.content['chalk-2'], c.surface.board, 4.5],
  ['chalk-3 on board (metadata)', c.content['chalk-3'], c.surface.board, 4.5],
  ['chalk on board-2', c.content.chalk, c.surface['board-2'], 4.5],
  ['chalk-2 on board-3', c.content['chalk-2'], c.surface['board-3'], 4.5],
  ['brand-300 on board (accent text)', c.brand[300], c.surface.board, 4.5],
  ['brand-400 on board (large accent)', c.brand[400], c.surface.board, 3],
  ['white on brand-600 sitting on board', '#FFFFFF', c.brand[600], 4.5],
  // Status
  ['success-700 on success-50', c.success[700], c.success[50], 4.5],
  ['success-700 on paper', c.success[700], c.surface.paper, 4.5],
  ['warning-700 on warning-50', c.warning[700], c.warning[50], 4.5],
  ['danger-700 on danger-50', c.danger[700], c.danger[50], 4.5],
  ['danger-600 on paper', c.danger[600], c.surface.paper, 4.5],
  ['white on success-600', '#FFFFFF', c.success[600], 4.5],
  ['white on danger-600', '#FFFFFF', c.danger[600], 4.5],
];

let failed = 0;
const rows = PAIRS.map(([label, fg, bg, min]) => {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed += 1;
  return `| ${label} | \`${fg}\` | \`${bg}\` | ${r.toFixed(2)}:1 | ${min}:1 | ${ok ? '✅' : '❌'} |`;
});

console.log('| Pair | Foreground | Background | Ratio | Minimum | |');
console.log('|---|---|---|---|---|---|');
console.log(rows.join('\n'));
if (failed) {
  console.error(`\n${failed} pair(s) below the WCAG AA floor`);
  process.exit(1);
}
console.log('\nAll token pairs meet WCAG 2.2 AA.');
