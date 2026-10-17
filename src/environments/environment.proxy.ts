export const environment = {
  urls: {
    everything: '/proxy/everything.json',
    candles: '/proxy/candles.json',
  },
  // Serve Planner-hosted icons from this dev server, so they show before they're deployed.
  assetRewrite: { from: 'https://sky-planner.com/assets/game/items/', to: '/assets/game/items/' }
}
