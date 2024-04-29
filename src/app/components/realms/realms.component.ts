import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import L from 'leaflet';
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

  _layers: Array<L.Layer> = [];

  constructor(
    private readonly _dataService: DataService,
    private readonly _mapInstanceService: MapInstanceService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
    this.realms = _dataService.realmConfig.items;
    this.visibleRealms = this.realms.filter(r => !r.hidden);

    if (_route.snapshot.queryParamMap.has('map')) {
      this.showMap = _route.snapshot.queryParamMap.get('map') === '1';
    } else {
      this.showMap = localStorage.getItem('realm.map.folded') !== '1';
      this.updateMapUrl(!this.showMap);
    }

    this._mapInstanceService.on('moveend', () => { this.onMoveEnd(); });
  }

  ngAfterViewInit(): void {
    this.map = this._mapInstanceService.attach(this.mapContainer!.nativeElement);

    // Load position from query params.
    const queryParams = this._route.snapshot.queryParamMap;
    const x = +(queryParams.get('x') || 0);
    const y = +(queryParams.get('y') || 0);
    const z = queryParams.has('z') ? +(queryParams.get('z') || 0) : undefined;
    if (z !== undefined) {
      this.map.setView([y, x], z, { animate: false, duration: 0});
    } else {
      this.map.setView([-270, 270], 1, { animate: false, duration: 0});
    }

    const showCoords = false && document.cookie.split(';').find(c => c.includes('mapcopy='))?.split('=')[1] !== undefined;
    const layer = this._mapInstanceService.createLayerGroup('realms', true);
    for (const realm of this.realms) {
      const mapData = realm.mapData;
      if (!mapData) { continue; }

      if (mapData.boundary) {
        const poly = L.polygon(mapData.boundary, { color: mapData.boundaryColor || '#ff8a00', weight: 1, fillOpacity: 0.06 });
        poly.addTo(layer);
        poly.addEventListener('click', evt => {
          evt.originalEvent.stopPropagation();
          void this._router.navigateByUrl(`/realm/${realm.guid}`);
        });

        const className = `realm-map-label realm-map-label-${mapData.boundaryLabelAlign || 'center'}`;
        const label = L.marker(mapData.boundary[0], {
          icon: L.divIcon({
            className,
            html: `<span>${realm.name}</span>`
          })
        });
        label.addTo(layer);

        if (showCoords) {
          mapData.boundary.forEach((p, i) => {
            const marker = L.marker(p, { icon: L.divIcon({ className: 'realm-coord-label', html: `[${p[0]},${p[1]}]` }) });
            marker.addTo(layer);
          });
        }
      }
    }
  }

  beforeFoldMap(folded: boolean): void {
    localStorage.setItem('realm.map.folded', folded ? '1' : '0');
    this.updateMapUrl(folded);
  }

  private updateMapUrl(folded: boolean): void {
    const url = new URL(location.href);
    url.searchParams.set('map', folded ? '0' : '1');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }


  private onMoveEnd(): void {
    const url = new URL(location.href);
    const c = this.map?.getCenter();
    if (!c) { return; }
    url.searchParams.set('x', `${Math.floor(c.lng)}`);
    url.searchParams.set('y', `${Math.floor(c.lat)}`);
    url.searchParams.set('z', `${this.map.getZoom()}`);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }
}
