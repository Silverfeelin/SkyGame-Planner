import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SpiritTreeComponent } from './components/spirit-tree/spirit-tree.component';
import { NodeComponent } from './components/node/node.component';
import { ItemComponent } from './components/item/item.component';
import { MenuComponent } from './components/menu/menu.component';
import { SeasonsComponent } from './components/seasons/seasons.component';
import { TravelingSpiritsComponent } from './components/traveling-spirits/traveling-spirits.component';
import { RealmsComponent } from './components/realms/realms.component';
import { IconComponent } from './components/icon/icon.component';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { CreditsComponent } from './components/credits/credits.component';
import { ItemsComponent } from './components/items/items.component';
import { TableComponent } from './components/table/table.component';
import { TableColumnDirective } from './components/table/table-column/table-column.directive';
import { EventsComponent } from './components/events/events.component';
import { SpiritsComponent } from './components/spirits/spirits.component';
import { TableHeaderDirective } from './components/table/table-column/table-header.directive';
import { TableFooterDirective } from './components/table/table-column/table-footer.directive';
import { SpiritComponent } from './components/spirit/spirit.component';
import { SeasonComponent } from './components/season/season.component';
import { EventComponent } from './components/event/event.component';
import { EventInstanceComponent } from './components/event-instance/event-instance.component';
import { ShopsComponent } from './components/shops/shops.component';
import { WingBuffsComponent } from './components/wing-buffs/wing-buffs.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SearchComponent } from './components/search/search.component';
import { DayjsPipe } from './pipes/dayjs.pipe';
import { RealmComponent } from './components/realm/realm.component';
import { ItemTypePipe } from './pipes/item-type.pipe';
import { ReturningSpiritsComponent } from './components/returning-spirits/returning-spirits.component';
import { ReturningSpiritComponent } from './components/returning-spirit/returning-spirit.component';

@NgModule({
  declarations: [
    AppComponent,
    DayjsPipe,
    ItemTypePipe,
    SpiritTreeComponent,
    NodeComponent,
    ItemComponent,
    MenuComponent,
    SeasonsComponent,
    TravelingSpiritsComponent,
    RealmsComponent,
    IconComponent,
    StatusBarComponent,
    CreditsComponent,
    ItemsComponent,
    TableComponent,
    TableColumnDirective,
    TableHeaderDirective,
    TableFooterDirective,
    EventsComponent,
    SpiritsComponent,
    SpiritComponent,
    SeasonComponent,
    EventComponent,
    EventInstanceComponent,
    ShopsComponent,
    WingBuffsComponent,
    SettingsComponent,
    SearchComponent,
    RealmComponent,
    ReturningSpiritsComponent,
    ReturningSpiritComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    LayoutModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
