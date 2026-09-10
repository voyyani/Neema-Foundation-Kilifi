/**
 * Load src/lib/seo/routeMeta.ts from Node.
 *
 * routeMeta.ts is the single source of truth shared by the React runtime and
 * these build scripts. Node cannot import TypeScript directly, so it is
 * transpiled in memory with esbuild (already present as a Vite dependency)
 * and evaluated as a data module. This keeps one definition of every route
 * rather than duplicating the table in JavaScript.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import esbuild from 'esbuild';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(HERE, '..', '..');

export async function loadRouteMeta() {
  const source = resolve(PROJECT_ROOT, 'src/lib/seo/routeMeta.ts');
  const ts = await readFile(source, 'utf8');

  const { code } = await esbuild.transform(ts, {
    loader: 'ts',
    format: 'esm',
    target: 'node18',
  });

  const dir = join(tmpdir(), `nf-routemeta-${process.pid}`);
  await mkdir(dir, { recursive: true });
  const out = join(dir, 'routeMeta.mjs');
  await writeFile(out, code, 'utf8');

  try {
    return await import(pathToFileURL(out).href);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Escape a value for use inside an HTML attribute. */
export function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape a value for use in HTML text content. */
export function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
