import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IArea } from 'src/app/interfaces/area.interface';
import { IWingedLight } from 'src/app/interfaces/winged-light.interface';
import { DataService } from 'src/app/services/data.service';
import { StorageService } from 'src/app/services/storage.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildrenOfLightComponent implements OnInit, OnDestroy {
  @ViewChild('table', { static: true }) table?: ElementRef;

  unlockedCol = 0; totalCol = 0;

  light: Array<IMapWingedLight> = [];
  lightMap: { [wlGuid: string]: IMapWingedLight } = {};
  rows: Array<IRow>;
  rowMap: { [wlGuid: string]: IRow } = {};

  shownArea?: IArea;

  map!: L.Map;

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _zone: NgZone,
  ) {
    this.unlockedCol = _storageService.unlockedCol.size;
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
      row.wl.forEach(wl => { this.rowMap[wl.guid] = row; });
      this.rows.push(row);
    });
  }

  ngOnInit(): void {
    const wlIcon = L.icon({
      iconUrl: 'assets/icons/light.svg',
      iconSize: [32, 32],
      popupAnchor: [0, -12],
    });

    this.map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 1,
      maxBounds: [[-3000, -3000], [3000, 3000]],

    }).setView([-1000,0], -1);
    L.imageOverlay('assets/game/map.webp', [[-2160, -2160], [2160, 2160]], {
      attribution: 'Map &copy; <a href="https://www.thatskygame.com/" target="_blank">Sky: Children of the Light</a>',
    }).addTo(this.map);
    L.imageOverlay('assets/game/void.webp', [[1025,-675], [1225,-475]]).addTo(this.map);


    if (document.cookie.includes('mapcopy=')) {
      this.map.on('click', e => {
        console.log(e);
        navigator.clipboard.writeText(JSON.stringify([Math.floor(e.latlng.lat), Math.floor(e.latlng.lng)]));
      });
    }

    this.map.on('popupopen', e => { this.onPopupOpen(e); });

    // Load position from query params.
    const query = this._activatedRoute.snapshot.queryParamMap;
    const x = +(query.get('x') || 0);
    const y = +(query.get('y') || 0);
    const z = query.has('z') ? +(query.get('z') || 0) : undefined;
    if (z !== undefined) {
      this.map.setView([x, y], z);
    }

    // Set position in query params.
    this.map.on('moveend', () => {
      const url = new URL(location.href);
      const c = this.map.getCenter();
      url.searchParams.set('x', `${Math.floor(c.lat)}`);
      url.searchParams.set('y', `${Math.floor(c.lng)}`);
      url.searchParams.set('z', `${this.map.getZoom()}`);
      window.history.replaceState(window.history.state, '', url.pathname + url.search);
    });

    // Create lines for all Areas
    // this._dataService.areaConfig.items.filter(a => a.mapData?.position).forEach(area => {
    //   const pos = [];
    //   pos.push(area.mapData!.position);
    //   area.mapData?.connectedAreas?.forEach(guid => {
    //     const area = this._dataService.guidMap.get(guid as unknown as string) as IArea;
    //     if (!area.mapData?.position) { return; }
    //     pos.push(area.mapData.position);
    //   });
    //   L.polyline(pos, { color: '#ffff0080',  }).addTo(this.map);
    // });

    // Create markers for all Children of Light
    this._dataService.wingedLightConfig.items.forEach(wl => {
      if (!wl.mapData) { return; }
      const obj: IMapWingedLight = { wl };

      // Create marker
      obj.marker = L.marker(wl.mapData.position, {
        icon: wlIcon,
        opacity: wl.unlocked ? 0.4 : 1,
      }).addTo(this.map);
      obj.marker.bindPopup(this.createPopup(wl), {
        maxWidth: 480
      });

      this.light.push(obj);
      this.lightMap[wl.guid] = obj;
    });

    // Allow Leaflet events to enter Angular.
    (window as any).markCol = (elem: HTMLElement, guid: string) => {
      this._zone.run(() => { this.markCol(elem, guid); });
    };

    (window as any).nextCol = (guid: string, direction: number) => {
      this._zone.run(() => { direction < 0 ? this.prevCol(guid) : this.nextCol(guid); });
    };
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  scrollToList(): void {
    if (!this.table) { return; }
    const table = this.table.nativeElement as HTMLElement;
    table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  reset(): void {
    if (!confirm('Are you sure you want to reset your found Children of Light?')) { return; }
    this._storageService.unlockedCol.clear();
    this._storageService.saveCol();
    this._dataService.reloadUnlocked();

    this.unlockedCol = 0;
    this.rows.forEach(r => r.unlocked = 0);
    this.light.forEach(l => { l.marker?.setOpacity(1); });
    this.map.closePopup();

    this._changeDetectorRef.markForCheck();
  }

  showArea(row: IRow): void {
    this.shownArea = row.area;
    const lights = this.light.filter(v => v.wl.area === this.shownArea);

    const wl = lights.find(v => !v.wl.unlocked)?.wl ?? lights[0]?.wl;
    if (!wl) { return; }
    this.flyAndOpen(wl, true);
  }

  private createPopup(wl: IWingedLight): string {
    let video = '';
    let videoUrl = wl.mapData?.videoUrl;
    if (videoUrl) {
      if (!videoUrl.includes('youtube')) { videoUrl = `https://silverfeelin.github.io/SkyGame-Planner-Videos/CoL/${videoUrl}`; }
      video =`<iframe width="480" height="270" src="${videoUrl}" title="CoL" frameborder="0" allow="autoplay; encrypted-media;" allowfullscreen></iframe>`
    }

    let wiki = '';
    if (wl._wiki?.href) {
      wiki = `<a href="${wl._wiki.href}" class="button link float-right" target="_blank">Wiki</a>`
    }

    return `
<div class="s-leaflet-tooltip" data-wl="${wl.guid}" onkeydown="keydownCol(event, this)">
  <div class="s-leaflet-grid">
    <div class="container"><div class="menu-icon s-leaflet-maticon">map</div><div class="menu-label">${wl.area?.realm?.name || ''}</div></div>
    <div class="container"><div class="menu-icon s-leaflet-maticon">location_on</div><div class="menu-label">${wl.area?.name || ''}</div></div>
    <div class="container s-leaflet-desc">
      <div class="menu-icon s-leaflet-maticon">description</div><div class="menu-label">${wl.description || ''}</div>
    </div>
  </div>
  <div class="s-leaflet-mt">${video}</div>
  <div class="s-leaflet-mt">
    <button type="button" class="s-leaflet-hasicon s-leaflet-found" data-action="mark" onclick="markCol(this, '${wl.guid}')">
      <span class="s-leaflet-maticon">check_box_outline_blank</span>
      <span class="s-leaflet-check-label">Found</span>
    </button>
    <button class="s-leaflet-hasicon" data-direction="left" type="button" onclick="nextCol('${wl.guid}', -1)"><span class="s-leaflet-maticon">arrow_back</span>&nbsp;</button>
    <button class="s-leaflet-hasicon" data-direction="right" type="button" onclick="nextCol('${wl.guid}', 1)"><span class="s-leaflet-maticon">arrow_forward</span>&nbsp;</button>
    ${wiki}
  </div>
</div>
`;
  }

  private onPopupOpen(e: L.PopupEvent): void {
    const div = e.popup.getElement()?.querySelector('.s-leaflet-tooltip') as HTMLElement;
    if (!div) { return; }
    const wlGuid = div.dataset['wl'] as string;
    const wl = this._dataService.guidMap.get(wlGuid) as IWingedLight;

    this.updatePopup(div, wl);
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
    this.unlockedCol = this._storageService.unlockedCol.size;
    this._changeDetectorRef.markForCheck();
  }

  private flyAndOpen(wl: IWingedLight, scroll = false): void {
    if (!wl) { return; }
    const light = this.lightMap[wl.guid];
    if (!light) { return; }

    if (scroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.map.closePopup();
    const pos = wl.mapData?.position || [0,0];
    this.map.flyTo([pos[0] + 200, pos[1]], 0);
    light.marker?.openPopup();
  }

  // #region Leaflet tooltip events

  private markCol(div: HTMLElement, guid: string): void {
    const wl = this._dataService.guidMap.get(guid) as IWingedLight;
    wl.unlocked = !wl.unlocked;
    wl.unlocked ? this._storageService.addCol(guid) : this._storageService.removeCol(guid);
    this._storageService.saveCol();

    this.updatePopup(div, wl);
    this.updateMarker(wl);
    this.updateTable(wl);
  }

  private prevCol(guid: string): void {
    const wl = this._dataService.guidMap.get(guid) as IWingedLight;
    const i = this._dataService.wingedLightConfig.items.findIndex(w => w === wl);
    const prevWl = this._dataService.wingedLightConfig.items[i - 1] || this._dataService.wingedLightConfig.items[this._dataService.wingedLightConfig.items.length - 1];

    if (!this.lightMap[prevWl.guid]?.marker) { alert('Missing marker for previous Child of Light!'); return; }
    this.flyAndOpen(prevWl);
  }

  private nextCol(guid: string): void {
    const wl = this._dataService.guidMap.get(guid) as IWingedLight;
    const i = this._dataService.wingedLightConfig.items.findIndex(w => w === wl);
    const nextWl = this._dataService.wingedLightConfig.items[i + 1] || this._dataService.wingedLightConfig.items[0];

    if (!this.lightMap[nextWl.guid]?.marker) { alert('Missing marker for next Child of Light!'); return; }
    this.flyAndOpen(nextWl);
  }

  // #endregion
}
