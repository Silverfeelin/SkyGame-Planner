import { AfterViewInit, ChangeDetectorRef, Component, effect, ElementRef, inject, NgZone, ViewChild, viewChild } from '@angular/core';
import L from 'leaflet';
import { pnrMarkers } from './pnr-tracker-markers';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatIcon } from '@angular/material/icon';

const markerIcon = L.icon({
  iconUrl: 'assets/icons/symbols/location_on_orange.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -12],
});

const markerFoundIcon = L.icon({
  iconUrl: 'assets/icons/symbols/location_on_green.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -12],
});

interface IStatueMarker {
  index: number;
  marker: L.Marker;
  found: boolean;
}

@Component({
  selector: 'app-pnr-tracker',
  imports: [ NgbTooltip, MatIcon],
  templateUrl: './pnr-tracker.component.html',
  styleUrl: './pnr-tracker.component.scss'
})
export class PnrTrackerComponent implements AfterViewInit{
  @ViewChild('map', { static: true }) private mapDiv!: ElementRef<HTMLDivElement>;
  map: L.Map | undefined;
  markers: Array<IStatueMarker> = [];

  isNavigationEnabled = true;
  _navCurrentZoom = 0;
  countFound = 0;
  countTotal = pnrMarkers.length;

  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    const div = this.mapDiv?.nativeElement;
    this.map = L.map(div, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 1
    });
    this.map.attributionControl.setPrefix('');
    this.map.doubleClickZoom.disable();

    this.map.on('zoomend', () => {
      this._navCurrentZoom = this.map?.getZoom() ?? 0;
    });

    // Add zoom controls.
    this.map.zoomControl?.remove();
    const zoom = L.control.zoom({ position: 'bottomright' });
    zoom.addTo(this.map);

    // Add image
    const bounds: L.LatLngBoundsExpression = [[0, 0], [3500, 1240]];
    L.imageOverlay('/assets/external/solsuga/pnr.webp', bounds, {
      attribution: 'Map by @sky_solsuga'
    }).addTo(this.map);
    this.map.setView([150, 100], 0);

    const firstMarker = pnrMarkers[0];
    this.map.setView(firstMarker, 0);

    let i = 0;
    for (const coords of pnrMarkers) {
      const marker = L.marker(coords, { icon: markerIcon }).addTo(this.map);

      const statueMarker: IStatueMarker = {
        index: i++,
        marker,
        found: false
      };
      this.markers.push(statueMarker);

      marker.addEventListener('click', () => {
        this.updateMarker(statueMarker, !statueMarker.found);
        this.countFound = this.markers.filter((m) => m.found).length;
        this._changeDetectorRef.markForCheck();
        if (statueMarker.found && this.isNavigationEnabled) {
          this.navigateNext();
        }
      });
    }

    // Path line
    L.polyline(pnrMarkers, { color: '#0ff', weight: 3 }).addTo(this.map);
  }

  promptReset() {
    if (!confirm('Are you sure you want to reset your progress?')) { return; }
    this.markers.forEach((marker) => {
      this.updateMarker(marker, false);
    });
    this.countFound = 0;
    this.map?.setView(pnrMarkers[0], 0);
  }

  updateMarker(value: IStatueMarker, found: boolean): void {
    value.found = found;
    value.marker.setOpacity(value.found ? 0.6 : 1);
    value.marker.setIcon(value.found ? markerFoundIcon : markerIcon);
  }

  navigateNext(): void {
    const m = this.markers.find((marker) => !marker.found);
    if (!m) { return; }

    this.map?.flyTo(m.marker.getLatLng(), this._navCurrentZoom, { duration: 0.3 });
  }
}
