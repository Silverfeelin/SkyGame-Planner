import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { IMapInit, MapService } from './map.service';
import L from 'leaflet';
import { IRealm } from '../interfaces/realm.interface';
import { EventService } from './event.service';
import { SubscriptionBag } from '../helpers/subscription-bag';
import { IArea } from '../interfaces/area.interface';
import { Router } from '@angular/router';
import { IMapShrine } from '../interfaces/map-shrine.interface';
import { StorageService } from './storage.service';
import { ISpirit } from '../interfaces/spirit.interface';
import { IWingedLight } from '../interfaces/winged-light.interface';
import { Maybe } from '../types/maybe';

const opacityFound = 0.4;

interface IMapRealmOptions {
  showLabel?: boolean,
  onClick?: (evt: L.LeafletMouseEvent) => void
}

interface IMapAreaOptions {
  icon?: string,
  onClick?: (evt: L.LeafletMouseEvent) => void
}

interface IMapConnectionOptions {}
interface IMapWingedLightOptions {}
interface IMapMapShrineOptions {}

@Injectable()
export class MapInstanceService implements OnDestroy {
  _map?: L.Map;
  _subs = new SubscriptionBag();

  // #region Layer groups
  areRealmsShown = false;
  private _realmLayers?: L.LayerGroup;
  get realmLayers() {
    this._realmLayers ??= L.layerGroup().addTo(this.map);
    return this._realmLayers;
  }

  areAreasShown = false;
  private _areaLayers?: L.LayerGroup;
  get areaLayers() {
    this._areaLayers ??= L.layerGroup().addTo(this.map);
    return this._areaLayers;
  }

  areConnectionsShown = false;
  private _connectionLayers?: L.LayerGroup;
  get connectionLayers() {
    this._connectionLayers ??= L.layerGroup().addTo(this.map);
    return this._connectionLayers;
  }

  areMapShrinesShown = false;
  private _mapShrineLayers?: L.LayerGroup;
  get mapShrineLayers() {
    this._mapShrineLayers ??= L.layerGroup().addTo(this.map);
    return this._mapShrineLayers;
  }

  areWingedLightsShown = false;
  private _wingedLightLayers?: L.LayerGroup;
  get wingedLightLayers() {
    this._wingedLightLayers ??= L.layerGroup().addTo(this.map);
    return this._wingedLightLayers;
  }

  // #endregion

  private _icons: { [key: string]: L.Icon } = {};

  get map(): L.Map {
    if (!this._map) { throw new Error('Map not initialized.'); }
    return this._map;
  }

  constructor(
    private readonly _eventService: EventService,
    private readonly _mapService: MapService,
    private readonly _storageService: StorageService,
    private readonly _router: Router,
    private readonly _zone: NgZone
  ) {
    this._subs.add(_eventService.menuFolded.subscribe(() => { this.invalidate(); }));
  }

  initialize(htmlElement: HTMLElement, options?: IMapInit): L.Map {
    if (this._map) { throw new Error('Map already initialized.'); }
    if (options?.fromQuery) { options = this.loadParamsFromQuery(); }
    this._map = this._mapService.createMap(htmlElement, options);
    return this._map;
  }

  isInitialized(): boolean {
    return !!this._map;
  }

  on(event: string, func: any): void {
    this.map.on(event, func);
  }

  enable(): void {
    const map = this.map;
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.touchZoom.enable();
    map.dragging.enable();
  }

  disable(): void {
    const map = this.map;
    map.zoomControl?.remove();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
    map.dragging.disable();
  }

  // #region Map state

  invalidate(): void {
    this.map.invalidateSize();
  }

  loadParamsFromQuery(): IMapInit {
    const searchParams = new URL(location.href).searchParams;
    const x = +(searchParams.get('x') || 270);
    const y = +(searchParams.get('y') || -270);
    const z = +(searchParams.get('z') || 0);
    return {
      view: [y, x],
      zoom: z,
      zoomPanOptions: { animate: false, duration: 0 }
    };
  }

