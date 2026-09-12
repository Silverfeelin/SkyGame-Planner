import { readFile } from 'fs/promises';
import { parse } from 'jsonc-parser';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';
import clipboardy from 'node-clipboardy';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '../../node_modules/skygame-data/assets/items.json');

async function getAllDyeFiles() {
  const dyeDir = join(__dirname, '../../src/assets/game/dyes');
  // Use the recursive option to get all files in subdirectories
  const entries = await readdir(dyeDir, { recursive: true });
  // Map to absolute paths
  return entries.filter(e => e.includes('.')).map(e => {
    e = e.replace(/\\/g, '/');
    return `https://sky-planner.com/assets/game/dyes/${e}`
  });
}

async function main() {
  try {
    const filePaths = new Set(await getAllDyeFiles());
    const itemData = await readFile(filePath, 'utf8');
    const items = parse(itemData)?.items || [];

    items.forEach(item => {
      if (!item.dye) { return; }
      if (item.dye.previewUrl) { filePaths.delete(item.dye.previewUrl); }
      if (item.dye.infoUrl) { filePaths.delete(item.dye.infoUrl); }
    });

    console.log('Unused dye files:', Array.from(filePaths));

    // Write to clipboard in the specified format
    const fileNames = Array.from(filePaths);
    const clipboardContent = `const fileNames = [\n  '${fileNames.join("',\n  '")}'\n]`;

    await clipboardy.write(clipboardContent);
    console.log('File paths copied to clipboard in the specified format!');

  } catch (err) {
    console.error('Error reading or parsing JSONC file:', err);
  }
}

main();
