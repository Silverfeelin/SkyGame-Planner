import { Injectable, OnDestroy } from '@angular/core';
import { MapService } from './map.service';
import L from 'leaflet';

@Injectable()
export class MapInstanceService implements OnDestroy {
  _map: L.Map;

  _groups: { [key: string]: L.LayerGroup } = {};
  _funcs = new Array<[string, any]>();

  constructor(
    private readonly _mapService: MapService
  ) {
    this._map = this._mapService.getMap();
  }

  attach(div: HTMLElement): L.Map {
    return this._mapService.attach(div)!;
  }

  on(event: string, func: any): void {
    this._funcs.push([event, func]);
    this._map.on(event, func);
  }


  centerMap(zoom = 1): void {
    this._map.flyTo([-270, 270], zoom, { animate: false, duration: 0 });
  }

  createLayerGroup(key: string, active = true): L.LayerGroup {
    this._groups[key]?.remove();
    this._groups[key] = L.layerGroup();
    active && this._mapService.getMap().addLayer(this._groups[key]);
    return this._groups[key];
  }

  getLayerGroup(key: string): L.LayerGroup {
    return this._groups[key];
  }

  ngOnDestroy(): void {
    Object.values(this._groups).forEach(l => l.remove());
    this._funcs.forEach(f => { this._map.off(f[0], f[1]); })
    this._mapService.detach();
  }
}
