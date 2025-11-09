import { checkFileItemIds, mergeAll, mergeItemFiles } from './json-lib';

const path = require('path');
const chokidar = require('chokidar');
const chalk = require('chalk');

const dataPath = path.resolve(__dirname, '../../src/assets/data');

const onFileChanged = (filePath: string) => {
  // Only process JSON files
  if (!filePath.endsWith('.json')) return;
  // Only process subfolders
  if (path.dirname(filePath) === dataPath) return;

  console.log('Change detected:', filePath);

  const folderPath = path.dirname(filePath);
  const folderName = path.basename(folderPath);
  const outName = `${folderName}.json`;
  const outPath = path.resolve(dataPath, outName);

  try {
    mergeItemFiles(folderPath, outPath);
    if (outName === 'items.json') {
      checkFileItemIds(outPath);
    }
    mergeAll(dataPath, path.resolve(dataPath, 'everything.json'));
    console.log('Merged:', outName);
  }
  catch (error) {
    console.error(chalk.red('Error processing file:', filePath), '\n', error);
  }
};

let debounce;
chokidar.watch(dataPath, { depth: 10 }).on('change', filePath => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    debounce = null;
    onFileChanged(filePath);
  }, 250);
});

console.log('Watching for changes in:', dataPath);
onFileChanged(path.resolve(dataPath, 'items/_fake.json'));
onFileChanged(path.resolve(dataPath, 'nodes/_fake.json'));
onFileChanged(path.resolve(dataPath, 'iaps/_fake.json'));
