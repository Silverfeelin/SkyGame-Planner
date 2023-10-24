import { Injectable } from '@angular/core';
import L, { LatLngExpression } from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  _div?: HTMLElement;
  _map?: L.Map;

  getMapCenter(): LatLngExpression {
    return [-270, 270];
  }

  getMap(): L.Map {
    if (!this._map) { this._map = this.initialize(); }
    return this._map;
  }

  /** Attaches the map by moving it into an element. */
  attach(htmlElement: HTMLElement): void {
    if (!this._div) { return; }
    htmlElement.appendChild(this._div);
    this._map?.invalidateSize();
    this._map?.setView([-270,270], 1, { animate: false, duration: 0 });
  }

  /* Detaches the map from the current element. */
  detach(): void {
    document.body.appendChild(this._div!);
    this._map?.closePopup();
    this._map?.invalidateSize();
  }

  private initialize(): L.Map {
    if (this._map) { return this._map; }

    this._div = document.createElement('div');
    this._div.classList.add('map');
    document.body.appendChild(this._div);

    const map = L.map(this._div, {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 3,
      center: [-270, 270],
      maxBounds: [[100, -100], [-640, 640]],
      zoomControl: false
    }).setView([-270,270], 1);

    // Add images to map.
    L.tileLayer('assets/game/map/{z}/{x}_{y}.webp', {
      tileSize: 540,
      bounds: [[0, 0], [-540, 540]],
      attribution: 'Map &copy; <a href="https://www.thatskygame.com/" target="_blank">Sky: Children of the Light</a>'
    }).addTo(map);
    // L.imageOverlay('assets/game/map.webp', [[-2160, -2160], [2160, 2160]], {
    //   attribution: 'Map &copy; <a href="https://www.thatskygame.com/" target="_blank">Sky: Children of the Light</a>',
    // }).addTo(map);

    // Add zoom controls.
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const mapcopy = document.cookie.split(';').find(c => c.includes('mapcopy='))?.split('=')[1];
    if (mapcopy !== undefined) {
      map.on('click', e => {
        console.log(e);
        navigator.clipboard.writeText(mapcopy + JSON.stringify([+e.latlng.lat.toFixed(2), +e.latlng.lng.toFixed(2)]));
      });
    }

    return map;
  }
}
