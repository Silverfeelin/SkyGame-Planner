const fs = require('fs');
const path = require('path');
const json5 = require('json5');

const getItemId = () => {
  const rawdata = fs.readFileSync(path.join(__dirname, '../src/assets/data/items.json'));
  const itemConfig = json5.parse(rawdata);
  const maxId = Math.max(...itemConfig.items.map(i => i.id));
  return maxId + 1;
};

let id = getItemId();
const itemsFilePath = path.resolve(__dirname, '../src/assets/data/items/unsorted.json');
const items = json5.parse(fs.readFileSync(itemsFilePath, 'utf8'));
let changed = false;
items.forEach((item, i) => {
  if (item.id >= 0) { return; }
  items[i] = { id: id++, ...item };
  changed = true;
});

if (changed) {
  fs.writeFileSync(itemsFilePath, JSON.stringify(items, null, 2));
}

console.log(id);
