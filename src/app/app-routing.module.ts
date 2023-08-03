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
import { WingBuffsComponent } from './components/wing-buffs/wing-buffs.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SearchComponent } from './components/search/search.component';
import { RealmComponent } from './components/realm/realm.component';

const title = (title: string) => `${title} - Sky Planner`;

const routes: Routes = [
  { path: '', redirectTo: 'item', pathMatch: 'full' },
  { path: 'credits', component: CreditsComponent, title: title('Credits') },
  { path: 'event', component: EventsComponent, title: title('Events') },
  { path: 'event/:guid', component: EventComponent, title: title('Event') },
  { path: 'event-instance/:guid', component: EventInstanceComponent, title: title('Event') },
  { path: 'item', component: ItemsComponent, title: title('Items') },
  { path: 'realm', component: RealmsComponent, title: title('Realms') },
  { path: 'realm/:guid', component: RealmComponent, title: title('Realm') },
  { path: 'search', component: SearchComponent, title: title('Search') },
  { path: 'season', component: SeasonsComponent, title: title('Seasons') },
  { path: 'season/:guid', component: SeasonComponent, title: title('Season') },
  { path: 'settings', component: SettingsComponent, title: title('Settings') },
  { path: 'shop', component: ShopsComponent, title: title('Shops') },
  { path: 'spirit', component: SpiritsComponent, title: title('Spirits') },
  { path: 'spirit/:guid', component: SpiritComponent, title: title('Spirit') },
  { path: 'ts', component: TravelingSpiritsComponent, title: title('Traveling Spirits') },
  { path: 'wing-buffs', component: WingBuffsComponent, title: title('Wing Buffs') },
  { path: 'editor', loadChildren: () => import('./editor/editor.module').then(m => m.EditorModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
