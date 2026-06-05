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

export const REDESIGN_ROUTES: Routes = [
  {
    path: '',
    component: AtmosphericShellComponent,
    children: [
      { path: '', component: AtmosphericDashboardComponent, title: 'Sky Planner' },
      { path: 'privacy', component: AtmosPrivacyComponent, title: 'Privacy Policy' },
      { path: 'settings', component: AtmosSettingsComponent, title: 'Settings' },
      {
        path: 'currency',
        children: [
          { path: '', component: AtmosCurrencyComponent, title: 'In-game currency' },
          { path: 'spent', component: AtmosCurrencySpentComponent, title: 'Spent currency' },
        ]
      },
      { path: 'season-calculator', component: AtmosSeasonCalculatorComponent, title: 'Season calculator' },
      { path: 'event-calculator', component: AtmosEventCalculatorComponent, title: 'Event calculator' },
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
        path: 'spirit-tree',
        children: [
          { path: 'viewer', component: AtmosSpiritTreeViewerComponent, title: 'Spirit tree viewer' },
          { path: ':guid',  component: AtmosSpiritTreeViewComponent,   title: 'Spirit tree' },
        ]
      }
    ]
  }
];
