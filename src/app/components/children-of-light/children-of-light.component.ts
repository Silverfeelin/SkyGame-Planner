import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import L, { LeafletKeyboardEvent } from 'leaflet';
import { IArea } from 'src/app/interfaces/area.interface';
import { IWingedLight } from 'src/app/interfaces/winged-light.interface';
import { DataService } from 'src/app/services/data.service';
import { StorageService } from 'src/app/services/storage.service';
import { SubscriptionLike } from 'rxjs';
import { MapInstanceService } from 'src/app/services/map-instance.service';
import { IMapInit } from 'src/app/services/map.service';
import { TableColumnDirective } from '../table/table-column/table-column.directive';
import { TableHeaderDirective } from '../table/table-column/table-header.directive';
import { TableComponent } from '../table/table.component';
import { MatIcon } from '@angular/material/icon';

interface IRow {
  area: IArea;
  wl: Array<IWingedLight>;
  unlocked: number;
}

interface IMapWingedLight {
  wl: IWingedLight;
  marker?: L.Marker;
}

@Component({
    selector: 'app-children-of-light',
    templateUrl: './children-of-light.component.html',
    styleUrls: ['./children-of-light.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MapInstanceService],
    imports: [MatIcon, TableComponent, TableHeaderDirective, TableColumnDirective]
})
export class ChildrenOfLightComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @ViewChild('table', { static: true }) table!: ElementRef;

  unlockedCol = 0; totalCol = 0;

  light: Array<IMapWingedLight> = [];
  lightMap: { [wlGuid: string]: IMapWingedLight } = {};
  rows: Array<IRow>;
  rowMap: { [wlGuid: string]: IRow } = {};

  shownArea?: IArea;

  map!: L.Map;
  _lastPopup?: L.Popup;

  private _subWidth?: SubscriptionLike;

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService,
    private readonly _mapInstanceService: MapInstanceService,
    private readonly _route: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _zone: NgZone,
  ) {
    this.unlockedCol = _storageService.getWingedLights().size;
    this.totalCol = this._dataService.wingedLightConfig.items.length;

    const areaSet = new Set<string>();
    this.rows = [];
    this._dataService.wingedLightConfig.items.forEach(wl => {
      const area = wl.area;
      if (!area || areaSet.has(area.guid)) { return; }
      areaSet.add(area.guid);
      const row: IRow = {
        area,
        wl: area.wingedLights || [],
        unlocked: (area.wingedLights || []).filter(wl => wl.unlocked).length
      }
      row.wl.forEach(wl => {
        this.rowMap[wl.guid] = row;
      });
      this.rows.push(row);
    });
  }

  ngAfterViewInit(): void {
    const wlGuid = this._route.snapshot.queryParamMap.get('wl');
    const wl = wlGuid ? this._dataService.guidMap.get(wlGuid) as IWingedLight : undefined;
    const areaGuid = this._route.snapshot.queryParamMap.get('area');
    const area = areaGuid ? this._dataService.guidMap.get(areaGuid) as IArea : undefined;

    let mapInit: IMapInit;
    if (wl) {
      mapInit = { view: wl.mapData?.position, zoom: 3 };
    } else if (area?.mapData?.position) {
      mapInit = { view: area.mapData.position, zoom: 3 };
    } else {
      mapInit = { fromQuery: true };
    }
    this.map = this._mapInstanceService.initialize(this.mapContainer.nativeElement.querySelector('.map'), mapInit);

    const layerGroup = L.layerGroup().addTo(this.map);
    const wlIcon = L.icon({
      iconUrl: 'assets/icons/light.svg',
      iconSize: [32, 32],
      popupAnchor: [0, -12],
    });

    // Add images to map.
    L.imageOverlay('assets/game/map/void.webp', [[-141.87,185.63], [-116.88,210.63]]).addTo(layerGroup);

    // Create markers for all Children of Light
    this._dataService.wingedLightConfig.items.forEach(wl => {
      if (!wl.mapData) { return; }
      const obj: IMapWingedLight = { wl };

      // Create marker
      obj.marker = L.marker(wl.mapData.position!, {
        icon: wlIcon,
        opacity: wl.unlocked ? 0.4 : 1,
      });

      const popup = new L.Popup({
        content: () => this.createPopup(wl),
        minWidth: 480, maxWidth: 480
      });
      obj.marker.bindPopup(popup);

      layerGroup.addLayer(obj.marker);

      this.light.push(obj);
      this.lightMap[wl.guid] = obj;
    });

    if (wl ){
      setTimeout(() => {
        this.flyAndOpen(wl);
      });
    }

    // Allow Leaflet events to enter Angular.
    (window as any).markCol = (elem: HTMLElement, guid: string, next: boolean) => {
      this._zone.run(() => { this.markCol(elem, guid, next); });
    };

    (window as any).nextCol = (guid: string, direction: number) => {
      this._zone.run(() => { direction < 0 ? this.prevCol(guid) : this.nextCol(guid); });
    };

    // Events
    this._mapInstanceService.on('popupopen', (e: L.PopupEvent) => { this.onPopupOpen(e); })
    this._mapInstanceService.on('moveend', () => { this.onMoveEnd(); });
    this._mapInstanceService.on('keydown', (e: LeafletKeyboardEvent) => { this.onKeydown(e); });

    this._subWidth = this._breakpointObserver.observe(['(min-width: 720px)']).subscribe(s => this.onResponsive(s));
  }

  onResponsive(s: BreakpointState): void {
    // Set popup width to 240 or 480px based on screen width.
    const w = s.matches ? 480 : 240;
    this.light.forEach(light => {
      if (!light.marker) { return; }
      const options = light.marker.getPopup()?.options || {};
      options.minWidth = options.maxWidth = w;
    });
  }

  ngOnDestroy(): void {
    this._subWidth?.unsubscribe();
  }

  scrollToList(): void {
    const table = this.table.nativeElement as HTMLElement;
    table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  unlockAll(): void {
    if (!confirm('Are you sure you want to mark all Children of Light as found?')) { return; }

    this._dataService.wingedLightConfig.items.forEach(wl => {
      if (wl.unlocked) { return; }
      this.toggleWingedLight(wl, true);
      this.updateMarker(wl);
      this.updateTable(wl);
    });
  }

  reset(): void {
    if (!confirm('Are you sure you want to reset your found Children of Light?')) { return; }

    const wlGuids: Array<string> = [];
    this._dataService.wingedLightConfig.items.forEach(wl => {
      wl.unlocked = false;
      wlGuids.push(wl.guid);
    });
    this._storageService.removeWingedLights(...wlGuids);

    this.unlockedCol = 0;
    this.rows.forEach(r => r.unlocked = 0);
    this.light.forEach(l => { l.marker?.setOpacity(1); });
    this.map.closePopup();

    this._changeDetectorRef.markForCheck();
  }

  resetOrbit(): void {
    if (!confirm('Did you leave Orbit? This will lock everything but the winged light from Orbit.')) { return; }

    const wlGuids: Array<string> = [];
    this._dataService.wingedLightConfig.items.forEach(wl => {
      wl.unlocked = false;
      wlGuids.push(wl.guid);
    });
    this._storageService.removeWingedLights(...wlGuids);

    this.unlockedCol = 0;
    this.rows.forEach(r => r.unlocked = 0);
    this.light.forEach(l => { l.marker?.setOpacity(1); });
    this.map.closePopup();

    const orbitGuid = 'DvYGWvjeOC';
    const orbitWl = this.lightMap[orbitGuid]?.wl;
    if (orbitWl) {
      this.toggleWingedLight(orbitWl, true);
      this.updateMarker(orbitWl);
      this.updateTable(orbitWl);
    }

    this._changeDetectorRef.markForCheck();
  }

  showArea(row: IRow): void {
    this.shownArea = row.area;
    const lights = this.light.filter(v => v.wl.area === this.shownArea);

    const wl = lights.find(v => !v.wl.unlocked)?.wl ?? lights[0]?.wl;
    if (!wl) { return; }
    this.flyAndOpen(wl, true);
  }

  toggleRow(row: IRow, found?: boolean): void {
    found ??= row.unlocked < row.wl.length;

    this.map.closePopup();
    row.area.wingedLights?.forEach(wl => {
      this.toggleWingedLight(wl, found);
      this.updateTable(wl);
      this.updateMarker(wl);
    });
  }

  private createPopup(wl: IWingedLight): HTMLElement {
    const div = this._mapInstanceService.ttFlex();
    div.classList.add('s-leaflet-tooltip');
    div.setAttribute('data-wl', wl.guid);

    const grid = this._mapInstanceService.ttGrid();
    div.appendChild(grid);

    grid.appendChild(this._mapInstanceService.ttArea(wl.area));
    grid.appendChild(this._mapInstanceService.ttRealm(wl.area.realm));
    grid.insertAdjacentHTML('beforeend', `
<div class="container s-leaflet-item s-leaflet-desc">
  <div class="menu-icon s-leaflet-maticon s-leaflet-maticon-desktop">description</div><div class="menu-label">${wl.description || ''}</div>
</div>`);

    let videoUrl = wl.mapData?.videoUrl;
    if (videoUrl) {
      if (!videoUrl.includes('youtube')) { videoUrl = `/assets/game/col/${videoUrl}`; }
      div.insertAdjacentHTML('beforeend', `
<div>
  <iframe class="s-leaflet-vid" width="480" height="270" src="${videoUrl}" title="CoL" frameborder="0" allow="autoplay; encrypted-media;" allowfullscreen></iframe>
</div>`);
    }

    const divButtons = document.createElement('div');
    div.appendChild(divButtons);
    divButtons.insertAdjacentHTML('beforeend', `
<button type="button" class="s-leaflet-hasicon s-leaflet-found" data-action="mark" onclick="markCol(this, '${wl.guid}', false)" title="Mark as found.">
  <span class="s-leaflet-maticon">check_box_outline_blank</span>
  <span class="s-leaflet-check-label">Found</span>
</button>`);
    divButtons.insertAdjacentHTML('beforeend', `
<button type="button" class="s-leaflet-hasicon" data-action="mark" onclick="markCol(this, '${wl.guid}', true)" title="Mark as found and go to next light.">
  <span class="s-leaflet-maticon">done_all</span>
  &nbsp;
</button>`);
    divButtons.insertAdjacentHTML('beforeend', `
<button class="s-leaflet-hasicon" data-direction="left" type="button" onclick="nextCol('${wl.guid}', -1)" title="Go to previous light.">
  <span class="s-leaflet-maticon">arrow_back</span>
  &nbsp;
</button>`);
    divButtons.insertAdjacentHTML('beforeend', `
<button class="s-leaflet-hasicon" data-direction="right" type="button" onclick="nextCol('${wl.guid}', 1)" title="Go to next light.">
  <span class="s-leaflet-maticon">arrow_forward</span>
  &nbsp;
</button>`);

    if (wl._wiki?.href) {
      divButtons.insertAdjacentHTML('beforeend', `<a href="${wl._wiki.href}" class="button link float-right" target="_blank">Wiki</a>`);
    }

    return div;
  }

  private onPopupOpen(e: L.PopupEvent): void {
    const div = e.popup.getElement()?.querySelector('.s-leaflet-tooltip') as HTMLElement;
    if (!div) { return; }
    const wlGuid = div.dataset['wl'] as string;
    const wl = this._dataService.guidMap.get(wlGuid) as IWingedLight;
    this._lastPopup = e.popup;

    this.updatePopup(div, wl);
  }

  private onMoveEnd(): void {
    const url = new URL(location.href);
    const c = this.map.getCenter();
    url.searchParams.set('x', `${Math.floor(c.lng)}`);
    url.searchParams.set('y', `${Math.floor(c.lat)}`);
    url.searchParams.set('z', `${this.map.getZoom()}`);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  private onKeydown(e: LeafletKeyboardEvent): void {
    if (!this._lastPopup?.isOpen()) { return; }
    const key = e.originalEvent.key;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== ' ') { return; }

    const el = this._lastPopup.getElement()?.querySelector('.s-leaflet-tooltip') as HTMLElement;
    const wlGuid = el.dataset['wl'] as string;
    if (!wlGuid) { return; }

    switch (key) {
      case 'ArrowLeft': this.prevCol(wlGuid); break;
      case 'ArrowRight': this.nextCol(wlGuid); break;
      case ' ': this.markCol(el.querySelector('[data-action="mark"]') as HTMLElement, wlGuid, false); break;
      default: return;
    }

    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();
  }

  private updatePopup(div: HTMLElement, wl: IWingedLight): void {
    const foundIcon = div.querySelector('.s-leaflet-found .s-leaflet-maticon') as HTMLElement;
    foundIcon.innerText = wl.unlocked ? 'check_box' : 'check_box_outline_blank';
  }

  private updateMarker(wl: IWingedLight): void {
    const obj = this.lightMap[wl.guid];
    if (!obj) { return; }
    obj.marker?.setOpacity(wl.unlocked ? 0.4 : 1);
  }

  private updateTable(wl: IWingedLight): void {
    const row = this.rowMap[wl.guid];
    if (!row) { return; }
    row.unlocked = (row.wl || []).filter(wl => wl.unlocked).length;
    this.unlockedCol = this._storageService.getWingedLights().size;
    this._changeDetectorRef.markForCheck();
  }

  private flyAndOpen(wl: IWingedLight, scroll = false): void {
    if (!wl) { return; }
    const light = this.lightMap[wl.guid];
    if (!light) { return; }

    if (scroll) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.map.closePopup();
    const pos = wl.mapData?.position || [0,0];
    light.marker?.openPopup();
    light.marker?.getElement()?.focus();
    setTimeout(() => {
      this.map.flyTo([pos[0] + 20, pos[1]], 3, { animate: true, duration: 0.5 });
    }, 1);
  }

  private toggleWingedLight(wl: IWingedLight, found?: boolean): void {
    wl.unlocked = typeof(found) === 'boolean' ? found : !wl.unlocked;
    if (wl.unlocked) {
      this._storageService.addWingedLights(wl.guid);
    } else {
      this._storageService.removeWingedLights(wl.guid);
    }
  }

  private allDone(): void {
    this.map.closePopup();
    this.map.flyTo([-270, 270], 0, { animate: false, duration: 0 });
  }

  // #region Leaflet tooltip events

  private markCol(div: HTMLElement, guid: string, next: boolean): void {
    const wl = this._dataService.guidMap.get(guid) as IWingedLight;
    this.toggleWingedLight(wl, next ? true : undefined);

    this.updatePopup(div.parentElement as HTMLElement, wl);
    this.updateMarker(wl);
    this.updateTable(wl);

    // Go to next
    if (next) {
      this.nextCol(guid, true);
    }
  }

  private prevCol(guid: string): void {
    const wl = this._dataService.guidMap.get(guid) as IWingedLight;
    const i = this._dataService.wingedLightConfig.items.findIndex(w => w === wl);
    const prevWl = this._dataService.wingedLightConfig.items[i - 1] || this._dataService.wingedLightConfig.items[this._dataService.wingedLightConfig.items.length - 1];

    if (!this.lightMap[prevWl.guid]?.marker) { alert('Missing marker for previous Child of Light!'); return; }
    this.flyAndOpen(prevWl);
  }

  private nextCol(guid: string, skipFound = false): void {
    const wl = this._dataService.guidMap.get(guid) as IWingedLight;
    const i = this._dataService.wingedLightConfig.items.findIndex(w => w === wl);
    let j = (i + 1) % this._dataService.wingedLightConfig.items.length;
    let nextWl: IWingedLight | undefined;
    while (j !== i) {
      nextWl = this._dataService.wingedLightConfig.items[j];
      if (!nextWl.unlocked || !skipFound) { break; }
      j += 1; j %= this._dataService.wingedLightConfig.items.length;
    }

    if (j === i) {
      this.allDone();
      return;
    }

    if (!nextWl) { return; }
    if (!this.lightMap[nextWl.guid]?.marker) { alert('Missing marker for next Child of Light!'); return; }
    this.flyAndOpen(nextWl);
  }
  // #endregion
}
