import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as Spritesmith from 'spritesmith';
const sharp = require('sharp');

const runSpritesmithAsync = util.promisify(Spritesmith.run);

export const iconSize = 128;
export const iconsPerSheet = 16 * 16;
export const sheetWidth = iconSize * 16;

/** Icon URL prefix of icons hosted by the Planner (src/assets/game/items), for items without a wiki icon yet. */
export const HOSTED_PREFIX = 'https://sky-planner.com/assets/game/items/';
export const isHostedSheet = (file: string) => file.startsWith('icons_hosted_');

export const gameAssetsPath = path.resolve(__dirname, '../src/assets/game');
const iconsJsonPath = path.resolve(gameAssetsPath, 'icons.json');

export interface IIconSheet {
  file: string;
  coordinates: { [key: string]: { x: number, y: number }};
  width: number;
  height: number;
}

export const readIconsJson = (): { files: Array<IIconSheet> } => {
  if (!fs.existsSync(iconsJsonPath)) { return { files: [] }; }
  return JSON.parse(fs.readFileSync(iconsJsonPath, 'utf8'));
};

export const writeIconsJson = (files: Array<IIconSheet>) => {
  fs.writeFileSync(iconsJsonPath, JSON.stringify({ files }));
};

/**
 * Packs the icons into src/assets/game/<fileName>.
 * @param srcPaths 128x128 icon images.
 * @param keyForPath Returns the icons.json key (the item icon path) for an image path.
 */
export const createSprites = async (srcPaths: Array<string>, keyForPath: (srcPath: string) => string, fileName: string): Promise<IIconSheet> => {
  const options: any = { src: srcPaths, algorithm: 'binary-tree', algorithmOpts: { sort: false } };
  const result = await runSpritesmithAsync(options);
  const coordinates: { [key: string]: { x: number, y: number }} = {};
  for (const key in result.coordinates) {
    if (!key || key === 'undefined') { continue; }
    const value = result.coordinates[key];
    coordinates[keyForPath(key)] = { x: value.x, y: value.y };
  }

  // Pad to full sheet width; the icon component assumes 2048 px sheets.
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

  const webpPath = path.resolve(gameAssetsPath, fileName);
  console.log(webpPath);
  // Quality 75 matches the cwebp CLI default the existing sheets were encoded with.
  await sharp(result.image).webp({ quality: 75 }).toFile(webpPath);

  return {
    file: fileName,
    coordinates,
    width: result.properties.width,
    height: result.properties.height
  };
};
