const fs = require('fs');
const path = require('path');
const jsonc = require('jsonc-parser');

// nanoid - https://github.com/ai/nanoid
// MIT License - https://github.com/ai/nanoid/blob/main/LICENSE
// https://cdnjs.cloudflare.com/ajax/libs/nanoid/5.0.2/index.browser.js
const nanoid = (size = 21) =>
  crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
    byte &= 63
    if (byte < 36) {
      id += byte.toString(36)
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase()
    } else if (byte > 62) {
      id += '-'
    } else {
      id += '_'
    }
    return id
  }, '')

const getItemId = () => {
  const rawdata = fs.readFileSync(path.join(__dirname, '../src/assets/data/items.json'), 'utf8');
  const itemConfig = jsonc.parse(rawdata);
  const maxId = Math.max(...itemConfig.items.map(i => i.id || 0));
  return maxId + 1;
};

// Check and apply IDs to unsorted.json.
let id = getItemId();
const itemsFilePath = path.resolve(__dirname, '../src/assets/data/items/unsorted.json');
const items = jsonc.parse(fs.readFileSync(itemsFilePath, 'utf8'));
let changed = false;
items.forEach((item, i) => {
  console.log(item);
  if (!item.id || item.id < 0) {
    delete item.id;
    items[i] = { id: id++, ...item };
    changed = true;
  }
  if (!item.guid) {
    items[i].guid = nanoid(10);
    changed = true;
  }
});

if (changed) {
  fs.writeFileSync(itemsFilePath, JSON.stringify(items, null, 2));
}

console.log(id);
