import * as fs from 'fs';
import * as path from 'path';
import * as jsonc from 'jsonc-parser';
import { chromium } from 'playwright';
import { createSprites, iconSize, iconsPerSheet, IIconSheet, isProxySheet, readIconsJson, writeIconsJson } from './icon-sheet-common';
const sharp = require('sharp');

interface IItem { guid: string, id: number, icon?: string };
const itemsPath = path.resolve(__dirname, '../node_modules/skygame-data/assets/items.json');
const itemData: { items: Array<IItem> } = jsonc.parse(fs.readFileSync(itemsPath, 'utf8'));
itemData.items.sort((a: IItem, b: IItem) => a.id - b.id);

/** Re-download every icon instead of only those missing from the temp folder. */
const overwrite = process.argv.includes('--overwrite');

const tempPath = path.resolve(__dirname, 'temp');
if (!fs.existsSync(tempPath)) { fs.mkdirSync(tempPath); }

/** Key: URL, Value: Item ID / `{id}.png` */
const urlIconMap = new Map<string, number>();
const iconUrlMap = new Map<number, string>();
(async () => {
  // Fandom's CDN serves a Cloudflare challenge to plain HTTP clients and to the "HeadlessChrome" user agent.
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`
  });

  for (const item of itemData.items) {
    // Skip items without icon URL.
    if (!item.id) { continue; }
    if (!item.icon || !item.icon.startsWith('http')) { continue; }
    if (urlIconMap.has(item.icon)) { continue; }

    const outputPath = path.resolve(tempPath, `${item.id}.png`);
    const isCached = fs.existsSync(outputPath);
    if (isCached && !overwrite) {
      urlIconMap.set(item.icon, item.id);
      iconUrlMap.set(item.id, item.icon);
      continue;
    }

    const url = item.icon;
    const response = await page.goto(url);
    if (!response?.ok() || !response.headers()['content-type']?.startsWith('image/')) {
      console.warn(`${isCached ? 'Keeping cached icon for' : 'Skipping'} ${item.id}: ${response?.status()} ${url}`);
      if (isCached) {
        urlIconMap.set(item.icon, item.id);
        iconUrlMap.set(item.id, item.icon);
      }
      continue;
    }
    const buffer = await response.body();
    await sharp(buffer).resize(iconSize, iconSize).toFile(outputPath);
    // await fs.promises.writeFile(outputPath, Buffer.from(buffer));

    urlIconMap.set(item.icon, item.id);
    iconUrlMap.set(item.id, item.icon);
  }
  await browser.close();

  const sheets: Array<IIconSheet> = [];
  const runBatch = async (icons: Array<string>) => {
    const keyForPath = (srcPath: string) => iconUrlMap.get(+srcPath.match(/(\d+)\.png/)![1])!;
    sheets.push(await createSprites(icons, keyForPath, `icons_${sheets.length}.webp`));
  };

  const iconBatch = [];
  const mappedIconUrls = new Set<string>();
  for (const item of itemData.items) {
    if (!item.id) { continue; }
    if (!item.icon || !urlIconMap.has(item.icon)) { continue; }
    if (mappedIconUrls.has(item.icon)) { continue; }
    mappedIconUrls.add(item.icon);
    const mappedItemId = urlIconMap.get(item.icon);

    iconBatch.push(path.resolve(tempPath, `${mappedItemId}.png`));

    // Run batch
    if (iconBatch.length === iconsPerSheet) {
      await runBatch(iconBatch);
      iconBatch.length = 0;
    }
  }

  // Run remaining batch
  if (iconBatch.length) {
    await runBatch(iconBatch);
  }

  // Keep the placeholder sheets from icon-sheet-proxy.
  const proxySheets = readIconsJson().files.filter(f => isProxySheet(f.file));
  writeIconsJson([...sheets, ...proxySheets]);
})();
