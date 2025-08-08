import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, computed, ElementRef, inject, isDevMode, signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, CanDeactivateFn, Router, RouterLink } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { SettingService } from '@app/services/setting.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { parse as jsoncParse} from 'jsonc-parser';
import L from 'leaflet';
import { HostListener } from '@angular/core';
import { OverlayComponent } from "../layout/overlay/overlay.component";
import { disableKeyboardShortcutsUntilDestroyed } from '@app/services/event.service';

interface ICandlesData {
  items: Array<ICandleArea>;
}

interface ICandleArea {
  guid: string;
  name: string;
  imageUrl: string;
  imageSize: L.LatLngTuple;
  imageAttribution?: string;
  groups: Array<ICandleGroup>;
  connections: Array<ICandleAreaConnection>;
}

interface ICandleAreaConnection {
  guid: string;
  p: L.LatLngTuple;
}

interface ICandleGroup {
  name: string;
  poly?: L.LatLngTuple[];
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

export const canDeactivateCrTracker: CanDeactivateFn<CrTrackerComponent> = component => {
  if (!component.found.size) { return true; }
  return confirm('Are you sure you want to go to back to the Sky Planner? The website does not save your collected wax.');
};

@Component({
  selector: 'app-cr-tracker',
  imports: [
    NgbTooltip, MatIcon, RouterLink,
    OverlayComponent
],
  templateUrl: './cr-tracker.component.html',
  styleUrl: './cr-tracker.component.scss'
})
export class CrTrackerComponent implements AfterViewInit {
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.found.size || isDevMode()) { return; }
    event.preventDefault();
    event.returnValue = '';
  }

  @ViewChild('map', { static: true }) private mapDiv!: ElementRef<HTMLDivElement>;
  map: L.Map | undefined;
  layer = L.layerGroup();

  _navCurrentZoom = 0;

  http = inject(HttpClient);
  dataService = inject(DataService);
  settingService = inject(SettingService);

  isAreaOverlayVisible = signal(false);
  areaOverlayData = computed(() => {
    if (!this.isAreaOverlayVisible()) return [];
    const areas = this.data.items.map(area => ({
      area,
      found: area.groups.reduce((sum, group) => sum + group.candles.filter(candle => this.found.has(candle)).reduce((sum, candle) => sum + candle.c, 0), 0),
      total: area.groups.reduce((sum, group) => sum + group.candles.reduce((sum, candle) => sum + candle.c, 0), 0),
    }));
    return areas;
  });

  loading = 0;
  data!: ICandlesData;
  area!: ICandleArea;
  defaultArea!: ICandleArea;
  areaMap: { [guid: string]: ICandleArea } = {};
  candleMarkerMap = new Map<ICandle, L.Marker>();
  found = new Set<ICandle>();

  waxInArea = signal(0);
  waxInAreaFound = signal(0);

  router = inject(Router);
  route = inject(ActivatedRoute);

  constructor() {
    disableKeyboardShortcutsUntilDestroyed();
    this.http.get('/assets/data/candles.json', { responseType: 'text' }).subscribe((data: string) => {
      const parsed = jsoncParse(data);
      parsed.items.forEach((item: ICandleArea) => {
        this.areaMap[item.guid] = item;
      });

      this.data = parsed;
      this.area = parsed.items.at(2)!;
      this.defaultArea = parsed.items.at(0)!;
      this.loading++;
      this.initialize();

      // Change area based on query param.
      this.route.queryParamMap.subscribe(params => {
        const areaGuid = params.get('area');
        const area = areaGuid ? this.areaMap[areaGuid] : this.defaultArea;
        this.loadAreaMap(area);
      });

      if (!this.route.snapshot.queryParamMap.has('area')) {
        const url = new URL(window.location.href);
        url.searchParams.set('area', this.defaultArea.guid);
        history.replaceState(history.state, '', url.toString());
      }
    });
  }

  navigateToArea(area: ICandleArea): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { area: area.guid },
      queryParamsHandling: 'merge',
    });
  }

  promptRestart(): void {
    if (this.found.size > 0 && !confirm('Are you sure you want to restart? All progress will be lost.')) { return; }
    this.found.clear();
    this.waxInArea.set(0);
    this.waxInAreaFound.set(0);
    this.navigateToArea(this.defaultArea);
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
  }

  toggleCandle(candle: ICandle, found?: boolean): void {
    const marker = this.candleMarkerMap.get(candle);
    const hasCandle = this.found.has(candle);
    found ??= !this.found.has(candle);
    if (found) {
      this.found.add(candle);
      !hasCandle && this.waxInAreaFound.set(this.waxInAreaFound() + candle.c);
      marker?.setIcon(markerFoundIcon);
    } else {
      this.found.delete(candle);
      hasCandle && this.waxInAreaFound.set(this.waxInAreaFound() - candle.c);
      marker?.setIcon(markerIcon);

    }
  }

  loadAreaMap(area: ICandleArea): void {
    let waxInArea = { found: 0, total: 0 };
    this.area = area;
    this.layer.clearLayers();

    // Add image
    const bounds: L.LatLngBoundsExpression = [[0, 0], this.area.imageSize];
    L.imageOverlay(this.area.imageUrl, bounds, {
      attribution: this.area.imageAttribution || ''
    }).addTo(this.layer);
    // Set view to center of image
    const center: L.LatLngTuple = [this.area.imageSize[0] / 2, this.area.imageSize[1] / 2];
    this.map?.setView(center, -2);

    // Add markers
    this.area.groups.forEach(group => {
      group.candles.forEach((candle) => {
        waxInArea.total += candle.c;
        if (this.found.has(candle)) { waxInArea.found += candle.c; }

        const marker = L.marker(candle.p, {
          icon: this.found.has(candle) ? markerFoundIcon : markerIcon
        });
        marker.addTo(this.layer);
        this.candleMarkerMap.set(candle, marker);

        const tooltip = candle.description
          ? `${candle.c} wax<br/>${candle.description}`
          : `${candle.c} wax`;
        marker.bindTooltip(tooltip, { permanent: false, direction: 'top' });

        marker.addEventListener('click', () => {
          this.toggleCandle(candle);
        });
      });


      if (group.poly) {
        const polygon = L.polygon(group.poly, {
          color: 'orange',
          fillColor: 'orange',
          fillOpacity: 0.1,
          weight: 1
        });
        polygon.addTo(this.layer);

        // Calculate total wax in this group
        // const groupWaxTotal = group.candles.reduce((sum, candle) => sum + candle.c, 0);
        // polygon.bindTooltip(`${group.name}<br/>${groupWaxTotal} wax`, { permanent: true, direction: 'center' });

        const togglePos = group.poly[0];
        console.log(togglePos);
        const toggleAllMarker = L.marker(togglePos, {
          icon: L.divIcon({
            className: 'toggle-group-marker',
            html: `<button style="background:orange;border:none;border-radius:50%;font-size:12px;width:32px;height:32px;cursor:pointer;">✅</button>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            tooltipAnchor: [0, -16]
          }),
          interactive: true
        });
        toggleAllMarker.bindTooltip('Toggle all wax', { permanent: false, direction: 'top' });
        toggleAllMarker.addTo(this.layer);
        toggleAllMarker.on('click', () => {
          const found = group.candles.some(c => !this.found.has(c));
          group.candles.forEach(candle => {
            this.toggleCandle(candle, found);
          });
        });
      }
    });

    this.waxInArea.set(waxInArea.total);
    this.waxInAreaFound.set(waxInArea.found);

    // Add connections
    this.area.connections.forEach((connection) => {
      const marker = L.marker(connection.p, {
        icon: markerSwapIcon
      });
      marker.addTo(this.layer);
      const target = this.areaMap[connection.guid];
      marker.bindTooltip(target?.name, { permanent: false, direction: 'top' });
      marker.addEventListener('click', () => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { area: target?.guid },
          queryParamsHandling: 'merge'
        });
        // this.loadAreaMap(target);
      });
    });
  }

}
