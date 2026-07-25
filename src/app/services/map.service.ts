import { Injectable, inject } from '@angular/core';
import L, { LatLngTuple } from 'leaflet';
import { SettingService } from './setting.service';

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
  private readonly _settingService = inject(SettingService);

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
      maxNativeZoom: 3,
      bounds: [[0, 0], [-540, 540]]
    }).addTo(map);

    // Add zoom controls.
    const zoom = L.control.zoom({ position: 'bottomright' });
    zoom.addTo(map);

    // Copy the clicked coordinates to the clipboard.
    map.on('click', e => {
      if (!this._settingService.debugMapCopyCoordinates) { return; }
      const coords = JSON.stringify([+e.latlng.lat.toFixed(2), +e.latlng.lng.toFixed(2)]);
      navigator.clipboard.writeText(coords);
      console.log('Copied map coordinates:', coords);
    });

    return map;
  }
}
