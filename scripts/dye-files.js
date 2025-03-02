const fs = require('fs');
const path = require('path');
const ncp = require('node-clipboardy');

// Write all dye image files to the clipboard
const dyeDirectoryPath = path.join(__dirname, '../src/assets/game/dyes');
const dyeFiles = fs.readdirSync(dyeDirectoryPath, { recursive: true })
  .filter(f => f.match(/\.\w+$/i))
  .map(f => f.replace(/\\/g, '/'))
  .map(f => `/assets/game/dyes/${f}`);

ncp.writeSync(JSON.stringify(dyeFiles, undefined, 2));

// Write all mapped preview URLs to the clipboard
const items = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/data/items.json'), 'utf8'));
const mapped = items.items.filter(i => i.dye?.previewUrl).map(item => {
  return `{ guid: '${item.guid}', url: '${item.dye.previewUrl}'},`;
});
ncp.writeSync(mapped.join('\n'));
