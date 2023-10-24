import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import L from 'leaflet';
import { IMapData } from 'src/app/interfaces/map-data.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-realm',
  templateUrl: './realm.component.html',
  styleUrls: ['./realm.component.less']
})
export class RealmComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  realm!: IRealm;

  highlightTree?: string;

  spirits: Array<ISpirit> = [];
  seasonSpiritCount = 0;

  map!: L.Map;
  mapLayers?: L.LayerGroup;

  constructor(
    private readonly _dataService: DataService,
    private readonly _mapService: MapService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  ngAfterViewInit(): void {
    this.map = this._mapService.getMap();
    this._mapService.attach(this.mapContainer.nativeElement);

    this.drawMap();
    this.panToRealm(true);
  }

  ngOnDestroy(): void {
    this.mapLayers?.remove();
    this._mapService.detach();
  }

  onQueryChanged(params: ParamMap): void {
    this.highlightTree = params.get('highlightTree') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.initializeRealm(guid!);
  }

  panToRealm(instant = false): void {
    if (!this.realm?.mapData?.position) { return; }
    const opts = instant ? { animate: false, duration: 0 } : undefined;
    this.map.flyTo(this.realm.mapData.position, 3, opts);
  }

  private initializeRealm(guid: string): void {
    this.realm = this._dataService.guidMap.get(guid!) as IRealm;

    this.spirits = [];
    this.seasonSpiritCount = 0;

    this.realm?.areas?.forEach(area => {
      area.spirits?.forEach(spirit => {
        if (spirit.type === 'Regular' || spirit.type === 'Elder') {
          this.spirits.push(spirit);
        } else if (spirit.type === 'Season') {
          this.seasonSpiritCount++;
        }
      });
    });

    if (this.map) {
      this.drawMap();
      this.panToRealm(true);
    }
  }

  private drawMap(): void {
    const mapData: IMapData = this.realm.mapData || {};
    this.mapLayers?.remove();
    this.mapLayers = L.layerGroup().addTo(this.map);

    if (mapData.boundary) {
      const poly = L.polygon(mapData.boundary, { color: mapData.boundaryColor || '#0ff', weight: 1, fillOpacity: 0.05 });
      this.mapLayers.addLayer(poly);
    }
  }
}
