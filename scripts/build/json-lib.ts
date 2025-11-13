const fs = require('fs');
const path = require('path');
const jsonc = require('jsonc-parser');

/** Reads a JSONC file and returns the parsed data. */
export const readJsoncFile = (filePath: string): any => {
  const fileData = fs.readFileSync(filePath, 'utf8');
  const data = jsonc.parse(fileData);
  return data;
};

/** Returns an array of full file paths in the given directory. */
export const getFilePaths = (dirPath: string): string[] => {
  const files = fs.readdirSync(dirPath);
  return files.map(f => path.join(dirPath, f));
}

/** Merges all JSON arrays from a directory into a new file `outPath`.
 * The input files should be a JSONC-compatible array of objects.
 * The output file will be formatted { "items": [ ... ] }.
 */
export const mergeItemFiles = (dirPath: string, outPath: string): void => {
  const items = [];
  const filePaths = getFilePaths(dirPath);
  for (const filePath of filePaths) {
    const data = readJsoncFile(filePath);
    items.push(...data);
  }

  const output = { items };
  const mergedData = JSON.stringify(output, null, 0);
  fs.writeFileSync(outPath, mergedData, 'utf8');
};

/** Merges all JSON files from a directory into a new file `outPath`.
 * The input folder should only contain JSONC-compatible files.
 * The output file will be formatted as `{ "filename": data, ... }`.
*/
export const mergeAll = (dirPath: string, outPath: string): void => {
  const filePaths = getFilePaths(dirPath);
  const data = {};
  for (const filePath of filePaths) {
    if (!filePath.endsWith('.json')) continue;
    if (filePath.endsWith('everything.json')) continue;
    const fileName = path.basename(filePath, path.extname(filePath));
    const name = fileName.replace('.json', '');
    data[name] = readJsoncFile(filePath);

  }
  const mergedData = JSON.stringify(data, null, 0);
  fs.writeFileSync(outPath, mergedData, 'utf8');
}

/** Checks the given file for item ID presence and uniqueness. */
export const checkFileItemIds = (filePath: string): void => {
  const data = readJsoncFile(filePath);
  const items = Array.isArray(data) ? data : data.items;
  if (!items?.length) {
    throw new Error(`No items found in ${filePath}`);
  }

  const ids = new Set<number>();
  for (const item of items) {
    if (item.id === undefined) {
      throw new Error(`Item with guid ${item.guid} does not have an id.`);
    }

    if (ids.has(item.id)) {
      throw new Error(`Duplicate id ${item.id} found in ${filePath}`);
    }
    ids.add(item.id);
  }
}
