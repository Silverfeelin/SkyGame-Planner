import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreditsComponent } from './components/credits/credits.component';
import { EventsComponent } from './components/events/events.component';
import { ItemsComponent } from './components/items/items.component';
import { RealmsComponent } from './components/realms/realms.component';
import { SeasonsComponent } from './components/seasons/seasons.component';
import { SpiritsComponent } from './components/spirits/spirits.component';
import { TravelingSpiritsComponent } from './components/traveling-spirits/traveling-spirits.component';

const routes: Routes = [
  { path: 'season', component: SeasonsComponent },
  { path: 'ts', component: TravelingSpiritsComponent },
  { path: 'spirit', component: SpiritsComponent },
  { path: 'event', component: EventsComponent },
  { path: 'item', component: ItemsComponent },
  { path: 'realm', component: RealmsComponent },
  { path: 'credits', component: CreditsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
