import { version } from '../../node_modules/skygame-data/package.json';

const dataUrl = `https://data.sky-planner.com/${version.split('.').slice(0, 2).join('.')}`;

export const environment: {
  urls: { everything: string, candles: string, tsc: string },
  /** Rewrites asset URLs starting with `from` to start with `to`. */
  assetRewrite?: { from: string, to: string }
} = {
  urls: {
    everything: `${dataUrl}/everything.json`,
    candles: `${dataUrl}/candles.json`,
    tsc: 'https://thatskycollection.com',
  }
}
