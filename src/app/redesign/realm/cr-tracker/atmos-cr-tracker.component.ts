import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject, isDevMode, signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, CanDeactivateFn, Router } from '@angular/router';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { parse as jsoncParse } from 'jsonc-parser';
import L from 'leaflet';
import { DateHelper } from '@app/helpers/date-helper';
import { DataService } from '@app/services/data.service';
import { disableKeyboardShortcutsUntilDestroyed } from '@app/services/event.service';
import { SettingService } from '@app/services/setting.service';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';
import { environment } from 'src/environments/environment';

interface ICandlesData { items: Array<ICandleArea>; }
interface ICandleArea {
  guid: string;
  name: string;
  imageUrl: string;
  imageSize: L.LatLngTuple;
  imageAttribution?: string;
  groups: Array<ICandleGroup>;
  connections: Array<ICandleAreaConnection>;
}
interface ICandleAreaConnection { guid: string; p: L.LatLngTuple; }
interface ICandleGroup { name: string; poly?: L.LatLngTuple[]; candles: Array<ICandle>; }
interface ICandle {
  p: L.LatLngTuple;
  c: number;
  description?: string;
  /** Bitfield of weekdays, Monday = 1. */
  weekday?: number;
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

export const canDeactivateAtmosCrTracker: CanDeactivateFn<AtmosCrTrackerComponent> = component => {
  if (!component.found.size) { return true; }
  return confirm('Are you sure you want to go to back to the Sky Planner? The website does not save your collected wax.');
};

@Component({
  selector: 'app-atmos-cr-tracker',
  templateUrl: './atmos-cr-tracker.component.html',
  styleUrl: './atmos-cr-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, MatIcon, OverlayComponent]
})
export class AtmosCrTrackerComponent implements AfterViewInit {
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.found.size || isDevMode()) { return; }
    event.preventDefault();
    event.returnValue = '';
  }

  @ViewChild('map', { static: true }) private mapDiv!: ElementRef<HTMLDivElement>;

  map: L.Map | undefined;
  layer = L.layerGroup();

  readonly http = inject(HttpClient);
  readonly dataService = inject(DataService);
  readonly settingService = inject(SettingService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  readonly isAreaOverlayVisible = signal(false);
  readonly areaOverlayData = computed(() => {
    const total = { found: 0, total: 0 };
    if (!this.isAreaOverlayVisible()) { return { areas: [], total }; }

    const areas = this.data.items.map(area => {
      const data = {
        area,
        found: area.groups.reduce((sum, group) => sum + group.candles.filter(candle => this.found.has(candle)).reduce((s, candle) => s + candle.c, 0), 0),
        total: area.groups.reduce((sum, group) => sum + group.candles.reduce((s, candle) => s + candle.c, 0), 0),
      };
      total.found += data.found;
      total.total += data.total;
      return data;
    });
    return { areas, total };
  });

  loading = 0;
  data!: ICandlesData;
  area!: ICandleArea;
  defaultArea!: ICandleArea;
  areaMap: { [guid: string]: ICandleArea } = {};
  candleMarkerMap = new Map<ICandle, L.Marker>();
  found = new Set<ICandle>();
  weekday = 1 << (DateHelper.todaySky().weekday - 1);

  readonly waxInArea = signal(0);
  readonly waxInAreaFound = signal(0);

  private _navCurrentZoom = 0;

  constructor() {
    disableKeyboardShortcutsUntilDestroyed();
    this.http.get(environment.urls.candles, { responseType: 'text' }).subscribe((data: string) => {
      const parsed = jsoncParse(data);
      this.data = parsed;

      this.data.items.forEach((area: ICandleArea) => {
        this.areaMap[area.guid] = area;
        area.groups.forEach((group: ICandleGroup) => {
          group.candles = group.candles.filter((candle: ICandle) => {
            return !(candle.weekday && (candle.weekday & this.weekday) === 0);
          });
        });
      });

      this.defaultArea = this.data.items.at(0)!;
      this.area = this.defaultArea;
      this.loading++;
      this.initialize();

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

  ngAfterViewInit(): void {
    this.loading++;
    this.initialize();
  }

  navigateToArea(area: ICandleArea): void {
    if (this.area === area) { this.loadAreaMap(area); return; }
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

  initialize(): void {
    if (this.loading !== 2) { return; }

    const div = this.mapDiv?.nativeElement;
    this.map = L.map(div, { crs: L.CRS.Simple, minZoom: -3, maxZoom: 1 });
    this.map.attributionControl.setPrefix('');
    this.map.doubleClickZoom.disable();
    this.map.on('zoomend', () => { this._navCurrentZoom = this.map?.getZoom() ?? 0; });
    this.map.zoomControl?.remove();
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.map.addLayer(this.layer);
  }

  toggleCandle(candle: ICandle, found?: boolean): void {
    const marker = this.candleMarkerMap.get(candle);
    const hasCandle = this.found.has(candle);
    found ??= !this.found.has(candle);
    if (found) {
      this.found.add(candle);
      if (!hasCandle) { this.waxInAreaFound.set(this.waxInAreaFound() + candle.c); }
      marker?.setIcon(markerFoundIcon);
    } else {
      this.found.delete(candle);
      if (hasCandle) { this.waxInAreaFound.set(this.waxInAreaFound() - candle.c); }
      marker?.setIcon(markerIcon);
    }
  }

  loadAreaMap(area: ICandleArea): void {
    const waxInArea = { found: 0, total: 0 };
    this.area = area;
    this.layer.clearLayers();

    const bounds: L.LatLngBoundsExpression = [[0, 0], this.area.imageSize];
    L.imageOverlay(this.area.imageUrl, bounds, { attribution: this.area.imageAttribution || '' }).addTo(this.layer);
    const center: L.LatLngTuple = [this.area.imageSize[0] / 2, this.area.imageSize[1] / 2];
    this.map?.setView(center, -2);

    this.area.groups.forEach(group => {
      group.candles.forEach(candle => {
        waxInArea.total += candle.c;
        if (this.found.has(candle)) { waxInArea.found += candle.c; }

        const marker = L.marker(candle.p, { icon: this.found.has(candle) ? markerFoundIcon : markerIcon });
        marker.addTo(this.layer);
        this.candleMarkerMap.set(candle, marker);

        const tooltip = candle.description ? `${candle.c} wax<br/>${candle.description}` : `${candle.c} wax`;
        marker.bindTooltip(tooltip, { permanent: false, direction: 'top' });
        marker.addEventListener('click', () => this.toggleCandle(candle));
      });

      if (group.poly) {
        const polygon = L.polygon(group.poly, {
          color: 'orange', fillColor: 'orange', fillOpacity: 0.1, weight: 1
        });
        polygon.addTo(this.layer);

        const togglePos = group.poly[0];
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
          group.candles.forEach(candle => this.toggleCandle(candle, found));
        });
      }
    });

    this.waxInArea.set(waxInArea.total);
    this.waxInAreaFound.set(waxInArea.found);

    this.area.connections.forEach(connection => {
      const marker = L.marker(connection.p, { icon: markerSwapIcon });
      marker.addTo(this.layer);
      const target = this.areaMap[connection.guid];
      marker.bindTooltip(target?.name, { permanent: false, direction: 'top' });
      marker.addEventListener('click', () => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { area: target?.guid },
          queryParamsHandling: 'merge'
        });
      });
    });
  }
}
