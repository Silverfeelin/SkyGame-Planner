import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import * as jsonc from 'jsonc-parser';
import { nanoid } from 'nanoid';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const currentYear = new Date().getFullYear();

const dataDir = path.resolve(__dirname, '../../src/assets/data');
const eventsPath = path.join(dataDir, 'events.json');
const eventJson = fs.readFileSync(eventsPath, 'utf8');
const events = jsonc.parse(eventJson).items;

const shopsPath = path.join(dataDir, 'shops.json');
const shopsJson = fs.readFileSync(shopsPath, 'utf8');
const shops = jsonc.parse(shopsJson).items;
const shopMap = new Map(shops.map(s => [s.guid, s]));

const iapsPath = path.join(dataDir, 'iaps.json');
if (!fs.existsSync(iapsPath)) {
  console.error('Missing files data directory. Please run json-watch or json-build first.');
  process.exit(1);
}

(async () => {
  // Select event
  const choices = events.slice().sort((a, b) => {
    if (a.recurring !== b.recurring) {
      return a.recurring ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  }).map(e => e.name);

  const { eventName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'eventName',
      message: 'Select an event:',
      choices,
      pageSize: 10
    }
  ]);

  const eventIndex = events.findIndex(e => e.name === eventName);
  const event = events[eventIndex];

  // Select start date
  const getFirstMonday = () => {
    const today = new Date();
    const day = today.getDay();
    if (day === 1) { return today.toISOString().slice(0, 10); }
    const diff = (8 - day) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + diff);
    return nextMonday.toISOString().slice(0, 10);
  };

  const { startDate } = await inquirer.prompt([
    {
      type: 'input',
      name: 'startDate',
      message: 'Enter the start date (YYYY-MM-DD):',
      default: getFirstMonday(),
      validate: (input: string) => {
        if (!input) return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(input) ? true : 'Please enter a valid date in YYYY-MM-DD format.';
      }
    }
  ]);

  // Select duration in weeks
  const { durationWeeks } = await inquirer.prompt([
    {
      type: 'number',
      name: 'durationWeeks',
      message: 'Enter the duration in weeks:',
      default: 1,
      validate: (input: number) => {
        return input > 0 ? true : 'Duration must be a positive number.';
      }
    }
  ]);

  // Get end date
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + durationWeeks * 7 - 1);
  let endDate: any = new Date(end);
  endDate.setDate(end.getDate() + (7 - end.getDay()) % 7);
  endDate = endDate.toISOString().slice(0, 10);

  // Add instance
  const lastEventInstance = event.instances.at(-1);
  const lastShops = lastEventInstance?.shops || [];
  console.log('Last shops:', lastShops);
  const iapGuids = lastShops.map(s => (shopMap.get(s) as any)?.iaps || []).flat().filter(v => v);
  console.log('Last IAPs:', iapGuids);

  const recurringShop = {
    guid: nanoid(10),
    type: 'Spirit',
    spirit: 'dK38RIPIOG',
    iaps: iapGuids
  };

  const newShop = {
    guid: nanoid(10),
    type: 'Store',
    iaps: []
  };

  const instance = {
    guid: nanoid(10),
    date: startDate,
    endDate: endDate,
    spirits: [
      { guid: nanoid(10), spirit: 'U9vUspUuRp', tree: 'kZJKg9jxtn' }
    ],
    shops: [ newShop.guid, recurringShop.guid ]
  }

  // Clone IAPs
  const iapsJson = fs.readFileSync(iapsPath, 'utf8');
  const iaps = jsonc.parse(iapsJson).items;

  const iapMap = new Map(iaps.map(i => [i.guid, i]));
  const newIaps = iapGuids.map(guid => {
    return iapMap.get(guid)
  });
  newIaps.forEach((iap, i) => {
    iap.guid = nanoid(10);
    iap.returning = true;
    iapGuids[i] = iap.guid;
  });



  const iapUnsortedPath = path.join(dataDir, 'iaps/unsorted.json');
  const unsortedIaps = jsonc.parse(fs.readFileSync(iapUnsortedPath, 'utf8'));
  unsortedIaps.push(...newIaps);
  fs.writeFileSync(iapUnsortedPath, JSON.stringify(unsortedIaps, undefined, 2), 'utf8');

  // Modify event JSON.
  const eventEdits = jsonc.modify(
    eventJson,
    ['items', eventIndex, 'instances', -1],
    instance,
    { formattingOptions: { insertSpaces: true, tabSize: 2 } }
  );
  const newEventJson = jsonc.applyEdits(eventJson, eventEdits);
  fs.writeFileSync(eventsPath, newEventJson, 'utf8');

  // Modify shop JSON.
  // Find the last comment containing eventName
  let iShopRegion = shopsJson.lastIndexOf(eventName);
  if (iShopRegion >= 0) { iShopRegion = shopsJson.indexOf('#endregion', iShopRegion); }
  if (iShopRegion >= 0) { iShopRegion = shopsJson.indexOf('\n', iShopRegion); }
  if (iShopRegion <= 0) {
    console.error(`No region found for event: ${eventName}`);
    return;
  }

  const newShopString = JSON.stringify(newShop, null, 2).replace(/^(?!$)/gm, '    ');
  const recurringShopString = JSON.stringify(recurringShop, null, 2).replace(/^(?!$)/gm, '    ');
  const regionComment = `    // #region ${eventName} (${currentYear})`;
  const endRegionComment = `    // #endregion`;
  const insertText = `\n${regionComment}\n${newShopString},\n${recurringShopString},\n${endRegionComment}\n`;

  const shopEdits = [
    {
      offset: iShopRegion,
      length: 0,
      content: insertText
    }
  ];
  const newShopsJson = jsonc.applyEdits(shopsJson, shopEdits);
  fs.writeFileSync(shopsPath, newShopsJson, 'utf8');


})();

