import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import L from 'leaflet';
import { IArea } from 'src/app/interfaces/area.interface';
import { IMapData } from 'src/app/interfaces/map-data.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { MapInstanceService } from 'src/app/services/map-instance.service';

@Component({
  selector: 'app-realm',
  templateUrl: './realm.component.html',
  styleUrls: ['./realm.component.less'],
  providers: [MapInstanceService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealmComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @ViewChild('divSpiritTrees', { static: false }) divSpiritTrees?: ElementRef;

  realm!: IRealm;

  highlightTree?: string;

  spirits: Array<ISpirit> = [];
  seasonSpiritCount = 0;

  map!: L.Map;
  hasAreaData = false;
  showAreas = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _mapInstanceService: MapInstanceService,
    private readonly _route: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  ngAfterViewInit(): void {
    this.map = this._mapInstanceService.attach(this.mapContainer.nativeElement);

    this.drawMap();
    this.panToRealm(true);
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
    this.map.flyTo(this.realm.mapData.position, this.realm.mapData.zoom ?? 1, opts);
  }

  mapToggleAreas(): void {
    this.showAreas = !this.showAreas;
    const layerGroup = this._mapInstanceService.getLayerGroup('area');
    this.showAreas ? layerGroup?.addTo(this.map) : layerGroup?.remove();
  }

  constellationSpiritClicked(spirit: ISpirit): void {
    this.highlightTree = spirit.tree?.guid;
    if (this.highlightTree && this.divSpiritTrees?.nativeElement) {
      // Scroll to trees
      this.divSpiritTrees.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Scroll to tree
      let tree = this.divSpiritTrees?.nativeElement.querySelector(`app-spirit-tree [data-tree="${spirit.tree?.guid}"]`) as HTMLElement;
      tree && tree.closest('.tree-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this._changeDetectorRef.markForCheck();
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

    this._changeDetectorRef.markForCheck();
  }

  private drawMap(): void {
    const mapData: IMapData = this.realm.mapData || {};

    const boundaryLayers = this._mapInstanceService.createLayerGroup('boundary');
    const areaLayers = this._mapInstanceService.createLayerGroup('area');
    areaLayers.remove();
    //const connectorLayer = this._mapInstanceService.createLayerGroup('connector');

    if (mapData.boundary) {
      const poly = L.polygon(mapData.boundary, { color: mapData.boundaryColor || '#0ff', weight: 1, fillOpacity: 0.05 });
      boundaryLayers.addLayer(poly);
    }

    const areaIcon = L.icon({
      iconUrl: 'assets/icons/symbols/location_on.svg',
      iconSize: [24, 24],
      popupAnchor: [0, -12],
    });

    this.realm?.areas?.forEach(area => {
      if (!area.mapData?.position) { return; }
      const marker = L.marker(area.mapData.position, { icon: areaIcon });
      marker.bindPopup(this.createAreaPopup(area), {});
      areaLayers.addLayer(marker);

      // Draw line to all other areas (testing display, need to configure connected areas in JSON).
      // this.realm?.areas?.forEach(otherArea => {
      //   if (area === otherArea || !otherArea.mapData?.position) { return; }
      //   const line = L.polyline([area.mapData!.position!, otherArea.mapData.position], { color: '#ff08', weight: 1 });
      //   connectorLayer.addLayer(line);
      // });
    });

    setTimeout(() => {
      this.hasAreaData = this.realm?.areas?.filter(a => a.mapData?.position).length! > 0;
      this._changeDetectorRef.markForCheck();
    }, 0);
  }

  private createAreaPopup(area: IArea): string {
    return area.name;
  }
}
