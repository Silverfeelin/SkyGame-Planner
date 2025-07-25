import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { SettingService } from '@app/services/setting.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import L from 'leaflet';

interface ICandlesData {
  items: Array<ICandleArea>;
}

interface ICandleArea {
  guid: string;
  name: string;
  imageUrl: string;
  groups: Array<ICandleGroup>;
  connections: Array<ICandleAreaConnection>;
}

interface ICandleAreaConnection {
  guid: string;
  p: L.LatLngTuple;
}

interface ICandleGroup {
  name: string;
  candles: Array<ICandle>;
}

interface ICandle {
  p: L.LatLngTuple;
  c: number;
  description?: string;
}

const markerIcon = L.icon({
  iconUrl: 'assets/icons/symbols/location_on_orange.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -12],
  tooltipAnchor: [0, -28]
});

const markerFoundIcon = L.icon({
  iconUrl: 'assets/icons/symbols/location_on_green.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -12],
  tooltipAnchor: [0, -28]
});

const markerSwapIcon = L.icon({
  iconUrl: 'assets/icons/symbols/arrow_top_right.svg',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -14],
  tooltipAnchor: [0, -14]
});

@Component({
  selector: 'app-cr-tracker',
  imports: [
    NgbTooltip, MatIcon
  ],
  templateUrl: './cr-tracker.component.html',
  styleUrl: './cr-tracker.component.scss'
})
export class CrTrackerComponent implements AfterViewInit {
  @ViewChild('map', { static: true }) private mapDiv!: ElementRef<HTMLDivElement>;
  map: L.Map | undefined;
  layer = L.layerGroup();

  _navCurrentZoom = 0;

  http = inject(HttpClient);
  dataService = inject(DataService);
  settingService = inject(SettingService);

  loading = 0;
  data!: ICandlesData;
  area!: ICandleArea;
  defaultArea!: ICandleArea;
  areaMap: { [guid: string]: ICandleArea } = {};
  found = new Set<any>();
  waxInArea = signal(0);

  constructor() {
    this.http.get<ICandlesData>('/assets/data/candles.json').subscribe((data: ICandlesData) => {
      data.items.forEach((item) => {
        this.areaMap[item.guid] = item;
      });

      this.data = data;
      this.area = data.items.at(2)!;
      this.defaultArea = data.items.at(0)!;
      this.loading++;
      this.initialize();
    });
  }

  ngAfterViewInit(): void {
    this.loading++;
    this.initialize();
  }

  initialize(): void {
    if (this.loading !== 2) { return; }

    const div = this.mapDiv?.nativeElement;
    this.map = L.map(div, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 1
    });
    this.map.attributionControl.setPrefix('');
    this.map.doubleClickZoom.disable();

    this.map.on('zoomend', () => {
      this._navCurrentZoom = this.map?.getZoom() ?? 0;
    });

    if (this.settingService.debugVisible) {
      this.map.on('click', (e) => {
        navigator.clipboard.writeText(`[${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}]`);
      });
    }

    // Add zoom controls.
    this.map.zoomControl?.remove();
    const zoom = L.control.zoom({ position: 'bottomright' });
    zoom.addTo(this.map);

    this.map.addLayer(this.layer);
    this.loadAreaMap(this.area);
  }

  loadAreaMap(area: ICandleArea): void {
    this.waxInArea.set(0);
    this.area = area;
    this.layer.clearLayers();

    // Add image
    const bounds: L.LatLngBoundsExpression = [[0, 0], [3508, 2480]];
    L.imageOverlay(this.area?.imageUrl, bounds, {
      attribution: 'Map by @sky_solsuga'
    }).addTo(this.layer);
    // Set view to center of image
    const center: L.LatLngTuple = [3508 / 2, 2480 / 2];
    this.map?.setView(center, -1);

    // Add markers
    this.area.groups.forEach(group => {
      group.candles.forEach((candle) => {
        this.waxInArea.update(c => c + candle.c);
        const marker = L.marker(candle.p, {
          icon: this.found.has(candle) ? markerFoundIcon : markerIcon
        });
        marker.addTo(this.layer);

        const tooltip = candle.description
          ? `${candle.c} wax<br/>${candle.description}`
          : `${candle.c} wax`;
        marker.bindTooltip(tooltip, { permanent: true, direction: 'top' });

        marker.addEventListener('click', () => {
          this.found.has(candle) ? marker.setIcon(markerFoundIcon) : marker.setIcon(markerIcon);
          this.found.has(candle) ? this.found.delete(candle) : this.found.add(candle);
        });
      });
    });

    // Add connections
    this.area.connections.forEach((connection) => {
      const marker = L.marker(connection.p, {
        icon: markerSwapIcon
      });
      marker.addTo(this.layer);
      const target = this.areaMap[connection.guid];
      marker.bindTooltip(target?.name, { permanent: true, direction: 'top' });
      marker.addEventListener('click', () => {
        this.loadAreaMap(target);
      });
    });
  }

}
