import { version } from '../../node_modules/skygame-data/package.json';

const dataUrl = `https://data.sky-planner.com/${version.split('.').slice(0, 2).join('.')}`;

export const environment = {
  urls: {
    everything: `${dataUrl}/everything.json`,
    candles: `${dataUrl}/candles.json`,
  }
}
