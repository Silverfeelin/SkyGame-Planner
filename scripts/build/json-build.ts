const path = require('path');
import { mergeItemFiles, checkFileItemIds } from './json-lib';

const itemsDirPath = path.join(__dirname, '../../src/assets/data/items');
const itemsOutPath = path.join(__dirname, '../../src/assets/data/items.json');
console.log('Merging items...', itemsDirPath, '->', itemsOutPath);
mergeItemFiles(itemsDirPath, itemsOutPath);
checkFileItemIds(itemsOutPath);

const iapsDirPath = path.join(__dirname, '../../src/assets/data/iaps');
const iapsOutPath = path.join(__dirname, '../../src/assets/data/iaps.json');
mergeItemFiles(iapsDirPath, iapsOutPath);

const nodesDirPath = path.join(__dirname, '../../src/assets/data/nodes');
const nodesOutPath = path.join(__dirname, '../../src/assets/data/nodes.json');
mergeItemFiles(nodesDirPath, nodesOutPath);
