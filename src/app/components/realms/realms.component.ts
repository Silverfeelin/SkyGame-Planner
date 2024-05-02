import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import L from 'leaflet';
import { IArea } from 'src/app/interfaces/area.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { DataService } from 'src/app/services/data.service';
import { MapInstanceService } from 'src/app/services/map-instance.service';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.less'],
  providers: [MapInstanceService]
})
export class RealmsComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer?: ElementRef<HTMLElement>;

  showMap = false;
  realms!: Array<IRealm>;
  visibleRealms!: Array<IRealm>;
  map!: L.Map;

  showAreas = false;
  lastMapArea?: IArea;
  areaLayers?: L.LayerGroup;
  connectionLayers?: L.LayerGroup;

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
      this.showMap = _route.snapshot.queryParamMap.get('map') === '1';
    } else {
      this.showMap = localStorage.getItem('realms.map.folded') !== '1';
      this.updateMapUrl(!this.showMap);
    }
  }

  ngAfterViewInit(): void {
    // Initialize realm map.
    this.map = this._mapInstanceService.initialize(this.mapContainer!.nativeElement.querySelector('.map')!, { fromQuery: true });
    this._mapInstanceService.saveParamsToQueryOnMove();

    for (const realm of this.realms) {
      this._mapInstanceService.showRealm(realm, { showBoundary: true, showLabel: true, onClick: () => {
        // Don't navigate when areas are shown to prevent accidental navigation.
        if (this.showAreas) { return; }
        void this._router.navigateByUrl(`/realm/${realm.guid}`);
      }});
    }
  }

  beforeFoldMap(folded: boolean): void {
    localStorage.setItem('realms.map.folded', folded ? '1' : '0');
    this.updateMapUrl(folded);
  }

  toggleShowAreas(): void {
    this.showAreas = !this.showAreas;

    if (!this.areaLayers) { this.drawAreas(); }
    if (this.showAreas) {
      this.areaLayers?.addTo(this.map);
      this.connectionLayers?.addTo(this.map);
    } else {
      this.areaLayers?.remove();
      this.connectionLayers?.remove();
    }
  }

  private updateMapUrl(folded: boolean): void {
    const url = new URL(location.href);
    url.searchParams.set('map', folded ? '0' : '1');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  private drawAreas(): void {
    this.areaLayers = L.layerGroup();
    this.connectionLayers = L.layerGroup();

    this._dataService.areaConfig.items.forEach(area => {
      if (!area.mapData?.position) { return; }
      this._mapInstanceService.showArea(area, {
        icon: 'location_on_orange',
        onClick: () => { this.updateMapConnections(area); }
      })?.addTo(this.areaLayers!);
    });
  }

  private updateMapConnections(area?: IArea): void {
    if (!this.connectionLayers) { return; }
    this.connectionLayers.clearLayers();
    if (!area?.mapData?.position) { return; }


    // Add yellow marker over the selected area.
    this._mapInstanceService.showArea(area, {
      icon: 'location_on_yellow',
      onClick: () => { this.updateMapConnections(undefined); }
    })?.addTo(this.connectionLayers!);

    // Draw areas connected to the selected area.
    area.connections?.forEach(connection => {
      if (!connection.area.mapData?.position) { return; }

      const line = L.polyline([area.mapData!.position!, connection.area.mapData.position], {color: '#fff', weight: 1  });
      line.addTo(this.connectionLayers!);
    });
  }
}
