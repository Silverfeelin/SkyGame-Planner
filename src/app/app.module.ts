import { NgModule, isDevMode } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SpiritTreeComponent } from './components/spirit-tree/spirit-tree.component';
import { NodeComponent } from './components/node/node.component';
import { ItemIconComponent } from './components/items/item-icon/item-icon.component';
import { MenuComponent } from './components/menu/menu.component';
import { SeasonsComponent } from './components/seasons/seasons.component';
import { TravelingSpiritsComponent } from './components/traveling-spirits/traveling-spirits.component';
import { RealmsComponent } from './components/realms/realms.component';
import { IconComponent } from './components/icon/icon.component';
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
import { DateTimePipe } from './pipes/date-time.pipe';
import { RealmComponent } from './components/realms/realm/realm.component';
import { ItemTypePipe } from './pipes/item-type.pipe';
import { ReturningSpiritsComponent } from './components/returning-spirits/returning-spirits.component';
import { ReturningSpiritComponent } from './components/returning-spirit/returning-spirit.component';
import { SpiritTypeIconComponent } from './components/spirit-type-icon/spirit-type-icon.component';
import { SpiritsOverviewComponent } from './components/spirits-overview/spirits-overview.component';
import { DaysLeftComponent } from './components/util/days-left/days-left.component';
import { CostComponent } from './components/util/cost/cost.component';
import { DurationComponent } from './components/util/duration/duration.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SeasonCardComponent } from './components/season-card/season-card.component';
import { EventCardComponent } from './components/event-card/event-card.component';
import { SpiritCardComponent } from './components/spirit-card/spirit-card.component';
import { BlankComponent } from './components/blank/blank.component';
import { ClockComponent } from './components/clock/clock.component';
import { ItemSubIconsComponent } from './components/items/item-icon/item-subicons/item-subicons.component';
import { WikiLinkComponent } from './components/util/wiki-link/wiki-link.component';
import { WingedLightComponent } from './components/winged-light/winged-light.component';
import { ChildrenOfLightComponent } from './components/children-of-light/children-of-light.component';
import { CollageComponent } from './components/outfit-request/collage/collage.component';
import { ClosetComponent } from './components/outfit-request/closet/closet.component';
import { ItemTypeSelectorComponent } from './components/items/item-type-selector/item-type-selector.component';
import { ToolsComponent } from './components/tools/tools.component';
import { IconPickerComponent } from './components/util/icon-picker/icon-picker.component';
import { FirefoxClipboardItemComponent } from './components/util/firefox-clipboard-item/firefox-clipboard-item.component';
import { ItemFieldGuideComponent } from './components/items/item-field-guide/item-field-guide.component';
import { ItemUnlockComponent } from './components/items/item-unlock/item-unlock.component';
import { DateComponent } from './components/util/date/date.component';
import { DashboardWishlistComponent } from './components/dashboard/dashboard-wishlist/dashboard-wishlist.component';
import { ItemComponent } from './components/items/item/item.component';
import { ReturningSpiritCardComponent } from './components/returning-spirit-card/returning-spirit-card.component';
import { RealmConstellationComponent } from './components/realms/realm-constellation/realm-constellation.component';
import { PercentagePipe } from './pipes/percentage.pipe';
import { ClampPipe } from './pipes/clamp.pipe';
import { SpiritTypePipe } from './pipes/spirit-type.pipe';
import { CardComponent } from './components/layout/card/card.component';
import { ItemListComponent } from './components/item-list/item-list/item-list.component';
import { ItemListNodeComponent } from './components/item-list/item-list-node/item-list-node.component';
import { SeasonCalculatorComponent } from './components/season/season-calculator/season-calculator.component';
import { EventCalculatorComponent } from './components/event/event-calculator/event-calculator.component';
import { DropboxAuthComponent } from './components/dropbox/dropbox-auth/dropbox-auth.component';
import { MenuLayoutComponent } from './components/layout/menu-layout/menu-layout.component';
import { StorageComponent } from './components/storage/storage.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { NoDataComponent } from './components/layout/no-data/no-data.component';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    DateTimePipe,
    ItemTypePipe,
    PercentagePipe,
    ClampPipe,
    SpiritTypePipe,
    SpiritTreeComponent,
    NodeComponent,
    ItemIconComponent,
    MenuComponent,
    SeasonsComponent,
    TravelingSpiritsComponent,
    RealmsComponent,
    IconComponent,
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
    ReturningSpiritComponent,
    SpiritTypeIconComponent,
    SpiritsOverviewComponent,
    DaysLeftComponent,
    CostComponent,
    DurationComponent,
    DashboardComponent,
    SeasonCardComponent,
    EventCardComponent,
    SpiritCardComponent,
    BlankComponent,
    ClockComponent,
    ItemSubIconsComponent,
    WikiLinkComponent,
    WingedLightComponent,
    ChildrenOfLightComponent,
    CollageComponent,
    ClosetComponent,
    ItemTypeSelectorComponent,
    ToolsComponent,
    IconPickerComponent,
    FirefoxClipboardItemComponent,
    ItemFieldGuideComponent,
    ItemUnlockComponent,
    DateComponent,
    DashboardWishlistComponent,
    ItemComponent,
    ReturningSpiritCardComponent,
    RealmConstellationComponent,
    CardComponent,
    ItemListComponent,
    ItemListNodeComponent,
    SeasonCalculatorComponent,
    EventCalculatorComponent,
    DropboxAuthComponent,
    MenuLayoutComponent,
    StorageComponent,
    MainLayoutComponent,
    NoDataComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    LayoutModule,
    MatIconModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  exports: [
    ItemIconComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
