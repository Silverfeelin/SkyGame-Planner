import { Injectable, OnDestroy } from '@angular/core';
import L, { LatLngExpression } from 'leaflet';
import { EventService } from './event.service';
import { filter } from 'rxjs';
import { SubscriptionBag } from '../helpers/subscription-bag';

export class MapDisposable {

}

@Injectable({
  providedIn: 'root'
})
export class MapService implements OnDestroy {
  _div?: HTMLElement;
  _map?: L.Map;
  _zoom?: L.Control.Zoom;

  private _subs = new SubscriptionBag();

  constructor(
    private readonly _eventService: EventService
  ) {
    this._subs.add(_eventService.menuFolded.subscribe(() => { this.invalidate(); }));
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  getMap(): L.Map {
    if (!this._map) { this._map = this.initialize(); }
    return this._map;
  }

  invalidate(): void {
    this._map?.invalidateSize();
  }

  /** Attaches the map by moving it into an element. */
  attach(htmlElement: HTMLElement): L.Map | undefined {
    if (!this._div) { return this._map; }
    htmlElement.appendChild(this._div);
    this._map?.invalidateSize();
    this._map?.setView([-270,270], 1, { animate: false, duration: 0 });
    return this._map;
  }

  /* Detaches the map from the current element. */
  detach(): void {
    document.body.appendChild(this._div!);
    this._map?.closePopup();
    this._map?.invalidateSize();
    this.enable();
  }

  enable(): void {
    if (!this._map) { return; }
    this._map.scrollWheelZoom.enable();
    this._map.doubleClickZoom.enable();
    this._map.boxZoom.enable();
    this._map.keyboard.enable();
    this._map.touchZoom.enable();
    this._map.dragging.enable();
  }

  disable(): void {
    if (!this._map) { return; }
    this._zoom?.remove();
    this._map.scrollWheelZoom.disable();
    this._map.doubleClickZoom.disable();
    this._map.boxZoom.disable();
    this._map.keyboard.disable();
    this._map.touchZoom.disable();
    this._map.dragging.disable();
  }

  private initialize(): L.Map {
    if (this._map) { return this._map; }

    this._div = document.createElement('div');
    this._div.classList.add('map');
    document.body.appendChild(this._div);

    const map = L.map(this._div, {
      attributionControl: false,
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 4,
      center: [-270, 270],
      maxBounds: [[270, -270], [-810, 810]],
      zoomControl: false
    }).setView([-270,270], 1);

    // Add images to map.
    L.tileLayer('assets/game/map/{z}/{x}_{y}.webp', {
      tileSize: 540,
      bounds: [[0, 0], [-540, 540]]
    }).addTo(map);

    // Add zoom controls.
    this._zoom = L.control.zoom({ position: 'bottomright' });
    this._zoom.addTo(map);

    const mapcopy = document.cookie.split(';').find(c => c.includes('mapcopy='))?.split('=')[1];
    if (mapcopy !== undefined) {
      map.on('click', e => {
        console.log(e);
        navigator.clipboard.writeText(mapcopy + JSON.stringify([+e.latlng.lat.toFixed(2), +e.latlng.lng.toFixed(2)]));
      });
    }

    const c = 'color:cyan;';
    (window as any).map = map;
    console.log('Map initialized as %cwindow.map%c.', c, '');
    return map;
  }
}
