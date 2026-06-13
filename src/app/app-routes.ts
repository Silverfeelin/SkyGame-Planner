import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { AtmosNoDataComponent } from './redesign/no-data/atmos-no-data.component';
import { AtmosDropboxAuthComponent } from './redesign/dropbox-auth/atmos-dropbox-auth.component';
import { AtmosStorageComponent } from './redesign/storage/atmos-storage.component';
import { REDESIGN_ROUTES } from './redesign/redesign-routes';
import { EditorLayoutComponent } from './editor/editor-layout/editor-layout.component';

const title = (t: string) => `${t} - Sky Planner`;

export const routes: Routes = [
  { path: 'spirits', redirectTo: 'spirit' },
  { path: 'tools', redirectTo: 'tool' },
  { path: 'friends', redirectTo: 'friend' },
  { path: 'credits', redirectTo: 'info' },
  { path: 'blank', redirectTo: '' },
  { path: 'no-data', component: AtmosNoDataComponent },
  { path: 'storage', component: AtmosStorageComponent },
  { path: 'dropbox-auth', component: AtmosDropboxAuthComponent, title: title('Dropbox') },
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
      /* Editor — atmos editor layout (no atmos chrome). */
      {
        path: 'editor',
        component: EditorLayoutComponent,
        data: { chrome: false },
        loadChildren: () => import('./editor/editor-routes').then(m => m.routes),
      },
      /* Redesign atmospheric shell — default for all /-rooted pages. */
      ...REDESIGN_ROUTES,
    ]
  }
];
