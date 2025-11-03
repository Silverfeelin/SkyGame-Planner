const fs = require("fs");
const path = require("path");

const dataDir = path.resolve(__dirname, '../../src/assets/data');
const guids = new Set();
const ids = new Set();
let hasErrors = false;

function processFile(filePath) {
  //console.log('Checking:', filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.matchAll(/"guid":\s*"([a-zA-Z0-9_-]{10})"/g);
  for (const match of matches) {
    // Missing guid.
    if (!match[1]) {
      console.error('Empty GUID found.')
      hasErrors = true;
      continue;
    }
    
    // Duplicate guid.
    if (guids.has(match[1])) {
      console.error('Duplicate GUID found', match[1], filePath);
      hasErrors = true;
    }
    
    // Add guid.
    guids.add(match[1]);
  }
  
  // Check IDs  
  if (filePath.includes('src/assets/data/items/')) {
    const items = JSON.parse(content);
    for (const item of items) {
      if (!item.id && item.guid !== 'iqCCaRTjDu') {
        console.error('Missing ID', item.guid, filePath);
        hasErrors = true;
        continue;
      }
      
      if (ids.has(item.id)) {
        console.error('Duplicate item ID found', item.id, filePath);
        hasErrors = true;
      }

      ids.add(item.id);
    }
  }
}

const excludedFiles = new Set([
  'iaps.json',
  'items.json',
  'nodes.json',
  'candles.json'
]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json') && !excludedFiles.has(entry.name)) {
      processFile(fullPath);
    }
  }
}

walk(dataDir);

if (hasErrors) {
  process.exit(1);
}