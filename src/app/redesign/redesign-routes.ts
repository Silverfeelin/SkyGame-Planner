import { Routes } from '@angular/router';
import { AtmosphericShellComponent } from './shell/atmospheric-shell.component';
import { AtmosphericDashboardComponent } from './dashboard/atmospheric-dashboard.component';
import { AtmosPrivacyComponent } from './privacy/atmos-privacy.component';
import { AtmosItemsComponent } from './item/atmos-items.component';
import { AtmosItemGridComponent } from './item/grid/atmos-item-grid.component';

export const REDESIGN_ROUTES: Routes = [
  {
    path: '',
    component: AtmosphericShellComponent,
    children: [
      { path: '', component: AtmosphericDashboardComponent, title: 'Sky Planner' },
      { path: 'privacy', component: AtmosPrivacyComponent, title: 'Privacy Policy' },
      { path: 'item', component: AtmosItemGridComponent, title: 'Items' },
      { path: 'item-table', component: AtmosItemsComponent, title: 'Item table' }
    ]
  }
];
