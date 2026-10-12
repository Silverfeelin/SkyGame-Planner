import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as jsonc from 'jsonc-parser';
import * as Spritesmith from 'spritesmith';
import { chromium } from 'playwright';
const sharp = require('sharp');

const runSpritesmithAsync = util.promisify(Spritesmith.run);

const iconSize = 128;
const iconsPerSheet = 16 * 16;
const sheetWidth = iconSize * 16;

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

  const coordinatePath = path.resolve(__dirname, '../src/assets/game/icons.json');
  const coordinateData: any = { files: [] };

  const createSprites = async (icons: Array<string>) => {
    const options: any = { src: icons, algorithm: 'binary-tree', algorithmOpts: { sort: false } };
    const result = await runSpritesmithAsync(options);
    const coordinates: { [key: string]: { x: number, y: number }} = {};
    for (const key in result.coordinates) {
      if (!key || key === 'undefined') { continue; }
      const id = +key.match(/(\d+)\.png/)[1];
      const value = result.coordinates[key];
      const url = iconUrlMap.get(id);
      coordinates[url] = { x: value.x, y: value.y };
    }

    if (result.properties.width !== sheetWidth || result.properties.height !== sheetWidth) {
      const sheetHeight = Math.ceil(result.properties.height / sheetWidth) * sheetWidth;
      const resizedImage = await sharp(result.image).extend({
        top: 0,
        bottom: sheetHeight - result.properties.height,
        left: 0,
        right: sheetWidth - result.properties.width,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }).toBuffer();
      result.image = resizedImage;
    }

    const iFile = coordinateData.files.length;
    const webpPath = path.resolve(__dirname, `../src/assets/game/icons_${iFile}.webp`);
    console.log(webpPath);
    // Quality 75 matches the cwebp CLI default the existing sheets were encoded with.
    await sharp(result.image).webp({ quality: 75 }).toFile(webpPath);

    coordinateData.files.push({
      file: `icons_${iFile}.webp`,
      coordinates,
      width: result.properties.width,
      height: result.properties.height
    });
  }

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
      await createSprites(iconBatch);
      iconBatch.length = 0;
    }
  }

  // Run remaining batch
  if (iconBatch.length) {
    await createSprites(iconBatch);
  }

  fs.writeFileSync(coordinatePath, JSON.stringify(coordinateData));
})();
