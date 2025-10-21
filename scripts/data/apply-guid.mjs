import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../src/assets/data');

async function processFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const updated = content.replace(/"guid"\s*:\s*""/g, () => `"guid": "${nanoid(10)}"`);
  if (updated !== content) {
    await fs.writeFile(filePath, updated, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

const excludedFiles = new Set([
  'iaps.json',
  'items.json',
  'nodes.json'
]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json') && !excludedFiles.has(entry.name)) {
      await processFile(fullPath);
    }
  }
}

walk(dataDir).catch(err => {
  console.error(err);
  process.exit(1);
});
