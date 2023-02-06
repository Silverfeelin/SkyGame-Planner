import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreditsComponent } from './components/credits/credits.component';
import { EventsComponent } from './components/events/events.component';
import { ItemsComponent } from './components/items/items.component';
import { RealmsComponent } from './components/realms/realms.component';
import { SeasonComponent } from './components/season/season.component';
import { SeasonsComponent } from './components/seasons/seasons.component';
import { SpiritComponent } from './components/spirit/spirit.component';
import { SpiritsComponent } from './components/spirits/spirits.component';
import { TravelingSpiritsComponent } from './components/traveling-spirits/traveling-spirits.component';

const routes: Routes = [
  { path: 'credits', component: CreditsComponent },
  { path: 'event', component: EventsComponent },
  { path: 'item', component: ItemsComponent },
  { path: 'realm', component: RealmsComponent },
  { path: 'season', component: SeasonsComponent },
  { path: 'season/:guid', component: SeasonComponent },
  { path: 'spirit', component: SpiritsComponent },
  { path: 'spirit/:guid', component: SpiritComponent },
  { path: 'ts', component: TravelingSpiritsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
