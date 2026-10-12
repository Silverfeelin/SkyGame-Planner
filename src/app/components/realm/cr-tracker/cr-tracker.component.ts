import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmClickDirective } from '@app/directives/confirm-click.directive';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { parse as jsoncParse } from 'jsonc-parser';
import L from 'leaflet';
import { DateHelper } from '@app/helpers/date-helper';
import { disableKeyboardShortcutsUntilDestroyed } from '@app/services/event.service';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';
import { environment } from 'src/environments/environment';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';

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

interface IWaxProgress { found: number; total: number; }
interface IAreaProgress extends IWaxProgress { area: ICandleArea; }

/** Candles collected on one Sky day, keyed by area GUID and then by candle position. */
interface ISavedProgress { date: string; found: { [areaGuid: string]: Array<string> }; }

/** The previous state of the candles changed by one action. */
interface IUndoStep { candles: Array<ICandle>; found: boolean; }

const progressStorageKey = 'cr-tracker.progress';
const undoLimit = 50;

// Candles have no GUID and the weekday filter shifts their indices, so their position identifies them.
const candleKey = (candle: ICandle): string => `${candle.p[0]},${candle.p[1]}`;

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
  templateUrl: './cr-tracker.component.html',
  styleUrl: './cr-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, ConfirmClickDirective, MatIcon, OverlayComponent, SectionQuickActionsComponent]
})
export class CrTrackerComponent implements AfterViewInit {
  @ViewChild('map', { static: true }) private mapDiv!: ElementRef<HTMLDivElement>;

  private readonly _http = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _destroyRef = inject(DestroyRef);

  readonly areas = signal<Array<ICandleArea>>([]);
  readonly area = signal<ICandleArea | undefined>(undefined);
  readonly defaultArea = computed(() => this.areas().at(0));

  readonly isAreaOverlayVisible = signal(false);
  readonly isNewDayNoticeVisible = signal(false);

  private readonly _found = new Set<ICandle>();
  /** Bumped on every change to `_found`, which a Set can't signal by itself. */
  private readonly _foundVersion = signal(0);
  private readonly _undoStack = signal<Array<IUndoStep>>([]);
  readonly canUndo = computed(() => this._undoStack().length > 0);

  readonly areaProgress = computed<Array<IAreaProgress>>(() => {
    this._foundVersion();
    return this.areas().map(area => ({ area, ...this.countWax(this.areaCandles(area)) }));
  });

  readonly totalProgress = computed<IWaxProgress>(() => this.areaProgress().reduce(
    (total, p) => ({ found: total.found + p.found, total: total.total + p.total }),
    { found: 0, total: 0 }
  ));

  readonly currentProgress = computed<IWaxProgress>(() => {
    const area = this.area();
    return this.areaProgress().find(p => p.area === area) ?? { found: 0, total: 0 };
  });

  readonly isAreaComplete = computed(() => {
    const progress = this.currentProgress();
    return progress.total > 0 && progress.found === progress.total;
  });

  /** The first map after the current one, in route order, that still has wax left. */
  readonly nextArea = computed(() => {
    const progress = this.areaProgress();
    const index = progress.findIndex(p => p.area === this.area());
    for (let i = 1; i <= progress.length; i++) {
      const p = progress[(index + i) % progress.length];
      if (p.area !== this.area() && p.found < p.total) { return p.area; }
    }
    return undefined;
  });

  private _raw?: ICandlesData;
  private _day = '';
  private readonly _areaMap = new Map<string, ICandleArea>();
  private readonly _candleArea = new Map<ICandle, ICandleArea>();

  private _map?: L.Map;
  private readonly _layer = L.layerGroup();
  private readonly _candleMarkers = new Map<ICandle, L.Marker>();
  private readonly _groupLayers = new Map<ICandleGroup, { polygon: L.Polygon, toggle: L.Marker }>();
  /** Last pan and zoom per area GUID, restored when returning to that area. */
  private readonly _views = new Map<string, { center: L.LatLng, zoom: number }>();