  saveParamsToQuery(): void {
    const url = new URL(location.href);
    const c = this._map?.getCenter();
    if (!c) { return; }
    url.searchParams.set('x', `${Math.floor(c.lng)}`);
    url.searchParams.set('y', `${Math.floor(c.lat)}`);
    url.searchParams.set('z', `${this._map!.getZoom()}`);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  saveParamsToQueryOnMove(): void {
    this.on('moveend', () => this.saveParamsToQuery());
  }

  // #endregion

  // #region Realms

  /** Clears all realms. */
  clearRealms(): void {
    this.realmLayers.clearLayers();
  }

  /** Creates a realm layer. */
  createRealm(realm: IRealm, options: IMapRealmOptions): L.Layer | undefined {
    const mapData = realm.mapData;
    if (!mapData?.boundary) { return; }
    const layers = L.layerGroup();

    // Add boundary
    const poly = L.polygon(mapData.boundary, { color: mapData.boundaryColor || '#ff8a00', weight: 1, fillOpacity: 0 });
    poly.addTo(layers);

    // Add click event.
    options.onClick && poly.addEventListener('click', evt => { options.onClick!(evt); });

    // Add label
    if (options.showLabel) {
      const className = `map-label-realm map-label-realm-${mapData.boundaryLabelAlign || 'center'}`;
      L.marker(mapData.boundary[0], {
        icon: L.divIcon({
          className,
          html: `<span>${realm.name}</span>`
        })
      }).addTo(layers);
    }

    return layers;
  }

  /** Adds a realm to the map. */
  addRealm(realm: IRealm, options: IMapRealmOptions): void {
    const layers = this.createRealm(realm, options);
    layers?.addTo(this.realmLayers);
  }

  /** Toggles visibility of realms. */
  toggleRealms(show?: boolean): void {
    show ??= !this.areRealmsShown;
    show ? this.realmLayers.addTo(this.map) : this.realmLayers.remove();
    this.areRealmsShown = show;
  }

  // #endregion

  // #region Areas

  /** Clears all areas. */
  clearAreas(): void {
    this.areaLayers.clearLayers();
  }

  /** Creates an area layer. */
  createArea(area: IArea, options: IMapAreaOptions): L.Layer | undefined
  {
    if (!area.mapData?.position) { return; }

    const icon = options.icon || '/assets/icons/symbols/location_on_orange.svg';
    this._icons[icon] ??= L.icon({
      iconUrl: icon,
      iconSize: [24, 24],
      popupAnchor: [0, -12],
    });
    let areaIcon = this._icons[icon];

    const marker = L.marker(area.mapData!.position!, {
      icon: areaIcon,
      opacity: this._storageService.hasMapMarker(area.guid) ? opacityFound : 1
    });

    const popup = new L.Popup({
      content: _marker => {
        const div = this.ttFlex();
        div.appendChild(this.ttArea(area));
        const divGrid = this.ttGrid();
        divGrid.appendChild(this.ttSpirits(area.spirits || [], () => { this._router.navigate(['/spirit'], { queryParams: { area: area.guid }});}));
        divGrid.appendChild(this.ttWingedLights(area.wingedLights || [], () => { this._router.navigate(['/col'], { queryParams: { area: area.guid }});}));
        div.appendChild(divGrid);
        return div;
      }
    });
    marker.bindPopup(popup);

    options.onClick && marker.addEventListener('click', evt => {
      options.onClick!(evt);
      popup.openOn(this.map);
    });

    const layers = L.layerGroup();
    layers.addLayer(marker);
    return layers;
  }

  /** Adds an area to the map. */
  addArea(area: IArea, options: IMapAreaOptions): void {
    const layers = this.createArea(area, options);
    layers?.addTo(this.areaLayers);
  }

  /** Toggles visibility of areas. */
  toggleAreas(show?: boolean): void {
    show ??= !this.areAreasShown;
    show ? this.areaLayers.addTo(this.map) : this.areaLayers.remove();
  }

  // #endregion

  // #region Area Connections

  /** Clears all connections between areas. */
  clearConnections(): void {
    this.connectionLayers.clearLayers();
  }

  /** Adds connections between areas. */
  addAreaConnections(area: Maybe<IArea>, options: IMapAreaOptions): void {
    if (!area?.connections?.length) { return; }

    const layers = L.layerGroup().addTo(this.connectionLayers);
    area.connections?.forEach(connection => {
      if (!connection.area.mapData?.position) { return; }
      // Add yellow marker over the selected area.
      this.createArea(area, {
        icon: '/assets/icons/symbols/location_on_yellow.svg',
        onClick: () => { this.clearConnections();  }
      })?.addTo(layers);
      const line = L.polyline([area.mapData!.position!, connection.area.mapData.position], {color: '#fff', weight: 2  });
      line.addTo(layers);
    });
  }

  /** Toggles visibility of area connections. */
  toggleConnections(show?: boolean): void {
    show ??= !this.areConnectionsShown;
    show ? this.connectionLayers.addTo(this.map) : this.connectionLayers.remove();
    this.areConnectionsShown = show;
  }

  // #endregion

  // #region Map Shrines

  /** Clears all map shrines. */
  clearMapShrines(): void {
    this.mapShrineLayers.clearLayers();
  }

  /** Creates a map shrine layer. */
  createMapShrine(shrine: IMapShrine, options: {}): L.Layer | undefined {
    if (!shrine.mapData?.position) { return; }

    this._icons['map-shrine'] ??= L.icon({
      iconUrl: 'assets/icons/map-shrine.svg',
      iconSize: [24, 24],
      popupAnchor: [0, -12],
    });

    const marker = L.marker(shrine.mapData!.position!, {
      icon: this._icons['map-shrine'],
      opacity: this._storageService.hasMapMarker(shrine.guid) ? opacityFound : 1
    });

    const popup = new L.Popup({
      content: _marker => {
        const div = this.ttFlex();
        div.appendChild(this.ttFound(shrine.guid, marker));
        div.appendChild(this.ttArea(shrine.area));
        shrine.imageUrl && div.appendChild(this.ttImg(shrine.imageUrl));
        return div;
      }
    });
    marker.bindPopup(popup);

    const layers = L.layerGroup();
    marker.addTo(layers);
    return layers;
  }

  /** Adds a map shrine to the map. */
  addMapShrine(shrine: IMapShrine, options: {}): void {
    const layers = this.createMapShrine(shrine, options);
    layers?.addTo(this.mapShrineLayers);
  }

  /** Toggles visibility of the map shrines. */
  toggleMapShrines(show?: boolean): void {
    show ??= !this.areMapShrinesShown;
    show ? this.mapShrineLayers.addTo(this.map) : this.mapShrineLayers.remove();
    this.areMapShrinesShown = show;
  }

  // #endregion

  // #region Winged Light

  /** Clears all winged lights. */
  clearWingedLights(): void {
    this.wingedLightLayers.clearLayers();
  }

  createWingedLight(wl: IWingedLight, options: IMapWingedLightOptions): L.Layer | undefined {
    if (!wl.mapData?.position) { return; }

    this._icons['wl'] ??= L.icon({
      iconUrl: 'assets/icons/light.svg',
      iconSize: [32, 32],
      popupAnchor: [0, -12]
    });

    const marker = L.marker(wl.mapData!.position!, {
      icon: this._icons['wl'],
      opacity: wl.unlocked ? opacityFound : 1,
    });

    const popup = new L.Popup({
      content: _marker => {
        const div = this.ttFlex();
        div.insertAdjacentHTML('beforeend', '<div class="container s-leaflet-item">Winged Light</div>');
        div.appendChild(this.ttWingedLight(wl));
        return div;
      }
    });
    marker.bindPopup(popup);

    const layers = L.layerGroup();
    marker.addTo(layers);
    return layers;
  }

  /** Adds a winged light to the map. */
  addWingedLight(wl: IWingedLight, options: IMapWingedLightOptions): void {
    const layers = this.createWingedLight(wl, options);
    layers?.addTo(this.wingedLightLayers);
  }

  toggleWingedLights(show?: boolean): void {
    show ??= !this.areWingedLightsShown;
    show ? this.wingedLightLayers.addTo(this.map) : this.wingedLightLayers.remove();
    this.areWingedLightsShown = show;
  }

  // #endregion

  // #region Tooltip elements

  ttFlex(): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('s-leaflet-tooltip', 's-leaflet-flex');
    return div;
  }

