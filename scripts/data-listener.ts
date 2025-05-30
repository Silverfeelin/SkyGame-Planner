/**
 * This script listens for incoming HTTP requests and saves the data to the unsorted.json file.
 * By itself this script is pretty useless. The other part of this tool is private.
 */

const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const json5 = require('json5');

// https://github.com/ai/nanoid/blob/main/LICENSE
const nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce((t, e) =>(t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

program
  .option('-p, --port <port>', 'Port to run the server on', '4201')
  .parse(process.argv);
const port = program.port || 4201;

const itemsFilePath = path.resolve(__dirname, '../src/assets/data/items/unsorted.json');
const getItemId = () => {
  const rawdata = fs.readFileSync(path.join(__dirname, '../src/assets/data/items.json'));
  const itemConfig = json5.parse(rawdata);
  const maxId = Math.max(...itemConfig.items.map(i => i.id));
  return maxId + 1;
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
};

const endpoints = {
  POST: {
    '/api/item': (req, res) => {
      console.log(chalk`{yellow Adding item...}`);
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          if (typeof jsonData !== 'object') { throw new Error('Invalid JSON'); }

          const itemData = {
            id: getItemId(),
            guid: nanoid(10),
            ...jsonData,
          };

          const itemsJson = fs.readFileSync(itemsFilePath, 'utf8');
          const items = JSON.parse(itemsJson);
          items.push(itemData);
          fs.writeFileSync(itemsFilePath, JSON.stringify(items, null, 2) + '\n');

          console.log(chalk`{yellow Saved.}`);
          res.end(JSON.stringify({ message: 'Item saved successfully' }));
        } catch (error) {
          console.error(chalk.red(error));
          res.end(JSON.stringify({ message: 'Invalid JSON' }));
        }
      });
      return;
    }
  }
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(chalk`{green ${req.method}} ${pathname}`);
  res.writeHead(200, headers);
  if (endpoints[req.method] && endpoints[req.method][pathname]) {
    return endpoints[req.method][pathname](req, res);
  }

  res.writeHead(404, headers);
  return res.end('Page not found');
});

server.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});
