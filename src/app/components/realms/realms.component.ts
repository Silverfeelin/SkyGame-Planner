import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import L from 'leaflet';
import { DataService } from 'src/app/services/data.service';
import { MapInstanceService } from 'src/app/services/map-instance.service';
import { IMapInit } from 'src/app/services/map.service';
import { NgFor, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CardComponent, CardFoldEvent } from '../layout/card/card.component';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { IRealm, IArea } from 'skygame-data';

@Component({
    selector: 'app-realms',
    templateUrl: './realms.component.html',
    styleUrls: ['./realms.component.less'],
    providers: [MapInstanceService],
    imports: [WikiLinkComponent, CardComponent, NgbTooltip, MatIcon, NgFor, NgIf, RouterLink]
})
export class RealmsComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer?: ElementRef<HTMLElement>;

  realms!: Array<IRealm>;
  visibleRealms!: Array<IRealm>;

  showMap = false;
  showAreas = false;
  showMapShrines = false;
  showWingedLight = false;

  map!: L.Map;
  lastMapArea?: IArea;

  constructor(
    private readonly _dataService: DataService,
    private readonly _mapInstanceService: MapInstanceService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
    this.realms = _dataService.realmConfig.items;
    this.visibleRealms = this.realms.filter(r => !r.hidden);

    // Check if the map should be folded or not.
    if (_route.snapshot.queryParamMap.has('map')) {
      const nMap = +_route.snapshot.queryParamMap.get('map')!;
      this.showMap = !!(nMap & 1);
      this.showAreas = !!(nMap & 2);
      this.showMapShrines = !!(nMap & 4);
      this.showWingedLight = !!(nMap & 8);
    } else {
      this.showMap = localStorage.getItem('realms.map.folded') === '0';
      this.showAreas = localStorage.getItem('realms.map.areas') === '1';
      this.showMapShrines = localStorage.getItem('realms.map.shrines') === '1';
      this.showWingedLight = localStorage.getItem('realms.map.wl') === '1';
      this.updateMapUrl();
    }
  }

  ngAfterViewInit(): void {
    // Set focus on area.
    const focusArea = this._route.snapshot.queryParamMap.get('area');
    let mapInit: IMapInit | undefined = undefined;
    if (focusArea) {
      const areaMapData = (this._dataService.guidMap.get(focusArea) as IArea)?.mapData;
      if (areaMapData) {
        mapInit = { view: areaMapData.position, zoom: areaMapData.zoom ?? 3 };
      }
    } else {
      mapInit = { fromQuery: true };
    }

    // Initialize realm map.
    this.map = this._mapInstanceService.initialize(this.mapContainer!.nativeElement.querySelector('.map')!, mapInit);
    this._mapInstanceService.saveParamsToQueryOnMove();

    this.drawAreas();
    this._mapInstanceService.toggleAreas(this.showAreas);
    this._mapInstanceService.toggleConnections(this.showAreas);
    this.drawMapShrines();
    this._mapInstanceService.toggleMapShrines(this.showMapShrines);
    this.drawWingedLights();
    this._mapInstanceService.toggleWingedLights(this.showWingedLight);

    this.drawRealms();
    this._mapInstanceService.toggleRealms(true);

    if (focusArea) {
      this.updateMapConnections(this._dataService.guidMap.get(focusArea) as IArea);
    }
  }

  beforeFoldMap(evt: CardFoldEvent): void {
    this.showMap = !evt.fold;
    localStorage.setItem('realms.map.folded', evt.fold ? '1' : '0');
    this.updateMapUrl();
  }

  toggleShowAreas(): void {
    this.showAreas = !this.showAreas;
    localStorage.setItem('realms.map.areas', this.showAreas ? '1' : '0');
    this._mapInstanceService.toggleAreas(this.showAreas);
    this._mapInstanceService.toggleConnections(this.showAreas);
    this.updateMapUrl();
  }

  toggleShowMapShrines(): void {
    this.showMapShrines = !this.showMapShrines;
    localStorage.setItem('realms.map.shrines', this.showMapShrines ? '1' : '0');
    this._mapInstanceService.toggleMapShrines(this.showMapShrines);
    this.updateMapUrl();
  }

  toggleShowWingedLight(): void {
    this.showWingedLight = !this.showWingedLight;
    localStorage.setItem('realms.map.wl', this.showWingedLight ? '1' : '0');
    this._mapInstanceService.toggleWingedLights(this.showWingedLight);
    this.updateMapUrl();
  }

  private updateMapUrl(): void {
    const url = new URL(location.href);
    let bit = 0;
    bit |= this.showMap ? 1 : 0;
    bit |= this.showAreas ? 2 : 0;
    bit |= this.showMapShrines ? 4 : 0;
    bit |= this.showWingedLight ? 8 : 0;
    url.searchParams.set('map', `${bit}`);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  private drawRealms(): void {
    this.realms.forEach(realm => {
      this._mapInstanceService.addRealm(realm, { showLabel: true, onClick: () => {
        // Don't navigate when areas are shown to prevent accidental navigation.
        if (this.showAreas || this.showMapShrines || this.showWingedLight) { return; }
        void this._router.navigateByUrl(`/realm/${realm.guid}`);
      }});
    });
  }

  private drawAreas(): void {
    this._dataService.areaConfig.items.forEach(area => {
      this._mapInstanceService.addArea(area, {
        icon: '/assets/icons/symbols/location_on_orange.svg',
        onClick: () => { this.updateMapConnections(area); }
      });
    });
  }

  private drawMapShrines(): void {
    this._dataService.mapShrineConfig.items.forEach(shrine => {
      this._mapInstanceService.addMapShrine(shrine, {});
    });
  }

  private drawWingedLights(): void {
    this._dataService.wingedLightConfig.items.forEach(wingedLight => {
      if (wingedLight.area?.realm?.name === 'Void') { return; }
      this._mapInstanceService.addWingedLight(wingedLight, {});
    });
  }

  private updateMapConnections(area?: IArea): void {
    this._mapInstanceService.clearConnections();
    this._mapInstanceService.addAreaConnections(area, {});

    const url = new URL(location.href);
    area ? url.searchParams.set('area', area.guid) : url.searchParams.delete('area');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }
}
