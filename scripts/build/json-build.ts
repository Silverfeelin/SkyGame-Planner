import { mergeItemFiles, checkFileItemIds, mergeAll } from './json-lib';

const path = require('path');
const fs = require('fs');

const dataDirPath = path.join(__dirname, '../../src/assets/data');
const folderPaths = fs.readdirSync(dataDirPath).filter((name: string) => {
  const fullPath = path.join(dataDirPath, name);
  return fs.statSync(fullPath).isDirectory();
});

folderPaths.forEach((folderName: string) => {
  const dirPath = path.join(dataDirPath, folderName);
  const outPath = path.join(dataDirPath, `${folderName}.json`);
  console.log(`Merging ${folderName}:`, dirPath, '->', outPath);
  mergeItemFiles(dirPath, outPath);
  if (folderName === 'items') {
    checkFileItemIds(outPath);
  }
});

mergeAll(dataDirPath, path.join(dataDirPath, 'everything.json'));
