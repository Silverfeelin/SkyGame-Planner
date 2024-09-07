import { Routes } from '@angular/router';
import { GraphSpiritsComponent } from './components/graph-spirits/graph-spirits.component';

const title = (title: string) => `${title} - Sky Planner`;

export const routes: Routes = [
  { path: 'spirit', component: GraphSpiritsComponent, title: title('Graphs - Spirits') }
];
