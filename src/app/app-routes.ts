import { Routes } from '@angular/router';
import { CreditsComponent } from './components/credits/credits.component';
import { EventInstanceComponent } from './components/event-instance/event-instance.component';
import { EventComponent } from './components/event/event.component';
import { EventsComponent } from './components/events/events.component';
import { ItemsComponent } from './components/items/items.component';
import { RealmsComponent } from './components/realms/realms.component';
import { SeasonComponent } from './components/season/season.component';
import { SeasonsComponent } from './components/seasons/seasons.component';
import { SpiritComponent } from './components/spirit/spirit.component';
import { SpiritsComponent } from './components/spirits/spirits.component';
import { TravelingSpiritsComponent } from './components/traveling-spirits/traveling-spirits.component';
import { ShopsComponent } from './components/shops/shops.component';
import { WingBuffsComponent } from './components/wing-buffs/wing-buffs.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RealmComponent } from './components/realms/realm/realm.component';
import { ReturningSpiritsComponent } from './components/returning-spirits/returning-spirits.component';
import { ReturningSpiritComponent } from './components/returning-spirit/returning-spirit.component';
import { SpiritsOverviewComponent } from './components/spirits-overview/spirits-overview.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BlankComponent } from './components/blank/blank.component';
import { WingedLightComponent } from './components/winged-light/winged-light.component';
import { ChildrenOfLightComponent } from './components/children-of-light/children-of-light.component';
import { CollageComponent } from './components/outfit-request/collage/collage.component';
import { ClosetComponent } from './components/outfit-request/closet/closet.component';
import { ToolsComponent } from './components/tools/tools.component';
import { ItemFieldGuideComponent } from './components/items/item-field-guide/item-field-guide.component';
import { ItemUnlockComponent } from './components/items/item-unlock/item-unlock.component';
import { ItemComponent } from './components/items/item/item.component';
import { ItemInflationComponent } from './components/items/item-inflation/item-inflation.component';
import { SeasonCalculatorComponent } from './components/season/season-calculator/season-calculator.component';
import { EventCalculatorComponent } from './components/event/event-calculator/event-calculator.component';
import { DropboxAuthComponent } from './components/dropbox/dropbox-auth/dropbox-auth.component';
import { MenuLayoutComponent } from './components/layout/menu-layout/menu-layout.component';
import { StorageComponent } from './components/storage/storage.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { NoDataComponent } from './components/layout/no-data/no-data.component';
import { OutfitVaultComponent } from './components/outfit-request/outfit-vault/outfit-vault.component';
import { AreaComponent } from './components/areas/area/area.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { ElusiveSpiritsComponent } from './components/spirits/elusive-spirits/elusive-spirits.component';
import { SpiritTreeViewComponent } from './components/spirit-tree-view/spirit-tree-view.component';
import { ShopNestingComponent } from './components/shops/shop-nesting/shop-nesting.component';
import { ShopHarmonyHallComponent } from './components/shops/shop-harmony-hall/shop-harmony-hall.component';
import { ShopEventStoreComponent } from './components/shops/shop-event-store/shop-event-store.component';
import { ShopOfficeComponent } from './components/shops/shop-office/shop-office.component';
import { CurrencyComponent } from './components/currency/currency.component';
import { CurrencySpentComponent } from './components/currency/currency-spent/currency-spent.component';
import { ShopConcertHallComponent } from './components/shops/shop-concert-hall/shop-concert-hall.component';
import { ItemUnlockCalculatorComponent } from './components/items/item-unlock-calculator/item-unlock-calculator.component';
import { ItemsOverviewComponent } from './components/items/items-overview/items-overview.component';
import { ItemCollectionComponent } from './components/items/item-collection/item-collection.component';

const title = (title: string) => `${title} - Sky Planner`;

