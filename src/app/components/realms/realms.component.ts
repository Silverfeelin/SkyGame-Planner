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

    // Check if the map should be folded or not.
    if (_route.snapshot.queryParamMap.has('map')) {
      this.showMap = _route.snapshot.queryParamMap.get('map') === '1';
    } else {
      this.showMap = localStorage.getItem('realm.map.folded') !== '1';
      this.updateMapUrl(!this.showMap);
    }
  }

  ngAfterViewInit(): void {
    // Initialize realm map.
    this._mapInstanceService.initialize(this.mapContainer!.nativeElement.querySelector('.map')!, { fromQuery: true });
    this._mapInstanceService.saveParamsToQueryOnMove();

    for (const realm of this.realms) {
      this._mapInstanceService.showRealm(realm, { showBoundary: true, showLabel: true, onClick: () => {
        void this._router.navigateByUrl(`/realm/${realm.guid}`);
      }});
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
}
