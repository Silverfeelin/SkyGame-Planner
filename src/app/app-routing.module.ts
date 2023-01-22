import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreditsComponent } from './components/credits/credits.component';
import { TravelingSpiritsComponent } from './components/traveling-spirits/traveling-spirits.component';

const routes: Routes = [
  { path: 'ts', component: TravelingSpiritsComponent },
  { path: 'credits', component: CreditsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
