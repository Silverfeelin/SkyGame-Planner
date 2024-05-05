import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import L from 'leaflet';
import { IArea } from 'src/app/interfaces/area.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { DataService } from 'src/app/services/data.service';
import { MapInstanceService } from 'src/app/services/map-instance.service';
import { IMapInit } from 'src/app/services/map.service';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.less'],
  providers: [MapInstanceService]
})
export class RealmsComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer?: ElementRef<HTMLElement>;

  realms!: Array<IRealm>;
  visibleRealms!: Array<IRealm>;

  showMap = false;
  showAreas = false;
  showMapShrines = false;

  map!: L.Map;
  lastMapArea?: IArea;
  areaLayers = L.layerGroup();
  connectionLayers = L.layerGroup();
  mapShrineLayers = L.layerGroup();

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
    } else {
      this.showMap = localStorage.getItem('realms.map.folded') !== '1';
      this.showAreas = localStorage.getItem('realms.map.areas') === '1';
      this.showMapShrines = localStorage.getItem('realms.map.shrines') === '1';
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
    if (this.showAreas) {
      this.areaLayers?.addTo(this.map);
      this.connectionLayers?.addTo(this.map);
    }

    this.drawMapShrines();
    if (this.showMapShrines) {
      this.mapShrineLayers.addTo(this.map);
    }

    for (const realm of this.realms) {
      this._mapInstanceService.showRealm(realm, { showBoundary: true, showLabel: true, onClick: () => {
        // Don't navigate when areas are shown to prevent accidental navigation.
        if (this.showAreas) { return; }
        void this._router.navigateByUrl(`/realm/${realm.guid}`);
      }});
    }

    if (focusArea) {
      this.updateMapConnections(this._dataService.guidMap.get(focusArea) as IArea);
    }
  }

  beforeFoldMap(folded: boolean): void {
    this.showMap = !folded;
    localStorage.setItem('realms.map.folded', folded ? '1' : '0');
    this.updateMapUrl();
  }

  toggleShowAreas(): void {
    this.showAreas = !this.showAreas;
    localStorage.setItem('realms.map.areas', this.showAreas ? '1' : '0');

    if (this.showAreas) {
      this.areaLayers.addTo(this.map);
      this.connectionLayers.addTo(this.map);
    } else {
      this.areaLayers?.remove();
      this.connectionLayers?.remove();
    }

    this.updateMapUrl();
  }

  toggleShowMapShrines(): void {
    this.showMapShrines = !this.showMapShrines;
    localStorage.setItem('realms.map.shrines', this.showMapShrines ? '1' : '0');

    if (this.showMapShrines) {
      this.mapShrineLayers.addTo(this.map);
    } else {
      this.mapShrineLayers.remove();
    }

    this.updateMapUrl();
  }

  private updateMapUrl(): void {
    const url = new URL(location.href);
    let bit = 0;
    bit |= this.showMap ? 1 : 0;
    bit |= this.showAreas ? 2 : 0;
    bit |= this.showMapShrines ? 4 : 0;
    url.searchParams.set('map', `${bit}`);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  private drawAreas(): void {
    this._dataService.areaConfig.items.forEach(area => {
      if (!area.mapData?.position) { return; }
      this._mapInstanceService.createArea(area, {
        icon: 'location_on_orange',
        onClick: () => { this.updateMapConnections(area); }
      }).addTo(this.areaLayers!);
    });
  }

  private drawMapShrines(): void {
    this._dataService.mapShrineConfig.items.forEach(shrine => {
      if (!shrine.mapData?.position) { return; }
      this._mapInstanceService.createMapShrine(shrine, {
      }).addTo(this.mapShrineLayers!);
    });
  }

  private updateMapConnections(area?: IArea): void {
    if (!this.connectionLayers) { return; }
    this.connectionLayers.clearLayers();
    if (!area?.mapData?.position) { return; }

    const url = new URL(location.href);
    url.searchParams.set('area', area.guid);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);

    // Add yellow marker over the selected area.
    this._mapInstanceService.createArea(area, {
      icon: 'location_on_yellow',
      onClick: () => { this.updateMapConnections(undefined); }
    })?.addTo(this.connectionLayers!);

    // Draw areas connected to the selected area.
    area.connections?.forEach(connection => {
      if (!connection.area.mapData?.position) { return; }

      const line = L.polyline([area.mapData!.position!, connection.area.mapData.position], {color: '#fff', weight: 2  });
      line.addTo(this.connectionLayers!);
    });
  }
}
