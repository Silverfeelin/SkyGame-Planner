import { Injectable } from '@angular/core';
import L, { LatLngTuple } from 'leaflet';

export interface IMapInit {
  /** Initializes the map from the URL query parameters. */
  fromQuery?: boolean;
  view?: LatLngTuple;
  zoom?: number;
  zoomPanOptions?: L.ZoomPanOptions;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  createMap(htmlElement: HTMLElement, options?: IMapInit): L.Map {
    options ??= {
      view: [-270, 270],
      zoom: 0,
      zoomPanOptions: { animate: false, duration: 0 }
    };

    htmlElement.classList.add('map');
    const map = L.map(htmlElement, {
      attributionControl: false,
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 4,
      center: [-270, 270],
      maxBounds: [[270, -270], [-810, 810]],
      zoomControl: false
    });

    if (options.view) {
      map.invalidateSize();
      map.setView(options.view, options.zoom, options.zoomPanOptions);
      setTimeout(() => {
        map.invalidateSize();
        map.setView(options.view!, options.zoom, options.zoomPanOptions);
      }, 0);
    }

    // Add images to map.
    L.tileLayer('assets/game/map/{z}/{x}_{y}.webp', {
      tileSize: 540,
      bounds: [[0, 0], [-540, 540]]
    }).addTo(map);

    // Add zoom controls.
    const zoom = L.control.zoom({ position: 'bottomright' });
    zoom.addTo(map);

    // document.cookie='mapcopy=1';
    const mapcopy = document.cookie.split(';').find(c => c.includes('mapcopy='));
    if (mapcopy !== undefined) {
      map.on('click', e => {
        console.log(e);
        const f = 2;
        const format = `,
"mapData": { "position": {0} }`;
        const coords = JSON.stringify([+e.latlng.lat.toFixed(f), +e.latlng.lng.toFixed(f)]);
        navigator.clipboard.writeText(`${format.replace('{0}', coords)}`);
      });
    }

    return map;
  }
}
