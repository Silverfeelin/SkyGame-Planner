import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { NoDataComponent } from './components/no-data/no-data.component';
import { DropboxAuthComponent } from './components/dropbox-auth/dropbox-auth.component';
import { StorageComponent } from './components/storage/storage.component';
import { EditorLayoutComponent } from './editor/editor-layout/editor-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ItemsComponent } from './components/item/items.component';
import { ItemGridComponent } from './components/item/grid/item-grid.component';
import { ItemPreviewComponent } from './components/item/preview/item-preview.component';
import { ItemDyeComponent } from './components/item/dye/item-dye.component';
import { ItemHeartsComponent } from './components/item/heart/item-hearts.component';
import { ItemCollectionComponent } from './components/item/collection/item-collection.component';
import { ItemDetailComponent } from './components/item/detail/item-detail.component';
import { ItemInflationComponent } from './components/item/inflation/item-inflation.component';
import { ItemUnlockComponent } from './components/item/unlock/item-unlock.component';
import { ItemUnlockCalculatorComponent } from './components/item/unlock-calculator/item-unlock-calculator.component';
import { CurrencyComponent } from './components/currency/currency.component';
import { CurrencySpentComponent } from './components/currency/spent/currency-spent.component';
import { SeasonCalculatorComponent } from './components/season/calculator/season-calculator.component';
import { SeasonsComponent } from './components/season/seasons/seasons.component';
import { SeasonComponent } from './components/season/detail/season.component';
import { SeasonOptimizerComponent } from './components/season/optimizer/season-optimizer.component';
import { EventsComponent } from './components/event/events/events.component';
import { EventComponent } from './components/event/detail/event.component';
import { EventHistoryComponent } from './components/event/history/event-history.component';
import { EventInstanceComponent } from './components/event/instance/event-instance.component';
import { EventCalculatorComponent } from './components/event/calculator/event-calculator.component';
import { SpiritsComponent } from './components/spirit/spirits/spirits.component';
import { ElusiveSpiritsComponent } from './components/spirit/elusive/elusive-spirits.component';
import { SpiritComponent } from './components/spirit/detail/spirit.component';
import { TravelingSpiritsComponent } from './components/ts/traveling-spirits.component';
import { ReturningSpiritsComponent } from './components/rs/returning-spirits.component';
import { ReturningSpiritComponent } from './components/rs/detail/returning-spirit.component';
import { SpiritTreeViewComponent } from './components/spirit-tree/view/spirit-tree-view.component';
import { WingedLightComponent } from './components/winged-light/winged-light.component';
import { ChildrenOfLightComponent } from './components/col/children-of-light.component';
import { WingBuffsComponent } from './components/wing-buff/wing-buffs.component';
import { DailyComponent } from './components/daily/daily.component';
import { RealmsComponent } from './components/realm/realms.component';
import { RealmComponent } from './components/realm/detail/realm.component';
import { SharedCreationsComponent } from './components/realm/shared-creations/shared-creations.component';
import { PnrTrackerComponent } from './components/realm/pnr-tracker/pnr-tracker.component';
import { CrTrackerComponent, canDeactivateCrTracker } from './components/realm/cr-tracker/cr-tracker.component';
import { AreasComponent } from './components/area/areas.component';
import { AreaComponent } from './components/area/detail/area.component';
import { ShopsComponent } from './components/shop/shops/shops.component';
import { ShopCinemaComponent } from './components/shop/cinema/shop-cinema.component';
import { ShopConcertHallComponent } from './components/shop/concert-hall/shop-concert-hall.component';
import { ShopEventStoreComponent } from './components/shop/event/shop-event-store.component';
import { ShopHarmonyHallComponent } from './components/shop/harmony/shop-harmony-hall.component';
import { ShopNestingComponent } from './components/shop/nesting/shop-nesting.component';
import { ShopOfficeComponent } from './components/shop/office/shop-office.component';
import { ShopPrairieHeightsComponent } from './components/shop/prairie-heights/shop-prairie-heights.component';
import { ShopWonderlandComponent } from './components/shop/wonderland-cafe/shop-wonderland.component';
import { FriendsComponent } from './components/friend/friends.component';
import { ToolsComponent } from './components/tool/tools.component';
import { ClosetComponent } from './components/outfit-request/closet/closet.component';
import { CollageComponent } from './components/outfit-request/collage/collage.component';
import { OutfitVaultComponent } from './components/outfit-request/vault/outfit-vault.component';
import { ClosetRequestComponent } from './components/outfit-request/request/closet-request.component';
import { NewsComponent } from './components/news/news.component';
import { InfoComponent } from './components/info/info.component';

