export const SECTIONS = {
  home:        { label: 'home.label', link: '/', icon: 'home', exact: true, pages: [] },
  daily:       { label: 'daily.label', link: '/daily', icon: 'today', pages: ['daily', 'crTracker', 'pnrTracker'] },
  currency:    { label: 'currency.label', link: '/currency', icon: 'wallet', svgIcon: 'candle', pages: ['currency', 'currencySpent', 'wikiCurrency'] },
  item:        { label: 'item.label', link: '/item', icon: 'checkroom', pages: [
     'itemGrid', 'itemTable', 'itemPreview', 'itemDye', 'itemCollection', 'itemQuickUnlock', 'itemHearts', 'itemCost', 'itemGoals', 'itemInflation',
     'suggestItem', 'wikiCosmetics'
  ] },
  spirit:      { label: 'spirit.label', link: '/spirit', icon: 'person', match: ['/spirit-tree'], pages: [
     'spirits', 'regularSpirits', 'elderSpirits', 'seasonSpirits', 'seasonGuides',
     'travelingSpirits', 'specialVisits', 'elusiveSpirits', 'wikiSpirits', 'spiritGraphs', 'spiritTreeEditor'
  ] },
  wingedLight: { label: 'wingedLight.label', link: '/winged-light', icon: 'air', svgIcon: 'flaps', pages: ['wingedLight', 'childrenOfLight', 'wingBuffs', 'wikiWingedLight'] },
  realm:       { label: 'realm.label', link: '/realm', icon: 'map', pages: ['realms', 'areas', 'sharedCreations', 'crTracker', 'pnrTracker', 'wikiRealms'] },
  season:      { label: 'season.label', link: '/season', icon: 'ac_unit', pages: ['seasons', 'seasonOptimizer', 'seasonCalculator', 'wikiSeasons', 'eventCalendar'] },
  event:       { label: 'event.label', link: '/event', icon: 'celebration', match: ['/event-instance'], pages: ['events', 'eventHistory', 'eventCalculator', 'wikiEvents', 'eventCalendar'] },
  shop:        { label: 'shop.label', link: '/shop', icon: 'shopping_cart', pages: [
     'shops', 'shopEvent', 'shopCinema', 'shopConcertHall', 'shopHarmonyHall', 'shopLoyalty', 'shopNesting', 'shopOffice', 'shopPrairie', 'shopWonderland',
     'wikiShops'
  ] },
  friend:      { label: 'friend.label', link: '/friend', icon: 'people', pages: [] },
  tool:        { label: 'tool.label', link: '/tool', icon: 'build', match: ['/quick-start'], pages: ['tools', 'quickStart', 'closet', 'collage'] },
};