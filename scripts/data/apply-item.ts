import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';
import inquirer from 'inquirer';
import * as jsonc from 'jsonc-parser';
import { nanoid } from 'nanoid';
import { Command } from 'commander';

const itemKeys = new Set([
  'id',
  'guid',
  'name',
  'type',
  'subtype',
  'group',
  'icon',
  'previewUrl',
  'dye',
  'level',
  '_wiki',
]);

const program = new Command();
program
  .option('-i, --input <string>', 'file path')
  .option('-f, --folder <string>', 'folder path')
;

program.parse(process.argv);

const options = program.opts();

const applyItem = async (inputFilePath: string) => {
  const data = await fs.readFile(inputFilePath, 'utf8');
  const newItemData = jsonc.parse(data);
  const guid = newItemData?.guid;

  if (!guid) {
    console.error('No GUID found in the input data.');
    process.exit(1);
  }

  const itemsPath = path.resolve(__dirname, '../../src/assets/data/items');
  const itemFilePaths = (await fs.readdir(itemsPath))
    .filter(file => file.endsWith('.json'));

  console.log(`Using data folder: ${itemsPath}`);
  console.log(`Found item files:`, itemFilePaths.length);

  for (const file of itemFilePaths) {
    const filePath = path.join(itemsPath, file);
    const fileContent = await fs.readFile(filePath, 'utf8');
    let iItem = fileContent.indexOf(guid);
    if (iItem === -1) { continue; }
    iItem = fileContent.lastIndexOf('{', iItem);
    if (iItem === -1) {
      console.error(`Opening bracket not found before GUID in file: ${file}`);
      process.exit(1);
    }

    const fileData = jsonc.parse(fileContent, undefined, { disallowComments: false });
    const itemData = JSON.parse(JSON.stringify(fileData.find((item: any) => item.guid === guid)));

    for (const key of Object.keys(newItemData)) {
      if (!itemKeys.has(key)) {
        console.warn(`Key is not supported:`, key);
        continue;
      }

      itemData[key] = newItemData[key];
    }

    const itemIndex = fileData.findIndex((item: any) => item.guid === guid);
    if (itemIndex === -1) {
      console.error(`Item with GUID ${guid} not found in file: ${file}`);
      continue;
    }
    const edits = jsonc.modify(
      fileContent,
      [itemIndex],
      itemData,
      { formattingOptions: { insertSpaces: true, tabSize: 2 } }
    );
    const updatedContent = jsonc.applyEdits(fileContent, edits);
    await fs.writeFile(filePath, updatedContent, 'utf8');
    console.log(`Updated item in file: ${file}`);
  }
};

(async () => {
  if (options.input) {
    await applyItem(options.input);
  }
  if (options.folder) {
    const files = (await fs.readdir(options.folder)).filter(file => file.endsWith('.json'));
    for (const file of files) {
      await applyItem(path.join(options.folder, file));
    }
  }
})();
