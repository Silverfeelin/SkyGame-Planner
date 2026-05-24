import { Routes } from '@angular/router';
import { AtmosphericShellComponent } from './shell/atmospheric-shell.component';
import { AtmosphericDashboardComponent } from './dashboard/atmospheric-dashboard.component';
import { AtmosPrivacyComponent } from './privacy/atmos-privacy.component';
import { AtmosItemsComponent } from './item/atmos-items.component';
import { AtmosItemGridComponent } from './item/grid/atmos-item-grid.component';
import { AtmosItemPreviewComponent } from './item/preview/atmos-item-preview.component';
import { AtmosItemDyeComponent } from './item/dye/atmos-item-dye.component';
import { AtmosItemHeartsComponent } from './item/heart/atmos-item-hearts.component';
import { AtmosItemCollectionComponent } from './item/collection/atmos-item-collection.component';

export const REDESIGN_ROUTES: Routes = [
  {
    path: '',
    component: AtmosphericShellComponent,
    children: [
      { path: '', component: AtmosphericDashboardComponent, title: 'Sky Planner' },
      { path: 'privacy', component: AtmosPrivacyComponent, title: 'Privacy Policy' },
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
        ]
      }
    ]
  }
];
