import { Routes } from '@angular/router';
import { DyeFarmDataComponentComponent } from './components/dye-farm-data-component/dye-farm-data-component.component';

const title = (title: string) => `${title} - Sky Planner`;

export const routes: Routes = [
  { path: 'dye', component: DyeFarmDataComponentComponent, title: title('Dye Farm Analysis') }
];