  ttGrid(): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('s-leaflet-grid');
    return div;
  }

  ttFound(guid: string, marker: L.Marker): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('container', 'point', 's-leaflet-item');
    const divIcon = document.createElement('div');
    divIcon.classList.add('menu-icon', 's-leaflet-maticon');
    divIcon.innerText = this._storageService.hasMapMarker(guid) ? 'check_box' : 'check_box_outline_blank';
    div.appendChild(divIcon);
    div.insertAdjacentHTML('beforeend', `<div class="menu-label">Found</div>`);

    div.addEventListener('click', () => {
      const found = !this._storageService.hasMapMarker(guid);
      if (found) {
        this._storageService.addMapMarkers(guid);
        divIcon.innerText = 'check_box';
        marker.setOpacity(opacityFound);
      } else {
        this._storageService.removeMapMarkers(guid);
        divIcon.innerText = 'check_box_outline_blank';
        marker.setOpacity(1);
      }
    });

    return div;
  }

  ttSpirits(spirits: Array<ISpirit>, click: () => void): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('container', 'link', 's-leaflet-item');
    div.addEventListener('click', () => { click(); });

    const divLabel = document.createElement('div');
    divLabel.classList.add('ws-nw');
    divLabel.innerText = `${spirits.length} ${spirits.length === 1 ? 'spirit' : 'spirits'}`;
    div.appendChild(divLabel);

    return div;
  }

  ttWingedLights(wls: Array<IWingedLight>, click: () => void): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('container', 'link', 's-leaflet-item');
    div.addEventListener('click', () => { click(); });

    const divLabel = document.createElement('div');
    divLabel.classList.add('ws-nw');
    divLabel.innerText = `${wls.length} winged light`;
    div.appendChild(divLabel);

    return div;
  }

  ttWingedLight(wl: IWingedLight): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('container', 'link', 's-leaflet-item');
    div.addEventListener('click', () => { this._router.navigate(['/col'], { queryParams: { wl: wl.guid }}); });
    div.insertAdjacentHTML('beforeend', `<div class="menu-icon s-leaflet-maticon">arrow_forward</div><div class="menu-label">Go to tracker</div>`);
    return div;
  }

  ttRealm(realm: IRealm): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('container', 'link', 's-leaflet-item');
    div.addEventListener('click', () => { this._router.navigate(['/realm', realm.guid]); });
    div.insertAdjacentHTML('beforeend', `<div class="menu-icon s-leaflet-maticon">map</div><div class="menu-label">${realm.name || ''}</div>`);
    return div;
  }

  ttArea(area: IArea): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('container', 'link', 's-leaflet-item');
    div.addEventListener('click', () => { this._router.navigate(['/area', area.guid]); });
    div.insertAdjacentHTML('beforeend', `<div class="menu-icon s-leaflet-maticon">location_on</div><div class="menu-label">${area.name || ''}</div>`);
    return div;
  }

  ttImg(imgUrl: string): HTMLElement {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.width = 270;
    img.classList.add('s-leaflet-image', 'br');
    img.addEventListener('dblclick', () => {
      try {
        const url = new URL(img.src);
        window.open(url.href, '_blank');
      } catch { return; }
    });
    return img;
  }

  // #endregion

  ngOnDestroy(): void {
    this._subs.unsubscribe();
    this._map?.off();
    this._map?.remove();
    this._map = undefined;
  }
}
