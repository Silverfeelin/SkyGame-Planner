const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const json5 = require('json5');
const chalk = require('chalk');

const dataPath = path.resolve(__dirname, '../src/assets/data');
const cache = {};

const readFile = filePath => {
  const fileData = fs.readFileSync(filePath, 'utf8');
  try {
    const data = json5.parse(fileData);
    cache[filePath] = data;
    console.log(chalk.yellow('Parsed:'), chalk.green(filePath));
  } catch (e) {
    console.error(chalk.yellow('Failed:', chalk.red(filePath)));
    console.error(e);
  }
};

const onFileChanged = filePath => {
  // Ignore top level (compiled) & non-JSON.
  if (!filePath.endsWith('.json')) return;
  if (path.dirname(filePath) === dataPath) return;
  console.log(chalk.yellow('Change detected:', chalk.green(filePath)));

  const folderPath = path.dirname(filePath);
  const folderName = path.basename(folderPath);
  const outName = `${folderName}.json`;
  const outPath = path.resolve(dataPath, outName);

  // Get all files in the directory.
  const files = new Set(fs.readdirSync(folderPath));

  // Clear cache for files that no longer exist.
  Object.keys(cache).forEach(key => { if (!files.has(key)) delete cache[key]; });

  // Read all files.
  const arrays = [];
  files.forEach(fileName => {
    const filePathCheck = path.resolve(folderPath, fileName);
    if (filePath === filePathCheck || !cache[filePathCheck]) {
      readFile(filePathCheck);
    }

    if (cache[filePathCheck]) {
      arrays.push(cache[filePathCheck]);
    }
  });

  const merged = arrays.flat();
  if (folderName === 'items') {
    const ids = new Set(merged.map(m => m.id));
    if (ids.size !== merged.length) {
      console.error(chalk.red('Found duplicate item IDs!'));
      console.error(chalk.red(merged.filter(m => !ids.delete(m.id)).map(m => m.id)));
      return;
    }
  }

  const output = {
    items: merged,
  };
  const outData = JSON.stringify(output, null, 0);
  console.log(chalk.cyan('Writing'), chalk.blue(merged.length), chalk.cyan('to:'), chalk.green(outPath));
  fs.writeFileSync(outPath, outData, 'utf8');
};

onFileChanged(path.resolve(dataPath, 'items/_fake.json'));
let debounce;
chokidar.watch(dataPath, { depth: 10 }).on('change', filePath => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    debounce = null;
    onFileChanged(filePath);
  }, 250);
});
