import { Routes } from '@angular/router';
import { AtmosphericShellComponent } from './shell/atmospheric-shell.component';
import { AtmosphericDashboardComponent } from './dashboard/atmospheric-dashboard.component';
import { AtmosPrivacyComponent } from './privacy/atmos-privacy.component';
import { AtmosSettingsComponent } from './settings/atmos-settings.component';
import { AtmosItemsComponent } from './item/atmos-items.component';
import { AtmosItemGridComponent } from './item/grid/atmos-item-grid.component';
import { AtmosItemPreviewComponent } from './item/preview/atmos-item-preview.component';
import { AtmosItemDyeComponent } from './item/dye/atmos-item-dye.component';
import { AtmosItemHeartsComponent } from './item/heart/atmos-item-hearts.component';
import { AtmosItemCollectionComponent } from './item/collection/atmos-item-collection.component';
import { AtmosItemDetailComponent } from './item/detail/atmos-item-detail.component';
import { AtmosItemFieldGuideComponent } from './item/field-guide/atmos-item-field-guide.component';
import { AtmosItemInflationComponent } from './item/inflation/atmos-item-inflation.component';
import { AtmosItemUnlockComponent } from './item/unlock/atmos-item-unlock.component';
import { AtmosItemUnlockCalculatorComponent } from './item/unlock-calculator/atmos-item-unlock-calculator.component';
import { AtmosCurrencyComponent } from './currency/atmos-currency.component';
import { AtmosCurrencySpentComponent } from './currency/spent/atmos-currency-spent.component';
import { AtmosSeasonCalculatorComponent } from './season-calculator/atmos-season-calculator.component';
import { AtmosSeasonsComponent } from './season/seasons/atmos-seasons.component';
import { AtmosSeasonComponent } from './season/detail/atmos-season.component';
import { AtmosSeasonOptimizerComponent } from './season/optimizer/atmos-season-optimizer.component';
import { AtmosEventsComponent } from './event/events/atmos-events.component';
import { AtmosEventComponent } from './event/detail/atmos-event.component';
import { AtmosEventHistoryComponent } from './event/history/atmos-event-history.component';
import { AtmosEventInstanceComponent } from './event-instance/atmos-event-instance.component';
import { AtmosEventCalculatorComponent } from './event-calculator/atmos-event-calculator.component';
import { AtmosSpiritsComponent } from './spirit/spirits/atmos-spirits.component';
import { AtmosElusiveSpiritsComponent } from './spirit/elusive/atmos-elusive-spirits.component';
import { AtmosSpiritComponent } from './spirit/detail/atmos-spirit.component';
import { AtmosTravelingSpiritsComponent } from './ts/atmos-traveling-spirits.component';
import { AtmosReturningSpiritsComponent } from './rs/atmos-returning-spirits.component';
import { AtmosReturningSpiritComponent } from './rs/detail/atmos-returning-spirit.component';
import { AtmosSpiritTreeViewerComponent } from './spirit-tree/viewer/atmos-spirit-tree-viewer.component';
import { AtmosSpiritTreeViewComponent } from './spirit-tree/view/atmos-spirit-tree-view.component';
import { AtmosWingedLightComponent } from './winged-light/atmos-winged-light.component';
import { AtmosChildrenOfLightComponent } from './col/atmos-children-of-light.component';
import { AtmosWingBuffsComponent } from './wing-buff/atmos-wing-buffs.component';
import { AtmosDailyComponent } from './daily/atmos-daily.component';
import { AtmosRealmsComponent } from './realm/atmos-realms.component';
import { AtmosRealmComponent } from './realm/detail/atmos-realm.component';
import { AtmosSharedCreationsComponent } from './realm/shared-creations/atmos-shared-creations.component';
import { AtmosPnrTrackerComponent } from './realm/pnr-tracker/atmos-pnr-tracker.component';
import { AtmosCrTrackerComponent, canDeactivateAtmosCrTracker } from './realm/cr-tracker/atmos-cr-tracker.component';
import { AtmosAreasComponent } from './area/atmos-areas.component';
import { AtmosAreaComponent } from './area/detail/atmos-area.component';
import { AtmosShopsComponent } from './shop/shops/atmos-shops.component';
import { AtmosShopCinemaComponent } from './shop/cinema/atmos-shop-cinema.component';
import { AtmosShopConcertHallComponent } from './shop/concert-hall/atmos-shop-concert-hall.component';
import { AtmosShopEventStoreComponent } from './shop/event/atmos-shop-event-store.component';
import { AtmosShopHarmonyHallComponent } from './shop/harmony/atmos-shop-harmony-hall.component';
import { AtmosShopNestingComponent } from './shop/nesting/atmos-shop-nesting.component';
import { AtmosShopOfficeComponent } from './shop/office/atmos-shop-office.component';
import { AtmosShopWonderlandComponent } from './shop/wonderland-cafe/atmos-shop-wonderland.component';
import { AtmosFriendsComponent } from './friend/atmos-friends.component';
import { AtmosToolsComponent } from './tool/atmos-tools.component';
import { AtmosClosetComponent } from './outfit-request/closet/atmos-closet.component';
import { AtmosCollageComponent } from './outfit-request/collage/atmos-collage.component';
import { AtmosOutfitVaultComponent } from './outfit-request/vault/atmos-outfit-vault.component';
import { AtmosClosetRequestComponent } from './outfit-request/request/atmos-closet-request.component';
import { AtmosNewsComponent } from './news/atmos-news.component';
import { AtmosInfoComponent } from './info/atmos-info.component';
import { AtmosDropboxAuthComponent } from './dropbox-auth/atmos-dropbox-auth.component';
import { AtmosNoDataComponent } from './no-data/atmos-no-data.component';

