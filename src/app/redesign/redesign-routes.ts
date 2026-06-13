import { Routes } from '@angular/router';
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

const title = (t: string) => `${t} - Sky Planner`;

export const REDESIGN_ROUTES: Routes = [
  /* Chromeless routes — rendered without the atmos sidebar/footer. */
  { path: 'outfit-request/request', component: AtmosClosetRequestComponent, data: { chrome: false }, title: title('Outfit request') },
  { path: 'dropbox-auth', component: AtmosDropboxAuthComponent, data: { chrome: false }, title: title('Dropbox') },
  /* Routes rendered inside the atmos shell (chrome). */
  { path: '', component: AtmosphericDashboardComponent, title: 'Sky Planner' },
  { path: 'privacy', component: AtmosPrivacyComponent, title: title('Privacy Policy') },
  { path: 'settings', component: AtmosSettingsComponent, title: title('Settings') },
  { path: 'daily', component: AtmosDailyComponent, title: title('Daily') },
  { path: 'news', component: AtmosNewsComponent, title: title(`What's new`) },
  { path: 'info', component: AtmosInfoComponent, title: title('Info') },
  { path: 'no-data', component: AtmosNoDataComponent, title: title('Data error') },
  {
    path: 'currency',
    children: [
      { path: '', component: AtmosCurrencyComponent, title: title('In-game currency') },
      { path: 'spent', component: AtmosCurrencySpentComponent, title: title('Spent currency') },
    ]
  },
  {
    path: 'season',
    children: [
      { path: '',          component: AtmosSeasonsComponent,         title: title('Seasons') },
      { path: 'optimizer', component: AtmosSeasonOptimizerComponent, title: title('Season optimizer') },
      { path: ':guid',     component: AtmosSeasonComponent,          title: title('Season') },
    ]
  },
  { path: 'season-calculator', component: AtmosSeasonCalculatorComponent, title: title('Season calculator') },
  { path: 'event-calculator', component: AtmosEventCalculatorComponent, title: title('Event calculator') },
  {
    path: 'event',
    children: [
      { path: '',        component: AtmosEventsComponent,       title: title('Events') },
      { path: 'history', component: AtmosEventHistoryComponent, title: title('Event history') },
      { path: ':guid',   component: AtmosEventComponent,        title: title('Event') },
    ]
  },
  {
    path: 'event-instance',
    children: [
      { path: ':guid', component: AtmosEventInstanceComponent, title: title('Event') },
    ]
  },
  {
    path: 'item',
    children: [
      { path: '', redirectTo: 'grid', pathMatch: 'full' },
      { path: 'grid',       component: AtmosItemGridComponent,       title: title('Items') },
      { path: 'table',      component: AtmosItemsComponent,          title: title('Item table') },
      { path: 'preview',    component: AtmosItemPreviewComponent,    title: title('Item previews') },
      { path: 'dye',        component: AtmosItemDyeComponent,        title: title('Dye previews') },
      { path: 'heart',      component: AtmosItemHeartsComponent,     title: title('Hearts') },
      { path: 'collection', component: AtmosItemCollectionComponent, title: title('Collections') },
      { path: 'field-guide', component: AtmosItemFieldGuideComponent, title: title('Field guide') },
      { path: 'inflation',  component: AtmosItemInflationComponent,  title: title('Item inflation') },
      { path: 'unlock',     component: AtmosItemUnlockComponent,     title: title('Quick unlock') },
      { path: 'unlock-calculator', component: AtmosItemUnlockCalculatorComponent, title: title('Cost calculator') },
      { path: ':guid',      component: AtmosItemDetailComponent,    title: title('Item') },
    ]
  },
  {
    path: 'spirit',
    children: [
      { path: '',        component: AtmosSpiritsComponent,        title: title('Spirits') },
      { path: 'elusive', component: AtmosElusiveSpiritsComponent, title: title('Elusive Spirits') },
      { path: ':guid',   component: AtmosSpiritComponent,         title: title('Spirit') },
    ]
  },
  { path: 'ts', component: AtmosTravelingSpiritsComponent, title: title('Traveling Spirits') },
  {
    path: 'rs',
    children: [
      { path: '',      component: AtmosReturningSpiritsComponent, title: title('Special Visits') },
      { path: ':guid', component: AtmosReturningSpiritComponent,  title: title('Special Visit') },
    ]
  },
  { path: 'winged-light', component: AtmosWingedLightComponent, title: title('Winged Light') },
  { path: 'col', component: AtmosChildrenOfLightComponent, title: title('Children of Light') },
  { path: 'wing-buff', component: AtmosWingBuffsComponent, title: title('Wing Buffs') },
  {
    path: 'realm',
    children: [
      { path: '',                 component: AtmosRealmsComponent,          title: title('Realms') },
      { path: 'shared-creations', component: AtmosSharedCreationsComponent, title: title('Shared Creations') },
      { path: 'pnr-tracker',      component: AtmosPnrTrackerComponent,      title: title('Eden Statue Tracker') },
      { path: 'cr-tracker',       component: AtmosCrTrackerComponent, canDeactivate: [canDeactivateAtmosCrTracker], title: title('Candle Run Tracker') },
      { path: ':guid',            component: AtmosRealmComponent,           title: title('Realm') },
    ]
  },
  {
    path: 'area',
    children: [
      { path: '',      component: AtmosAreasComponent, title: title('Areas') },
      { path: ':guid', component: AtmosAreaComponent,  title: title('Area') },
    ]
  },
  {
    path: 'shop',
    children: [
      { path: '',                component: AtmosShopsComponent,           title: title('Shops') },
      { path: 'cinema',          component: AtmosShopCinemaComponent,      title: title('Cinema') },
      { path: 'concert-hall',    component: AtmosShopConcertHallComponent, title: title('Concert Hall') },
      { path: 'event',           component: AtmosShopEventStoreComponent,  title: title('Aviary Event Store') },
      { path: 'harmony',         component: AtmosShopHarmonyHallComponent, title: title('Harmony Hall') },
      { path: 'nesting',         component: AtmosShopNestingComponent,     title: title('Nesting Workshop') },
      { path: 'office',          component: AtmosShopOfficeComponent,      title: title('Office') },
      { path: 'wonderland-cafe', component: AtmosShopWonderlandComponent,  title: title('Wonderland Cafe') },
    ]
  },
  { path: 'friend', component: AtmosFriendsComponent, title: title('Friends') },
  { path: 'tool', component: AtmosToolsComponent, title: title('Tools') },
  {
    path: 'outfit-request',
    children: [
      { path: 'closet',  component: AtmosClosetComponent,      title: title('Closet') },
      { path: 'collage', component: AtmosCollageComponent,     title: title('Collage') },
      { path: 'vault',   component: AtmosOutfitVaultComponent, title: title('Outfit vault') },
    ]
  },
  {
    path: 'spirit-tree',
    children: [
      { path: 'viewer', component: AtmosSpiritTreeViewerComponent, title: title('Spirit tree viewer') },
      { path: ':guid',  component: AtmosSpiritTreeViewComponent,   title: title('Spirit tree') },
    ]
  },
  { path: 'graph', loadChildren: () => import('../sections/graphs/graphs-routes').then(m => m.routes), title: title('Graphs') },
];
