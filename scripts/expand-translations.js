import fs from 'fs';
import path from 'path';

const everythingPath = './node_modules/skygame-data/assets/everything.json';
const everything = JSON.parse(fs.readFileSync(everythingPath, 'utf8'));

const extract = (data, guidKey = 'guid', nameKey = 'name') => {
  const result = {};
  if (data && data.items) {
    data.items.forEach(item => {
      if (item[guidKey] && item[nameKey]) {
        result[item[guidKey]] = item[nameKey];
      }
    });
  }
  return result;
};

const localizedData = {
  items: extract(everything.items),
  spirits: extract(everything.spirits),
  seasons: extract(everything.seasons),
  areas: extract(everything.areas),
  realms: extract(everything.realms)
};

// Write English base
fs.writeFileSync('./src/assets/i18n/game-data/en.json', JSON.stringify(localizedData, null, 2));

// For Vietnamese, we'll keep existing translations if they exist
const viPath = './src/assets/i18n/game-data/vi.json';
let viData = { items: {}, spirits: {}, seasons: {}, areas: {}, realms: {} };

if (fs.existsSync(viPath)) {
  try {
    viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
  } catch (e) {}
}

// Merge: New items from English base (untranslated) + existing translations
const mergedVi = {
  items: { ...localizedData.items, ...viData.items },
  spirits: { ...localizedData.spirits, ...viData.spirits },
  seasons: { ...localizedData.seasons, ...viData.seasons },
  areas: { ...localizedData.areas, ...viData.areas },
  realms: { ...localizedData.realms, ...viData.realms }
};

fs.writeFileSync(viPath, JSON.stringify(mergedVi, null, 2));

console.log('Successfully expanded game-data translations!');
