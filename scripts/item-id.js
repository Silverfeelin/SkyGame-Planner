const fs = require('fs');
const path = require('path');
const json5 = require('json5');

const rawdata = fs.readFileSync(path.join(__dirname, '../src/assets/data/items.json'));
const itemConfig = json5.parse(rawdata);
const maxId = Math.max(...itemConfig.items.map(i => i.id));

try {
  let wikiJs = fs.readFileSync(path.join(__dirname, './userscripts/wiki_item.js'), 'utf8');
  wikiJs = wikiJs.replace(/\/\*S-ID\*\/(\d+)/, `/*S-ID*/${maxId + 1}`);
  fs.writeFileSync(path.join(__dirname, './userscripts/wiki_item.js'), wikiJs);
} catch (e) {
  console.error(e);
}

console.log(maxId + 1);
