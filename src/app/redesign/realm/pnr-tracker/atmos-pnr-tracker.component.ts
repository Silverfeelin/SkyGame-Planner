import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import L from 'leaflet';
import { pnrMarkers } from '@app/components/pnr-tracker/pnr-tracker-markers';

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
  selector: 'app-atmos-pnr-tracker',
  templateUrl: './atmos-pnr-tracker.component.html',
  styleUrl: './atmos-pnr-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbTooltip, MatIcon]
})
export class AtmosPnrTrackerComponent implements AfterViewInit {
  @ViewChild('map', { static: true }) private mapDiv!: ElementRef<HTMLDivElement>;

  map: L.Map | undefined;
  markers: Array<IStatueMarker> = [];

  readonly countTotal = pnrMarkers.length;
  readonly countFound = signal(0);
  readonly isNavigationEnabled = signal(true);

  private _navCurrentZoom = 0;
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
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

    this.map.zoomControl?.remove();
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

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
      const statueMarker: IStatueMarker = { index: i++, marker, found: false };
      this.markers.push(statueMarker);

      marker.addEventListener('click', () => {
        this.updateMarker(statueMarker, !statueMarker.found);
        this.countFound.set(this.markers.filter(m => m.found).length);
        this._changeDetectorRef.markForCheck();
        if (statueMarker.found && this.isNavigationEnabled()) {
          this.navigateNext();
        }
      });
    }

    L.polyline(pnrMarkers, { color: '#0ff', weight: 3 }).addTo(this.map);
  }

  showHelp(): void {
    alert('Click on a statue marker to mark it as found. If you enable navigation, the map moves to the next statue automatically.\n\n' +
          'You can reset your progress by clicking the reset button.');
  }

  toggleNavigation(): void {
    this.isNavigationEnabled.update(v => !v);
    if (this.isNavigationEnabled()) { this.navigateNext(1); }
  }

  promptReset(): void {
    if (!confirm('Are you sure you want to reset your progress?')) { return; }
    this.markers.forEach(marker => this.updateMarker(marker, false));
    this.countFound.set(0);
    this.map?.setView(pnrMarkers[0], 0);
  }

  private updateMarker(value: IStatueMarker, found: boolean): void {
    value.found = found;
    value.marker.setOpacity(value.found ? 0.6 : 1);
    value.marker.setIcon(value.found ? markerFoundIcon : markerIcon);
  }

  private navigateNext(zoom?: number): void {
    const m = this.markers.find(marker => !marker.found);
    if (!m) { return; }
    this.map?.flyTo(m.marker.getLatLng(), zoom ?? this._navCurrentZoom, { duration: 0.3 });
  }
}
