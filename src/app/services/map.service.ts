import { Injectable } from '@angular/core';
import L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  initialize(div: HTMLElement): L.Map {
    div.classList.add('map');
    const map = L.map(div, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 1,
      maxBounds: [[-3000, -3000], [3000, 3000]],
      zoomControl: false
    }).setView([-1000,0], -1);

    // Add images to map.
    L.imageOverlay('assets/game/map.webp', [[-2160, -2160], [2160, 2160]], {
      attribution: 'Map &copy; <a href="https://www.thatskygame.com/" target="_blank">Sky: Children of the Light</a>',
    }).addTo(map);

    // Add zoom controls.
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const mapcopy = document.cookie.split(';').find(c => c.includes('mapcopy='))?.split('=')[1];
    if (mapcopy !== undefined) {
      map.on('click', e => {
        console.log(e);
        navigator.clipboard.writeText(mapcopy + JSON.stringify([Math.floor(e.latlng.lat), Math.floor(e.latlng.lng)]));
      });
    }

    return map;
  }
}
