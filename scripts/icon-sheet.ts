import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as json5 from 'json5';
import * as Spritesmith from 'spritesmith';
const sharp = require('sharp');
const CWebp = require('cwebp').CWebp;

const runSpritesmithAsync = util.promisify(Spritesmith.run);

const iconSize = 128;
const iconsPerSheet = 16 * 16;
const sheetWidth = iconSize * 16;

interface IItem { guid: string, id: number, icon?: string };
const itemsPath = path.resolve(__dirname, '../src/assets/data/items.json');
const itemData: { items: Array<IItem> } = json5.parse(fs.readFileSync(itemsPath, 'utf8'));
itemData.items.sort((a: IItem, b: IItem) => a.id - b.id);

const tempPath = path.resolve(__dirname, 'temp');
if (!fs.existsSync(tempPath)) { fs.mkdirSync(tempPath); }

/** Key: URL, Value: Item ID / `{id}.png` */
const urlIconMap = new Map<string, number>();
const iconUrlMap = new Map<number, string>();
(async () => {
  for (const item of itemData.items) {
    // Skip items without icon URL.
    if (!item.id) { continue; }
    if (!item.icon || !item.icon.startsWith('http')) { continue; }

    // Check if icon already exists.
    const outputPath = path.resolve(tempPath, `${item.id}.png`);
    if (fs.existsSync(outputPath)) {
      urlIconMap.set(item.icon, item.id);
      iconUrlMap.set(item.id, item.icon);
    }
    if (urlIconMap.has(item.icon)) { continue; }

    const url = item.icon;
    const response = await fetch(url, {
      headers: { 'Accept': 'image/png' }
    });
    const buffer = await response.arrayBuffer();
    await sharp(buffer).resize(iconSize, iconSize).toFile(outputPath);
    // await fs.promises.writeFile(outputPath, Buffer.from(buffer));

    urlIconMap.set(item.icon, item.id);
    iconUrlMap.set(item.id, item.icon);
  }

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
    const spritePath = path.resolve(__dirname, `../src/assets/game/icons_${iFile}.png`);
    console.log(spritePath);
    fs.writeFileSync(spritePath, result.image, { flag: 'w'});

    const webpPath = path.resolve(__dirname, `../src/assets/game/icons_${iFile}.webp`);
    const webp = new CWebp(spritePath);
    console.log(`Converting ${spritePath} to ${webpPath} asynchronously...`);
    webp.write(webpPath, (err) => {
      if (err) { console.error(`Failed to save ${webpPath}: `, err); }
      fs.unlinkSync(spritePath);
    });

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