  constructor() {
    disableKeyboardShortcutsUntilDestroyed();

    this._http.get(environment.urls.candles, { responseType: 'text' }).subscribe((data: string) => {
      this._raw = jsoncParse(data);
      this.applyDay();

      this._route.queryParamMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(params => {
        const areaGuid = params.get('area');
        const area = (areaGuid && this._areaMap.get(areaGuid)) || this.defaultArea();
        if (area) { this.loadAreaMap(area); }
      });

      if (!this._route.snapshot.queryParamMap.has('area')) {
        const url = new URL(window.location.href);
        url.searchParams.set('area', this.defaultArea()!.guid);
        history.replaceState(history.state, '', url.toString());
      }
    });

    // The weekday candles and collected wax both reset with the Sky day, even if the page stays open.
    const dayInterval = setInterval(() => this.checkDay(), 60_000);
    const onVisibilityChange = () => { if (!document.hidden) { this.checkDay(); } };
    document.addEventListener('visibilitychange', onVisibilityChange);
    this._destroyRef.onDestroy(() => {
      clearInterval(dayInterval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    });
  }

  ngAfterViewInit(): void {
    this._map = L.map(this.mapDiv.nativeElement, { crs: L.CRS.Simple, minZoom: -3, maxZoom: 1 });
    this._map.attributionControl.setPrefix('');
    this._map.doubleClickZoom.disable();
    this._map.zoomControl?.remove();
    L.control.zoom({ position: 'bottomright' }).addTo(this._map);
    this._map.addLayer(this._layer);

    const area = this.area();
    if (area) { this.loadAreaMap(area); }
  }

  // #region Navigation

  /** Opens the area at its last view, or recenters it when it is already open. */
  navigateToArea(area: ICandleArea | undefined): void {
    if (!area) { return; }
    if (this.area() === area) { this.loadAreaMap(area, true); return; }
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { area: area.guid },
      queryParamsHandling: 'merge',
    });
  }

  goHome(): void {
    this.navigateToArea(this.defaultArea());
  }

  selectAreaFromOverlay(area: ICandleArea): void {
    this.isAreaOverlayVisible.set(false);
    this.navigateToArea(area);
  }

  // #endregion

  // #region Actions

  toggleCandle(candle: ICandle): void {
    this.setFound([candle], !this._found.has(candle));
  }

  /** Marks every candle in the area as found, or clears them all if the area is already complete. */
  toggleArea(area: ICandleArea | undefined): void {
    if (!area) { return; }
    const candles = this.areaCandles(area);
    this.setFound(candles, candles.some(c => !this._found.has(c)));
  }

  toggleAllAreas(): void {
    const candles = this.areas().flatMap(area => this.areaCandles(area));
    this.setFound(candles, candles.some(c => !this._found.has(c)));
  }

  /** Restart is recorded like any other action, so it can be undone. */
  promptRestart(): void {
    const message = 'Restart the candle run?\n\nThis clears the collected wax on every map. You can still undo it afterwards.';
    if (this._found.size && !confirm(message)) { return; }
    this.setFound([...this._found], false);
    this.isAreaOverlayVisible.set(false);
    this.goHome();
  }

  undo(): void {
    const stack = this._undoStack();
    const step = stack.at(-1);
    if (!step) { return; }
    this._undoStack.set(stack.slice(0, -1));
    this.setFound(step.candles, step.found, false);

    // Show where the undone change happened, unless it spanned several maps.
    const area = this._candleArea.get(step.candles[0]);
    if (area && area !== this.area() && step.candles.every(c => this._candleArea.get(c) === area)) {
      this.navigateToArea(area);
    }
  }

  private setFound(candles: Array<ICandle>, found: boolean, recordUndo = true): void {
    this.checkDay();

    // A day change may have just dropped some of these candles.
    const changed = candles.filter(c => this._candleArea.has(c) && this._found.has(c) !== found);
    if (!changed.length) { return; }

    if (recordUndo) {
      this._undoStack.update(stack => [...stack.slice(1 - undoLimit), { candles: changed, found: !found }]);
    }

    changed.forEach(candle => {
      if (found) { this._found.add(candle); } else { this._found.delete(candle); }
      this.updateCandleMarker(candle);
    });
    this._groupLayers.forEach((_, group) => this.updateGroupLayers(group));

    this._foundVersion.update(v => v + 1);
    this.saveProgress();
  }

  // #endregion

  // #region Map

  private loadAreaMap(area: ICandleArea, resetView = false): void {
    const previous = this.area();
    if (previous && previous !== area && this._map) {
      this._views.set(previous.guid, { center: this._map.getCenter(), zoom: this._map.getZoom() });
    }

    this.area.set(area);
    if (!this._map) { return; }

    this._layer.clearLayers();
    this._candleMarkers.clear();
    this._groupLayers.clear();

    const bounds = L.latLngBounds([0, 0], area.imageSize);
    L.imageOverlay(area.imageUrl, bounds, { attribution: area.imageAttribution || '' }).addTo(this._layer);

    const view = resetView ? undefined : this._views.get(area.guid);
    if (view) {
      this._map.setView(view.center, view.zoom);
    } else {
      this._map.fitBounds(bounds);
    }

    area.groups.forEach(group => {
      if (group.poly) { this.addGroupLayers(group); }

      group.candles.forEach(candle => {
        const marker = L.marker(candle.p, { icon: markerIcon });
        const tooltip = candle.description ? `${candle.c} wax<br/>${candle.description}` : `${candle.c} wax`;
        marker.bindTooltip(tooltip, { permanent: false, direction: 'top' });
        marker.on('click', () => this.toggleCandle(candle));
        marker.addTo(this._layer);
        this._candleMarkers.set(candle, marker);
        this.updateCandleMarker(candle);
      });
    });

    area.connections.forEach(connection => {
      const target = this._areaMap.get(connection.guid);
      if (!target) { return; }

      const marker = L.marker(connection.p, { icon: markerSwapIcon });
      marker.addTo(this._layer);
      marker.bindTooltip(() => {
        const progress = this.countWax(this.areaCandles(target));
        return `${target.name}<br/>${progress.found} / ${progress.total} wax`;
      }, { permanent: false, direction: 'top' });
      marker.on('click', () => this.navigateToArea(target));
    });
  }

  private addGroupLayers(group: ICandleGroup): void {
    const polygon = L.polygon(group.poly!, {
      className: 's-leaflet-group-area', color: 'orange', fillColor: 'orange', fillOpacity: 0.1, weight: 1
    });
    polygon.addTo(this._layer);

    const toggle = L.marker(group.poly![0], {
      icon: L.divIcon({
        className: 's-leaflet-group-toggle',
        html: '<span class="s-leaflet-maticon"></span>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        tooltipAnchor: [0, -16]
      }),
      interactive: true
    });
    toggle.bindTooltip(() => {
      const progress = this.countWax(group.candles);
      return `${group.name}<br/>${progress.found} / ${progress.total} wax · toggle all`;
    }, { permanent: false, direction: 'top' });
    toggle.on('click', () => this.setFound(group.candles, group.candles.some(c => !this._found.has(c))));
    toggle.addTo(this._layer);

    this._groupLayers.set(group, { polygon, toggle });
    this.updateGroupLayers(group);
  }

  private updateCandleMarker(candle: ICandle): void {
    const marker = this._candleMarkers.get(candle);
    if (!marker) { return; }

    const found = this._found.has(candle);
    marker.setIcon(found ? markerFoundIcon : markerIcon);
    marker.setOpacity(found ? 0.6 : 1);
  }

  private updateGroupLayers(group: ICandleGroup): void {
    const layers = this._groupLayers.get(group);
    if (!layers) { return; }

    const found = group.candles.filter(c => this._found.has(c)).length;
    const complete = found === group.candles.length;
    layers.polygon.getElement()?.classList.toggle('is-complete', complete);

    // Edit the existing element: replacing the icon on click would leave its hover tooltip stuck open.
    const element = layers.toggle.getElement();
    element?.classList.toggle('is-complete', complete);
    const icon = element?.querySelector('.s-leaflet-maticon');
    if (icon) {
      icon.textContent = complete ? 'check_box' : found ? 'indeterminate_check_box' : 'check_box_outline_blank';
    }
  }

  // #endregion

  // #region Data

  /** Builds the areas for the current Sky day and restores the progress saved for it. */
  private applyDay(): void {
    if (!this._raw) { return; }

    const today = DateHelper.todaySky();
    this._day = today.toISODate()!;
    const weekday = 1 << (today.weekday - 1);

    const areas = this._raw.items.map(area => ({
      ...area,
      groups: area.groups.map(group => ({
        ...group,
        candles: group.candles.filter(candle => !candle.weekday || (candle.weekday & weekday) !== 0)
      }))
    }));

    this._areaMap.clear();
    this._candleArea.clear();
    areas.forEach(area => {
      this._areaMap.set(area.guid, area);
      this.areaCandles(area).forEach(candle => this._candleArea.set(candle, area));
    });

    this._found.clear();
    this._undoStack.set([]);
    this.restoreProgress();

    this.areas.set(areas);
    this._foundVersion.update(v => v + 1);
  }

  private checkDay(): void {
    if (!this._raw || DateHelper.todaySky().toISODate() === this._day) { return; }

    const hadProgress = this._found.size > 0;
    const areaGuid = this.area()?.guid;
    this.applyDay();
    if (hadProgress) { this.isNewDayNoticeVisible.set(true); }

    // The area objects were rebuilt, so this reloads the map and keeps its view.
    const area = (areaGuid && this._areaMap.get(areaGuid)) || this.defaultArea();
    if (area) { this.loadAreaMap(area); }
  }

  /** Restores today's progress, or discards progress left over from an earlier Sky day. */
  private restoreProgress(): void {
    let saved: ISavedProgress | undefined;
    try { saved = JSON.parse(localStorage.getItem(progressStorageKey) || 'null') ?? undefined; } catch { saved = undefined; }
    if (!saved) { return; }

    if (saved.date !== this._day) {
      try { localStorage.removeItem(progressStorageKey); } catch { /* Ignored again on the next load. */ }
      if (Object.values(saved.found ?? {}).some(keys => keys.length)) { this.isNewDayNoticeVisible.set(true); }
      return;
    }

    this._areaMap.forEach(area => {
      const keys = new Set(saved.found[area.guid] ?? []);
      if (!keys.size) { return; }
      this.areaCandles(area).forEach(candle => {
        if (keys.has(candleKey(candle))) { this._found.add(candle); }
      });
    });
  }

  private saveProgress(): void {
    try {
      if (!this._found.size) { localStorage.removeItem(progressStorageKey); return; }

      const saved: ISavedProgress = { date: this._day, found: {} };
      this._found.forEach(candle => {
        const area = this._candleArea.get(candle);
        if (area) { (saved.found[area.guid] ??= []).push(candleKey(candle)); }
      });
      localStorage.setItem(progressStorageKey, JSON.stringify(saved));
    } catch {
      // Progress then only lasts until the page is closed.
    }
  }

  private areaCandles(area: ICandleArea): Array<ICandle> {
    return area.groups.flatMap(group => group.candles);
  }

  private countWax(candles: Array<ICandle>): IWaxProgress {
    return candles.reduce((progress, candle) => {
      progress.total += candle.c;
      if (this._found.has(candle)) { progress.found += candle.c; }
      return progress;
    }, { found: 0, total: 0 });
  }

  // #endregion
}
