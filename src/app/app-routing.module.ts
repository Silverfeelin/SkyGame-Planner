import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  { path: '', redirectTo: 'realm', pathMatch: 'full' },
  { path: 'credits', component: CreditsComponent },
  { path: 'event', component: EventsComponent },
  { path: 'event/:guid', component: EventComponent },
  { path: 'event-instance/:guid', component: EventInstanceComponent },
  { path: 'item', component: ItemsComponent },
  { path: 'realm', component: RealmsComponent },
  { path: 'season', component: SeasonsComponent },
  { path: 'season/:guid', component: SeasonComponent },
  { path: 'shop', component: ShopsComponent },
  { path: 'spirit', component: SpiritsComponent },
  { path: 'spirit/:guid', component: SpiritComponent },
  { path: 'ts', component: TravelingSpiritsComponent },
  { path: 'editor', loadChildren: () => import('./editor/editor.module').then(m => m.EditorModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