export const routes: Routes = [
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
      /* Routes with menu. */
      {
        path: '',
        component: MenuLayoutComponent,
        children: [
          { path: '', component: DashboardComponent, title: 'Sky Planner' },
          { path: 'blank', component: BlankComponent, title: 'Sky Planner' },
          { path: 'privacy', component: PrivacyComponent },
          { path: 'credits', component: CreditsComponent, title: title('Credits') },
          { path: 'currency', component: CurrencyComponent, title: title('In-game currency') },
          { path: 'currency/spent', component: CurrencySpentComponent, title: title('Spent currency') },
          { path: 'event', component: EventsComponent, title: title('Events') },
          { path: 'event-calculator', component: EventCalculatorComponent, title: title('Event Calculator') },
          { path: 'event/:guid', component: EventComponent },
          { path: 'event-instance/:guid', component: EventInstanceComponent },
          { path: 'item', component: ItemsOverviewComponent, title: title('Items') },
          { path: 'item/collection', component: ItemCollectionComponent, title: title('Item collections') },
          { path: 'item/field-guide', component: ItemFieldGuideComponent, title: title('Field guide') },
          { path: 'item/inflation', loadComponent: () => import('./components/items/item-inflation/item-inflation.component').then(m => m.ItemInflationComponent), title: title('Item inflation') },
          { path: 'item/unlock', component: ItemUnlockComponent, title: title('Items') },
          { path: 'item/unlock-calculator', component: ItemUnlockCalculatorComponent, title: title('Item unlock calculator') },
          { path: 'item/:guid', component: ItemComponent },
          { path: 'realm', component: RealmsComponent, title: title('Realms') },
          { path: 'realm/:guid', component: RealmComponent },
          { path: 'area/:guid', component: AreaComponent },
          { path: 'season', component: SeasonsComponent, title: title('Seasons') },
          { path: 'season/:guid', component: SeasonComponent },
          { path: 'season-calculator', component: SeasonCalculatorComponent, title: title('Season Calculator') },
          { path: 'settings', component: SettingsComponent, title: title('Settings') },
          { path: 'shop', component: ShopsComponent, title: title('Shops') },
          { path: 'shop/event', component: ShopEventStoreComponent, title: title('Aviary Event Store') },
          { path: 'shop/concert-hall', component: ShopConcertHallComponent, title: title('Concert Hall') },
          { path: 'shop/harmony', component: ShopHarmonyHallComponent, title: title('Harmony Hall') },
          { path: 'shop/nesting', component: ShopNestingComponent, title: title('Nesting Workshop') },
          { path: 'shop/office', component: ShopOfficeComponent, title: title('Office') },
          { path: 'spirits', component: SpiritsOverviewComponent, title: title('Spirits') },
          { path: 'spirit', component: SpiritsComponent, title: title('Spirits') },
          { path: 'spirit/elusive', component: ElusiveSpiritsComponent, title: title('Elusive Spirits') },
          { path: 'spirit/:guid', component: SpiritComponent },
          { path: 'spirit-tree/:guid', component: SpiritTreeViewComponent, title: title('Spirit Tree') },
          { path: 'ts', component: TravelingSpiritsComponent, title: title('Traveling Spirits') },
          { path: 'rs', component: ReturningSpiritsComponent, title: title('Special Visits') },
          { path: 'rs/:guid', component: ReturningSpiritComponent },
          { path: 'winged-light', component: WingedLightComponent, title: title('Winged Light') },
          { path: 'wing-buff', component: WingBuffsComponent, title: title('Wing Buffs') },
          { path: 'col', component: ChildrenOfLightComponent, title: title('Children of Light') },
          { path: 'tools', component: ToolsComponent, title: title('Tools') },
          { path: 'outfit-request/collage', component: CollageComponent, title: title('Collage') },
          { path: 'outfit-request/closet', component: ClosetComponent, title: title('Closet') },
          { path: 'outfit-request/vault', component: OutfitVaultComponent, title: title('Outfit vault') },
          { path: 'editor', loadChildren: () => import('./editor/editor-routes').then(m => m.routes) },
          { path: 'graph', loadChildren: () => import('./sections/graphs/graphs-routes').then(m => m.routes) }
        ]
      },
      /* Routes without menu. */
      { path: 'outfit-request/request', component: ClosetComponent, title: title('Outfit request') }
    ]
  }
];
