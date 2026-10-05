import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcDir = path.resolve(__dirname, '../../src');
const indexPath = path.join(srcDir, 'index.html');
const spritePath = path.join(srcDir, 'assets/icons/icons.svg');
const catalogPath = path.resolve(__dirname, 'material-symbols.codepoints');

const fix = process.argv.includes('--fix');

const NAME = /^[a-z0-9_]+$/;

async function walk(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else if (/\.(html|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/** Every '…' / "…" in an expression, for `{{ a ? 'x' : 'y' }}` style bindings. */
function addQuoted(set, text) {
  for (const [, name] of text.matchAll(/['"]([a-z0-9_]+)['"]/g)) { set.add(name); }
}

function scanMarkup(set, text) {
  for (const [, attrs, body] of text.matchAll(/<mat-icon\b([^>]*)>([\s\S]*?)<\/mat-icon>/g)) {
    if (/\bsvgIcon\b/i.test(attrs)) { continue; }
    const inner = body.trim();
    if (inner.includes('{{')) { addQuoted(set, inner); } else if (NAME.test(inner)) { set.add(inner); }
  }

  const maticon = /class="[^"]*\b(?:s-leaflet-)?maticon\b[^"]*"[^>]*>([^<]*)</g;
  for (const [, body] of text.matchAll(maticon)) {
    const inner = body.trim();
    if (NAME.test(inner)) { set.add(inner); }
  }
}

function scanScript(set, text) {
  for (const [, name] of text.matchAll(/\bicon:\s*['"]([a-z0-9_]+)['"]/g)) { set.add(name); }

  // Only returns inside an icon-named computed signal; a bare `return 'upcoming'` elsewhere is a status string.
  for (const match of text.matchAll(/\b\w*[iI]con\w*\s*=\s*(?:computed|signal)\b/g)) {
    const end = text.indexOf('\n  });', match.index);
    const block = text.slice(match.index, end === -1 ? text.length : end);
    for (const [, statement] of block.matchAll(/\breturn\s+([^;]*);/g)) { addQuoted(set, statement); }
  }
}

async function collectUsed() {
  const used = new Set();
  for (const file of await walk(srcDir)) {
    const text = await fs.readFile(file, 'utf8');
    scanMarkup(used, text);
    if (file.endsWith('.ts')) { scanScript(used, text); }
  }
  return used;
}

async function collectSpriteIds() {
  const svg = await fs.readFile(spritePath, 'utf8');
  return new Set([...svg.matchAll(/<symbol[^>]*\bid="([^"]+)"/g)].map(m => m[1]));
}

async function collectCatalog() {
  const text = await fs.readFile(catalogPath, 'utf8');
  return new Set(text.split('\n').map(l => l.trim().split(/\s+/)[0]).filter(Boolean));
}

async function main() {
  const [used, sprite, catalog] = await Promise.all([collectUsed(), collectSpriteIds(), collectCatalog()]);

  const rejected = [];
  const fontIcons = new Set();
  for (const name of used) {
    if (sprite.has(name)) { continue; }
    if (catalog.has(name)) { fontIcons.add(name); } else { rejected.push(name); }
  }

  const index = await fs.readFile(indexPath, 'utf8');
  const match = index.match(/icon_names=([a-z0-9_,]*)/);
  if (!match) {
    console.error('No icon_names= parameter found in src/index.html.');
    process.exit(1);
  }
  const requested = new Set(match[1].split(',').filter(Boolean));

  const missing = [...fontIcons].filter(n => !requested.has(n)).sort();
  const unused = [...requested].filter(n => !fontIcons.has(n)).sort();
  const sorted = [...fontIcons].sort();

  if (fix) {
    const updated = index.replace(/icon_names=[a-z0-9_,]*/, `icon_names=${sorted.join(',')}`);
    if (updated !== index) {
      await fs.writeFile(indexPath, updated);
      console.log(`Updated icon_names in src/index.html (${sorted.length} icons).`);
    } else {
      console.log(`icon_names is already up to date (${sorted.length} icons).`);
    }
    return;
  }

  if (rejected.length) {
    console.log(`Note: ${rejected.length} scanned name(s) are not Material Symbols and were ignored:`);
    console.log(`  ${rejected.sort().join(', ')}`);
  }
  if (unused.length) {
    console.warn(`Warning: ${unused.length} requested icon(s) are no longer used: ${unused.join(', ')}`);
  }
  if (missing.length) {
    console.error(`Error: ${missing.length} icon(s) are used but not requested in src/index.html:`);
    console.error(`  ${missing.join(', ')}`);
    console.error('Run `npm run icon-names -- --fix` to update the font request.');
    process.exit(1);
  }

  console.log(`icon_names is in sync (${sorted.length} icons).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
