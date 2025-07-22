import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IArea } from '@app/interfaces/area.interface';
import { DataService } from '@app/services/data.service';
import { SettingService } from '@app/services/setting.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import L from 'leaflet';

interface ICandlesData {
  items: Array<ICandleArea>;
}

interface ICandleArea {
  area: IArea;
  imageUrl: string;
  candles: Array<ICandle>;
  connections: Array<ICandleAreaConnection>;
}

interface ICandleAreaConnection {
  area: IArea;
  p: L.LatLngTuple;
}

interface ICandle {
  p: L.LatLngTuple;
  c: number;
}

const markerIcon = L.icon({
  iconUrl: 'assets/icons/symbols/location_on_orange.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -12],
});

const markerFoundIcon = L.icon({
  iconUrl: 'assets/icons/symbols/location_on_green.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -12],
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

  _navCurrentZoom = 0;

  http = inject(HttpClient);
  dataService = inject(DataService);
  settingService = inject(SettingService);

  loading = 0;
  data!: ICandlesData;
  area!: ICandleArea;
  found = new Set<any>();

  constructor() {
    this.http.get<ICandlesData>('/assets/data/candles.json').subscribe((data: ICandlesData) => {
      data.items.forEach((item) => {
        const area = this.dataService.guidMap.get(item.area as unknown as string) as IArea;
        if (!area) { return; }
        item.area = area;

        item.connections.forEach((connection) => {
          const target = this.dataService.guidMap.get(connection.area as unknown as string) as IArea;
          if (!target) { return; }
          connection.area = target;
        });
      });

      this.data = data;
      this.area = data.items.at(0)!;
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

    // Add image
    const bounds: L.LatLngBoundsExpression = [[0, 0], [3508, 2480]];
    L.imageOverlay(this.area?.imageUrl, bounds, {
      attribution: 'Map by @sky_solsuga'
    }).addTo(this.map);
    this.map.setView([1750, 620], 0);

    // Add markers
    this.area.candles.forEach((candle) => {
      const marker = L.marker(candle.p, {
        icon: this.found.has(candle) ? markerFoundIcon : markerIcon
      });
      marker.addTo(this.map!);

      marker.addEventListener('click', () => {
        this.found.has(candle) ? marker.setIcon(markerFoundIcon) : marker.setIcon(markerIcon);
        this.found.has(candle) ? this.found.delete(candle) : this.found.add(candle);
      });
    });

    // Add connections
    this.area.connections.forEach((connection) => {
      const marker = L.marker(connection.p, {
        icon: markerSwapIcon
      });
      marker.addTo(this.map!);
      marker.bindTooltip(connection.area.name, { permanent: false, direction: 'top' });
    });
  }

  loadAreaMap(area: ICandleArea): void {
  }

}
