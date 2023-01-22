import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConstellationComponent } from './components/constellation/constellation.component';
import { NodeComponent } from './components/node/node.component';
import { ItemComponent } from './components/item/item.component';
import { MenuComponent } from './components/menu/menu.component';
import { SeasonsComponent } from './components/seasons/seasons.component';
import { TravelingSpiritsComponent } from './components/traveling-spirits/traveling-spirits.component';
import { RealmsComponent } from './components/realms/realms.component';
import { IconComponent } from './components/icon/icon.component';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { CreditsComponent } from './components/credits/credits.component';

@NgModule({
  declarations: [
    AppComponent,
    ConstellationComponent,
    NodeComponent,
    ItemComponent,
    MenuComponent,
    SeasonsComponent,
    TravelingSpiritsComponent,
    RealmsComponent,
    IconComponent,
    StatusBarComponent,
    CreditsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
