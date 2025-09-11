import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = path.resolve(__dirname, '../../dist/sky-game-planner/3rdpartylicenses.txt');
const destDir = path.resolve(__dirname, '../../dist/sky-game-planner/browser/assets');
const dest = path.join(destDir, '3rdpartylicenses.txt');

async function copyLicense() {
  try {
    await fs.access(src);
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(src, dest);
    console.log('License file copied.');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('Source license file does not exist. Nothing to copy.');
    } else {
      console.error('Error copying license file:', err);
    }
  }
}

copyLicense();