const title = (t: string) => `${t} - Sky Planner`;

export const routes: Routes = [
  { path: 'spirits', redirectTo: 'spirit' },
  { path: 'tools', redirectTo: 'tool' },
  { path: 'friends', redirectTo: 'friend' },
  { path: 'credits', redirectTo: 'info' },
  { path: 'blank', redirectTo: '' },
  { path: 'no-data', component: NoDataComponent },
  { path: 'storage', component: StorageComponent },
  { path: 'dropbox-auth', component: DropboxAuthComponent, title: title('Dropbox') },
  /* Routes that require data. */
  {
    path: '',
    component: MainLayoutComponent,
    // These guards prevent MainLayout from being created even if they're placed in the route subtree.
    // Workaround: placed these guards in the MainLayout code.
    // canActivate: [canActivateData],
    // canActivateChild: [canActivateStorageFn],
    children: [
      /* Legacy redirects — kept here so they resolve inside the data gate. */
      { path: 'pnr-tracker', redirectTo: 'realm/pnr-tracker' },
      { path: 'cr-tracker', redirectTo: 'realm/cr-tracker' },
      { path: 'spirit-tree/editor', redirectTo: 'editor/spirit-tree' },
      { path: 'season/migration-optimizer', redirectTo: 'season/optimizer' },
      /* Editor. */
      {
        path: 'editor',
        component: EditorLayoutComponent,
        loadChildren: () => import('./editor/editor-routes').then(m => m.routes),
      },
      /* Chromeless routes — rendered without the sidebar/footer. */
      { path: 'outfit-request/request', component: ClosetRequestComponent, data: { chrome: false }, title: title('Outfit request') },
      { path: 'dropbox-auth', component: DropboxAuthComponent, data: { chrome: false }, title: title('Dropbox') },
      /* Routes rendered with the full chrome. */
      { path: '', component: DashboardComponent, title: 'Sky Planner' },
      { path: 'privacy', component: PrivacyComponent, title: title('Privacy Policy') },
      { path: 'settings', component: SettingsComponent, title: title('Settings') },
      { path: 'daily', component: DailyComponent, title: title('Daily') },
      { path: 'news', component: NewsComponent, title: title(`What's new`) },
      { path: 'info', component: InfoComponent, title: title('Info') },
      { path: 'no-data', component: NoDataComponent, title: title('Data error') },
      {
        path: 'currency',
        children: [
          { path: '', component: CurrencyComponent, title: title('In-game currency') },
          { path: 'spent', component: CurrencySpentComponent, title: title('Spent currency') },
        ]
      },
      {
        path: 'season',
        children: [
          { path: '',           component: SeasonsComponent,          title: title('Seasons') },
          { path: 'optimizer',  component: SeasonOptimizerComponent,  title: title('Season optimizer') },
          { path: 'calculator', component: SeasonCalculatorComponent, title: title('Season calculator') },
          { path: ':guid',      component: SeasonComponent,           title: title('Season') },
        ]
      },
      {
        path: 'event',
        children: [
          { path: '',           component: EventsComponent,          title: title('Events') },
          { path: 'history',    component: EventHistoryComponent,    title: title('Event history') },
          { path: 'calculator', component: EventCalculatorComponent, title: title('Event calculator') },
          { path: ':guid',      component: EventComponent,           title: title('Event') },
        ]
      },
      /* Legacy top-level calculator paths. */
      { path: 'season-calculator', redirectTo: 'season/calculator', pathMatch: 'full' },
      { path: 'event-calculator', redirectTo: 'event/calculator', pathMatch: 'full' },
      {
        path: 'event-instance',
        children: [
          { path: ':guid', component: EventInstanceComponent, title: title('Event') },
        ]
      },
      {
        path: 'item',
        children: [
          { path: '', redirectTo: 'grid', pathMatch: 'full' },
          { path: 'grid',       component: ItemGridComponent,       title: title('Items') },
          { path: 'table',      component: ItemsComponent,          title: title('Item table') },
          { path: 'preview',    component: ItemPreviewComponent,    title: title('Item previews') },
          { path: 'dye',        component: ItemDyeComponent,        title: title('Dye previews') },
          { path: 'heart',      component: ItemHeartsComponent,     title: title('Hearts') },
          { path: 'collection', component: ItemCollectionComponent, title: title('Collections') },
          /* Legacy path: the field guide was replaced by the item previews page. */
          { path: 'field-guide', redirectTo: 'preview', pathMatch: 'full' },
          { path: 'inflation',  component: ItemInflationComponent,  title: title('Item inflation') },
          { path: 'unlock',     component: ItemUnlockComponent,     title: title('Quick unlock') },
          { path: 'unlock-calculator', component: ItemUnlockCalculatorComponent, title: title('Cost calculator') },
          { path: ':guid',      component: ItemDetailComponent,    title: title('Item') },
        ]
      },
      {
        path: 'spirit',
        children: [
          { path: '',        component: SpiritsComponent,        title: title('Spirits') },
          { path: 'elusive', component: ElusiveSpiritsComponent, title: title('Elusive Spirits') },
          { path: ':guid',   component: SpiritComponent,         title: title('Spirit') },
        ]
      },
      { path: 'ts', component: TravelingSpiritsComponent, title: title('Traveling Spirits') },
      {
        path: 'rs',
        children: [
          { path: '',      component: ReturningSpiritsComponent, title: title('Special Visits') },
          { path: ':guid', component: ReturningSpiritComponent,  title: title('Special Visit') },
        ]
      },
      { path: 'winged-light', component: WingedLightComponent, title: title('Winged Light') },
      { path: 'col', component: ChildrenOfLightComponent, title: title('Children of Light') },
      { path: 'wing-buff', component: WingBuffsComponent, title: title('Wing Buffs') },
      {
        path: 'realm',
        children: [
          { path: '',                 component: RealmsComponent,          title: title('Realms') },
          { path: 'shared-creations', component: SharedCreationsComponent, title: title('Shared Creations') },
          { path: 'pnr-tracker',      component: PnrTrackerComponent,      title: title('Eden Statue Tracker') },
          { path: 'cr-tracker',       component: CrTrackerComponent, canDeactivate: [canDeactivateCrTracker], title: title('Candle Run Tracker') },
          { path: ':guid',            component: RealmComponent,           title: title('Realm') },
        ]
      },
      {
        path: 'area',
        children: [
          { path: '',      component: AreasComponent, title: title('Areas') },
          { path: ':guid', component: AreaComponent,  title: title('Area') },
        ]
      },
      {
        path: 'shop',
        children: [
          { path: '',                component: ShopsComponent,           title: title('Shops') },
          { path: 'cinema',          component: ShopCinemaComponent,      title: title('Cinema') },
          { path: 'concert-hall',    component: ShopConcertHallComponent, title: title('Concert Hall') },
          { path: 'event',           component: ShopEventStoreComponent,  title: title('Aviary Event Store') },
          { path: 'harmony',         component: ShopHarmonyHallComponent, title: title('Harmony Hall') },
          { path: 'nesting',         component: ShopNestingComponent,     title: title('Nesting Workshop') },
          { path: 'office',          component: ShopOfficeComponent,      title: title('Office') },
          { path: 'prairieheights',  component: ShopPrairieHeightsComponent, title: title('Prairie Heights') },
          { path: 'wonderland-cafe', component: ShopWonderlandComponent,  title: title('Wonderland Cafe') },
        ]
      },
      { path: 'friend', component: FriendsComponent, title: title('Friends') },
      { path: 'tool', component: ToolsComponent, title: title('Tools') },
      {
        path: 'outfit-request',
        children: [
          { path: 'closet',  component: ClosetComponent,      title: title('Closet') },
          { path: 'collage', component: CollageComponent,     title: title('Collage') },
          { path: 'vault',   component: OutfitVaultComponent, title: title('Outfit vault') },
        ]
      },
      {
        path: 'spirit-tree',
        children: [
          { path: ':guid',  component: SpiritTreeViewComponent,   title: title('Spirit tree') },
        ]
      },
      { path: 'graph', loadChildren: () => import('./sections/graphs/graphs-routes').then(m => m.routes), title: title('Graphs') },
    ]
  }
];
