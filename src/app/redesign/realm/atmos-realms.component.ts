import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import L from 'leaflet';
import { DataService } from '@app/services/data.service';
import { MapInstanceService } from '@app/services/map-instance.service';
import { IMapInit } from '@app/services/map.service';
import { IArea, IRealm } from 'skygame-data';
import { AtmosRealmQuickActionsComponent } from './quick-actions/atmos-realm-quick-actions.component';

@Component({
  selector: 'app-atmos-realms',
  templateUrl: './atmos-realms.component.html',
  styleUrl: './atmos-realms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MapInstanceService],
  imports: [RouterLink, MatIcon, NgbTooltip, AtmosRealmQuickActionsComponent]
})
export class AtmosRealmsComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer?: ElementRef<HTMLElement>;

  readonly realms: ReadonlyArray<IRealm>;
  readonly visibleRealms: ReadonlyArray<IRealm>;

  readonly showMap = signal(false);
  readonly showAreas = signal(false);
  readonly showMapShrines = signal(false);
  readonly showWingedLight = signal(false);

  private _map?: L.Map;
  private _initialized = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _mapInstanceService: MapInstanceService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
    this.realms = _dataService.realmConfig.items;
    this.visibleRealms = this.realms.filter(r => !r.hidden);

    if (_route.snapshot.queryParamMap.has('map')) {
      const nMap = +_route.snapshot.queryParamMap.get('map')!;
      this.showMap.set(!!(nMap & 1));
      this.showAreas.set(!!(nMap & 2));
      this.showMapShrines.set(!!(nMap & 4));
      this.showWingedLight.set(!!(nMap & 8));
    } else {
      this.showMap.set(localStorage.getItem('realms.map.folded') === '0');
      this.showAreas.set(localStorage.getItem('realms.map.areas') === '1');
      this.showMapShrines.set(localStorage.getItem('realms.map.shrines') === '1');
      this.showWingedLight.set(localStorage.getItem('realms.map.wl') === '1');
      this.updateMapUrl();
    }
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  toggleShowMap(): void {
    const next = !this.showMap();
    this.showMap.set(next);
    localStorage.setItem('realms.map.folded', next ? '0' : '1');
    this.updateMapUrl();
    if (next) {
      // Map container becomes visible; fix view.
      setTimeout(() => {
        this._map?.invalidateSize();
        const params = this._mapInstanceService.loadParamsFromQuery();
        this._map?.setView(params.view!, params.zoom, { animate: false, duration: 0 });
      });
    }
  }

  toggleShowAreas(): void {
    const v = !this.showAreas();
    this.showAreas.set(v);
    localStorage.setItem('realms.map.areas', v ? '1' : '0');
    this._mapInstanceService.toggleAreas(v);
    this._mapInstanceService.toggleConnections(v);
    this.updateMapUrl();
  }

  toggleShowMapShrines(): void {
    const v = !this.showMapShrines();
    this.showMapShrines.set(v);
    localStorage.setItem('realms.map.shrines', v ? '1' : '0');
    this._mapInstanceService.toggleMapShrines(v);
    this.updateMapUrl();
  }

  toggleShowWingedLight(): void {
    const v = !this.showWingedLight();
    this.showWingedLight.set(v);
    localStorage.setItem('realms.map.wl', v ? '1' : '0');
    this._mapInstanceService.toggleWingedLights(v);
    this.updateMapUrl();
  }

  private updateMapUrl(): void {
    const url = new URL(location.href);
    let bit = 0;
    bit |= this.showMap() ? 1 : 0;
    bit |= this.showAreas() ? 2 : 0;
    bit |= this.showMapShrines() ? 4 : 0;
    bit |= this.showWingedLight() ? 8 : 0;
    url.searchParams.set('map', `${bit}`);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  private initializeMap(): void {
    if (this._initialized) { return; }
    this._initialized = true;

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

    const mapEl = this.mapContainer!.nativeElement.querySelector('.map') as HTMLElement;
    this._map = this._mapInstanceService.initialize(mapEl, mapInit);
    this._mapInstanceService.saveParamsToQueryOnMove();

    this.drawAreas();
    this._mapInstanceService.toggleAreas(this.showAreas());
    this._mapInstanceService.toggleConnections(this.showAreas());
    this.drawMapShrines();
    this._mapInstanceService.toggleMapShrines(this.showMapShrines());
    this.drawWingedLights();
    this._mapInstanceService.toggleWingedLights(this.showWingedLight());

    this.drawRealms();
    this._mapInstanceService.toggleRealms(true);

    if (focusArea) {
      this.updateMapConnections(this._dataService.guidMap.get(focusArea) as IArea);
    }

    // First-paint fix when map starts folded.
    queueMicrotask(() => this._map?.invalidateSize());
  }

  private drawRealms(): void {
    this.realms.forEach(realm => {
      this._mapInstanceService.addRealm(realm, { showLabel: true, onClick: () => {
        if (this.showAreas() || this.showMapShrines() || this.showWingedLight()) { return; }
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
