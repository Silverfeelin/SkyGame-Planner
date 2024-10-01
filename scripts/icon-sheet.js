const fs = require('fs');
const path = require('path');
const json5 = require('json5');
const Spritesmith = require('spritesmith');
const CWebp = require('cwebp').CWebp;
const sharp = require('sharp');

const iconSize = 128;
const iconsPerRow = 16;
const iconsPerSheet = iconsPerRow * iconsPerRow;

const itemsPath = path.resolve(__dirname, '../src/assets/data/items.json');
const itemData = json5.parse(fs.readFileSync(itemsPath, 'utf8'));

const tempPath = path.resolve(__dirname, 'temp');
if (!fs.existsSync(tempPath)) { fs.mkdirSync(tempPath); }

let maxItemId = 0;
const handledPaths = new Map();
const icons = [];
(async () => {
  for (const item of itemData.items) {
    if (item.id > maxItemId) { maxItemId = item.id; }
    const outputPath = path.resolve(tempPath, `${item.id}.png`);

    if (fs.existsSync(outputPath)) {
      handledPaths.set(item.icon, item.id);
      icons.push({ id: item.id, path: outputPath });
      continue;
    }

    if (!item.id) { console.warn(`'Skipping item ${item.guid}.`); continue; }
    if (!item.icon || !item.icon.startsWith('http')) { console.warn(`Skipping ${item.id}...`); continue; }

    if (handledPaths.has(item.icon)) { continue; }
    handledPaths.set(item.icon, item.id);

    const url = item.icon;
    const response = await fetch(url, {
      headers: { 'Accept': 'image/png' }
    });
    const buffer = await response.arrayBuffer();
    await sharp(buffer).resize(iconSize, iconSize).toFile(outputPath);
    // await fs.promises.writeFile(outputPath, Buffer.from(buffer));

    icons.push({ id: item.id, path: outputPath });
  }

  icons.sort((a, b) => a.id - b.id);


  const sheetIcons = icons.slice(0, iconsPerSheet);
  const sprites = sheetIcons.map(icon => icon.path);
  Spritesmith.run({src: sprites, algorithm: 'binary-tree', algorithmOpts: { sort: false }}, function handleResult (err, result) {
    if (err) throw err;

    const coordinatePath = path.resolve(__dirname, '../src/assets/game/icons.png.json');
    for (const key in result.coordinates) {
      const id = key.match(/(\d+)\.png/)[1];
      const value = result.coordinates[key];
      result.coordinates[id] = { x: value.x, y: value.y };
      delete result.coordinates[key];
    }
    fs.writeFileSync(coordinatePath, JSON.stringify(result.coordinates));

    const spritePath = path.resolve(__dirname, '../src/assets/game/icons.png');
    fs.writeFileSync(spritePath, result.image);

    const webpPath = path.resolve(__dirname, '../src/assets/game/icons.webp');
    const webp = new CWebp(spritePath);
    webp.write(webpPath, (err) => {
      if (err) throw err;
      fs.unlinkSync(spritePath);
      console.log('Done!');
    });
  });
})();
