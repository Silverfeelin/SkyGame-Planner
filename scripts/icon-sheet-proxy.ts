/**
 * Packs the local placeholder icons of SkyGame-Data (`.local-icons`, referenced by items as `/proxy/icons/<file>`)
 * into icons_proxy_#.webp sheets, so they show without the proxy. Main icon sheets are left untouched.
 *
 * Usage: npm run icon-sheet-proxy -- [--data ../SkyGame-Data] [--icons <data>/.local-icons]
 */
import * as fs from 'fs';
import * as path from 'path';
import * as jsonc from 'jsonc-parser';
import { createSprites, gameAssetsPath, iconSize, iconsPerSheet, IIconSheet, isProxySheet, PROXY_PREFIX, readIconsJson, writeIconsJson } from './icon-sheet-common';
const sharp = require('sharp');

const argValue = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const dataPath = path.resolve(argValue('--data') || path.resolve(__dirname, '../../SkyGame-Data'));
const iconsPath = path.resolve(argValue('--icons') || path.resolve(dataPath, '.local-icons'));

interface IItem { guid: string, id: number, name?: string, icon?: string };
// Built output of SkyGame-Data (npm run build / serve), which includes unpublished items.
const itemsPath = path.resolve(dataPath, 'assets/items.json');
if (!fs.existsSync(itemsPath)) {
  console.error(`Missing ${itemsPath}. Build SkyGame-Data first.`);
  process.exit(1);
}
const itemData: { items: Array<IItem> } = jsonc.parse(fs.readFileSync(itemsPath, 'utf8'));
itemData.items.sort((a, b) => a.id - b.id);

const tempPath = path.resolve(__dirname, 'temp/proxy');
fs.mkdirSync(tempPath, { recursive: true });

(async () => {
  // Collect distinct proxy icons in item order.
  const iconItems = new Map<string, Array<IItem>>();
  for (const item of itemData.items) {
    if (!item.icon?.startsWith(PROXY_PREFIX)) { continue; }
    if (!iconItems.has(item.icon)) { iconItems.set(item.icon, []); }
    iconItems.get(item.icon)!.push(item);
  }

  const fileOf = (icon: string) => decodeURIComponent(icon.substring(PROXY_PREFIX.length));
  const missing = Array.from(iconItems.keys()).filter(icon => !fs.existsSync(path.resolve(iconsPath, fileOf(icon))));
  if (missing.length) {
    console.error(`Missing ${missing.length} icon file(s) in ${iconsPath}:`);
    for (const icon of missing) {
      const items = iconItems.get(icon)!.map(i => `${i.name || '?'} (${i.guid})`).join(', ');
      console.error(`  ${fileOf(icon)}: ${items}`);
    }
    console.error('Nothing written.');
    process.exit(1);
  }

  // Resize to the sheet tile size. Always redone, since local icons can change.
  const tempIcons = new Map<string, string>();
  for (const icon of Array.from(iconItems.keys())) {
    const file = fileOf(icon);
    const outPath = path.resolve(tempPath, file);
    await sharp(path.resolve(iconsPath, file)).resize(iconSize, iconSize).png().toFile(outPath);
    tempIcons.set(outPath, icon);
  }

  const sheets: Array<IIconSheet> = [];
  const tempPaths = Array.from(tempIcons.keys());
  for (let i = 0; i < tempPaths.length; i += iconsPerSheet) {
    const batch = tempPaths.slice(i, i + iconsPerSheet);
    sheets.push(await createSprites(batch, p => tempIcons.get(path.resolve(p))!, `icons_proxy_${sheets.length}.webp`));
  }

  // Replace the proxy sheets, keep the main sheets.
  const mainSheets = readIconsJson().files.filter(f => !isProxySheet(f.file));
  writeIconsJson([...mainSheets, ...sheets]);

  const sheetFiles = new Set(sheets.map(s => s.file));
  for (const file of fs.readdirSync(gameAssetsPath)) {
    if (isProxySheet(file) && !sheetFiles.has(file)) {
      fs.unlinkSync(path.resolve(gameAssetsPath, file));
      console.log(`Removed ${file}`);
    }
  }

  console.log(`${iconItems.size} placeholder icon(s) in ${sheets.length} sheet(s)${sheets.length ? ': ' + sheets.map(s => s.file).join(', ') : ''}.`);

  const used = new Set(Array.from(iconItems.keys()).map(fileOf));
  const unused = fs.existsSync(iconsPath) ? fs.readdirSync(iconsPath).filter(f => !used.has(f)) : [];
  if (unused.length) {
    console.log(`Unused files in ${iconsPath}: ${unused.join(', ')}`);
  }
})();
