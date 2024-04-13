const fs = require('fs');
const path = require('path');
const json5 = require('json5');

const rawdata = fs.readFileSync(path.join(__dirname, '../src/assets/data/items.json'));
const itemConfig = json5.parse(rawdata);
const maxId = Math.max(...itemConfig.items.map(i => i.id));

console.log(maxId + 1);