export const REDESIGN_ROUTES: Routes = [
  /* Routes without the atmospheric shell (chromeless). */
  { path: 'outfit-request/request', component: AtmosClosetRequestComponent, title: 'Outfit request' },
  { path: 'dropbox-auth', component: AtmosDropboxAuthComponent, title: 'Dropbox' },
  {
    path: '',
    component: AtmosphericShellComponent,
    children: [
      { path: '', component: AtmosphericDashboardComponent, title: 'Sky Planner' },
      { path: 'privacy', component: AtmosPrivacyComponent, title: 'Privacy Policy' },
      { path: 'settings', component: AtmosSettingsComponent, title: 'Settings' },
      { path: 'daily', component: AtmosDailyComponent, title: 'Daily' },
      { path: 'news', component: AtmosNewsComponent, title: `What's new` },
      { path: 'info', component: AtmosInfoComponent, title: 'Info' },
      { path: 'no-data', component: AtmosNoDataComponent, title: 'Data error' },
      {
        path: 'currency',
        children: [
          { path: '', component: AtmosCurrencyComponent, title: 'In-game currency' },
          { path: 'spent', component: AtmosCurrencySpentComponent, title: 'Spent currency' },
        ]
      },
      {
        path: 'season',
        children: [
          { path: '',          component: AtmosSeasonsComponent,         title: 'Seasons' },
          { path: 'optimizer', component: AtmosSeasonOptimizerComponent, title: 'Season optimizer' },
          { path: ':guid',     component: AtmosSeasonComponent,          title: 'Season' },
        ]
      },
      { path: 'season-calculator', component: AtmosSeasonCalculatorComponent, title: 'Season calculator' },
      { path: 'event-calculator', component: AtmosEventCalculatorComponent, title: 'Event calculator' },
      {
        path: 'event',
        children: [
          { path: '',        component: AtmosEventsComponent,       title: 'Events' },
          { path: 'history', component: AtmosEventHistoryComponent, title: 'Event history' },
          { path: ':guid',   component: AtmosEventComponent,        title: 'Event' },
        ]
      },
      {
        path: 'event-instance',
        children: [
          { path: ':guid', component: AtmosEventInstanceComponent, title: 'Event' },
        ]
      },
      {
        path: 'item',
        children: [
          { path: '', redirectTo: 'grid', pathMatch: 'full' },
          { path: 'grid',       component: AtmosItemGridComponent,       title: 'Items' },
          { path: 'table',      component: AtmosItemsComponent,          title: 'Item table' },
          { path: 'preview',    component: AtmosItemPreviewComponent,    title: 'Item previews' },
          { path: 'dye',        component: AtmosItemDyeComponent,        title: 'Dye previews' },
          { path: 'heart',      component: AtmosItemHeartsComponent,     title: 'Hearts' },
          { path: 'collection', component: AtmosItemCollectionComponent, title: 'Collections' },
          { path: 'field-guide', component: AtmosItemFieldGuideComponent, title: 'Field guide' },
          { path: 'inflation',  component: AtmosItemInflationComponent,  title: 'Item inflation' },
          { path: 'unlock',     component: AtmosItemUnlockComponent,     title: 'Quick unlock' },
          { path: 'unlock-calculator', component: AtmosItemUnlockCalculatorComponent, title: 'Cost calculator' },
          { path: ':guid',      component: AtmosItemDetailComponent,    title: 'Item' },
        ]
      },
      {
        path: 'spirit',
        children: [
          { path: '',        component: AtmosSpiritsComponent,        title: 'Spirits' },
          { path: 'elusive', component: AtmosElusiveSpiritsComponent, title: 'Elusive Spirits' },
          { path: ':guid',   component: AtmosSpiritComponent,         title: 'Spirit' },
        ]
      },
      { path: 'ts', component: AtmosTravelingSpiritsComponent, title: 'Traveling Spirits' },
      {
        path: 'rs',
        children: [
          { path: '',      component: AtmosReturningSpiritsComponent, title: 'Special Visits' },
          { path: ':guid', component: AtmosReturningSpiritComponent,  title: 'Special Visit' },
        ]
      },
      { path: 'winged-light', component: AtmosWingedLightComponent, title: 'Winged Light' },
      { path: 'col', component: AtmosChildrenOfLightComponent, title: 'Children of Light' },
      { path: 'wing-buff', component: AtmosWingBuffsComponent, title: 'Wing Buffs' },
      {
        path: 'realm',
        children: [
          { path: '',                 component: AtmosRealmsComponent,          title: 'Realms' },
          { path: 'shared-creations', component: AtmosSharedCreationsComponent, title: 'Shared Creations' },
          { path: 'pnr-tracker',      component: AtmosPnrTrackerComponent,      title: 'Eden Statue Tracker' },
          { path: 'cr-tracker',       component: AtmosCrTrackerComponent, canDeactivate: [canDeactivateAtmosCrTracker], title: 'Candle Run Tracker' },
          { path: ':guid',            component: AtmosRealmComponent,           title: 'Realm' },
        ]
      },
      {
        path: 'area',
        children: [
          { path: '',      component: AtmosAreasComponent, title: 'Areas' },
          { path: ':guid', component: AtmosAreaComponent,  title: 'Area' },
        ]
      },
      {
        path: 'shop',
        children: [
          { path: '',                component: AtmosShopsComponent,           title: 'Shops' },
          { path: 'cinema',          component: AtmosShopCinemaComponent,      title: 'Cinema' },
          { path: 'concert-hall',    component: AtmosShopConcertHallComponent, title: 'Concert Hall' },
          { path: 'event',           component: AtmosShopEventStoreComponent,  title: 'Aviary Event Store' },
          { path: 'harmony',         component: AtmosShopHarmonyHallComponent, title: 'Harmony Hall' },
          { path: 'nesting',         component: AtmosShopNestingComponent,     title: 'Nesting Workshop' },
          { path: 'office',          component: AtmosShopOfficeComponent,      title: 'Office' },
          { path: 'wonderland-cafe', component: AtmosShopWonderlandComponent,  title: 'Wonderland Cafe' },
        ]
      },
      { path: 'friend', component: AtmosFriendsComponent, title: 'Friends' },
      { path: 'tool', component: AtmosToolsComponent, title: 'Tools' },
      {
        path: 'outfit-request',
        children: [
          { path: 'closet',  component: AtmosClosetComponent,      title: 'Closet' },
          { path: 'collage', component: AtmosCollageComponent,     title: 'Collage' },
          { path: 'vault',   component: AtmosOutfitVaultComponent, title: 'Outfit vault' },
        ]
      },
      {
        path: 'spirit-tree',
        children: [
          { path: 'viewer', component: AtmosSpiritTreeViewerComponent, title: 'Spirit tree viewer' },
          { path: ':guid',  component: AtmosSpiritTreeViewComponent,   title: 'Spirit tree' },
        ]
      }
    ]
  }
];
