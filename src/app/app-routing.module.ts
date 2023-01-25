import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConstellationsComponent } from './components/constellations/constellations.component';
import { CreditsComponent } from './components/credits/credits.component';
import { ItemsComponent } from './components/items/items.component';
import { RealmsComponent } from './components/realms/realms.component';
import { SeasonsComponent } from './components/seasons/seasons.component';
import { TravelingSpiritsComponent } from './components/traveling-spirits/traveling-spirits.component';

const routes: Routes = [
  { path: 'constellation', component: ConstellationsComponent },
  { path: 'season', component: SeasonsComponent },
  { path: 'ts', component: TravelingSpiritsComponent },
  { path: 'item', component: ItemsComponent },
  { path: 'realm', component: RealmsComponent },
  { path: 'credits', component: CreditsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
