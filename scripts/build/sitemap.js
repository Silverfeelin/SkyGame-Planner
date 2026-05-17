const fs = require('fs');
const path = require('path');
const jsonc = require('jsonc-parser');

const sitemapPath = path.resolve(__dirname, '../../src/sitemap.xml');
const sitemapBasePath = path.resolve(__dirname, '../../src/sitemap-base.xml');

const paths = {
  events: path.resolve(__dirname, '../../node_modules/skygame-data/assets/events.json'),
  items: path.resolve(__dirname, '../../node_modules/skygame-data/assets/items.json'),
  realms: path.resolve(__dirname, '../../node_modules/skygame-data/assets/realms.json'),
  areas: path.resolve(__dirname, '../../node_modules/skygame-data/assets/areas.json'),
  seasons: path.resolve(__dirname, '../../node_modules/skygame-data/assets/seasons.json'),
  spirits: path.resolve(__dirname, '../../node_modules/skygame-data/assets/spirits.json'),
  rs: path.resolve(__dirname, '../../node_modules/skygame-data/assets/special-visits.json')
};

const data = {};
for (const key in paths) {
  data[key] = jsonc.parse(fs.readFileSync(paths[key], 'utf8'));
}

const sitemap = fs.readFileSync(sitemapBasePath, 'utf8');
const entries = [];

for (const event of data.events.items) {
  entries.push(`<url><loc>https://sky-planner.com/event/${event.guid}</loc></url>`);
  for (const instance of event.instances || []) {
    entries.push(`<url><loc>https://sky-planner.com/event-instance/${instance.guid}</loc></url>`);
  }
}

for (const item of data.items.items) {
  entries.push(`<url><loc>https://sky-planner.com/item/${item.guid}</loc></url>`);
}

for (const realm of data.realms.items) {
  entries.push(`<url><loc>https://sky-planner.com/realm/${realm.guid}</loc></url>`);
}

for (const area of data.areas.items) {
  entries.push(`<url><loc>https://sky-planner.com/area/${area.guid}</loc></url>`);
}

for (const season of data.seasons.items) {
  entries.push(`<url><loc>https://sky-planner.com/season/${season.guid}</loc></url>`);
}

for (const spirit of data.spirits.items) {
  entries.push(`<url><loc>https://sky-planner.com/spirit/${spirit.guid}</loc></url>`);
}

for (const rs of data.rs.items) {
  entries.push(`<url><loc>https://sky-planner.com/rs/${rs.guid}</loc></url>`);
}

fs.writeFileSync(sitemapPath, sitemap.replace('<!-- ENTRIES -->', entries.join('\n')));
