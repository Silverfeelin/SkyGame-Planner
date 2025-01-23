import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import L from 'leaflet';
import { authenticate, handleRedirect } from './dye-discord';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';

type ClickMode = 'none' | 'addMarker';

interface IRequestBody {
  type?: 'marker' | 'plant';
  epoch: number;
  markerId?: string;
  lat?: number;
  lng?: number;
}

interface IDyePlantMarker {
  id: number;
  epoch: number;
  userId: number;
  lat: number;
  lng: number;
}

interface IDyePlant {
  id: number;
  markerId: number;
  epoch: number;
  userId: number;
  date: string;
}

interface IMapData {
  markers: { items: Array<IDyePlantMarker> }
}

interface IPlantData {
  plants: { items: Array<IDyePlant> }
}

const markerIcon = L.icon({
  iconUrl: 'assets/icons/symbols/location_on_orange.svg',
  iconSize: [32, 32],
  popupAnchor: [0, -12],
});


@Component({
  selector: 'app-dye-farm-data-component',
  standalone: true,
  imports: [ MatIcon ],
  templateUrl: './dye-farm-data-component.component.html',
  styleUrl: './dye-farm-data-component.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DyeFarmDataComponentComponent implements OnInit {
  @ViewChild('map', { read: ElementRef, static: false }) mapDiv!: ElementRef<HTMLDivElement>;

  clickMode: ClickMode = 'none';
  accessToken?: string;
  map?: L.Map;
  busy = false;

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.accessToken = sessionStorage.getItem('dsc-accessToken') || undefined;
    if (this.accessToken) {
      setTimeout(() => {
        this.loadMap();
      });
    }
  }

  ngOnInit(): void {
    const url = new URL(location.href);
    const code = url.searchParams.get('code');
    if (code) {
      history.replaceState({}, '', location.pathname);
      handleRedirect(code).then(token => {
        this.accessToken = token;
        sessionStorage.setItem('dsc-accessToken', token || '');
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
          this.loadMap();
        })
      });
    }
  }

  loadMap(): void {
    this.mapDiv.nativeElement.classList.add('map');
    const imgSize: L.LatLngTuple = [ 4320, 4320 ];
    this.map = L.map(this.mapDiv.nativeElement, {
      attributionControl: false,
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 4,
      zoom: -1,
      center: [ imgSize[0] / 2, imgSize[1] / 2 ],
      zoomControl: false
    });

    // Add images to map.
    L.imageOverlay('assets/game/map/map_lowres.webp', [[0,0], imgSize]).addTo(this.map);

    // Add zoom controls.
    const zoom = L.control.zoom({ position: 'bottomright' });
    zoom.addTo(this.map);

    this.map.on('mousemove', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      window.document.title = `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`;
    });

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      switch (this.clickMode) {
        case 'addMarker': this.addMarker(event); break;
        default: break;
      }
    });

    this.loadData();
  }

  async loadData(): Promise<void> {
    const response = await fetch('/api/dyes', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    const data = await response.json() as IMapData;
    console.log('Data:', data);

    data.markers.items.forEach(marker => {
      this.mapAddMarker(marker);
    });
  }

  async authenticate(): Promise<void> {
    await authenticate();
  }

  toggleAddMarker(evt: Event): void {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.clickMode = this.clickMode === 'addMarker' ? 'none' : 'addMarker';
  }

  async addMarker(event: L.LeafletMouseEvent): Promise<void> {
    if (this.busy) { return; }

    this.busy = true;
    const { lat, lng } = event.latlng;
    const requestBody: IRequestBody = {
      type: 'marker', epoch: Date.now(), lat, lng
    };

    fetch('/api/dyes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Marker added:', data);
      this.busy = false;
      this.clickMode = 'none';
      this._changeDetectorRef.markForCheck();

      const marker: IDyePlantMarker = {
        id: data.id,
        userId: data.userId,
        lat: requestBody.lat!,
        lng: requestBody.lng!,
        epoch: requestBody.epoch
      };
      this.mapAddMarker(marker);
    })
    .catch(error => {
      console.error('Error adding marker:', error);
      this.busy = false;
    });
  }

  async addPlant(markerId: number, epoch: number): Promise<void> {
    const requestBody: IRequestBody = {
      type: 'plant', epoch, markerId: markerId.toString()
    };

    fetch('/api/dyes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Plant added:', data);
      alert('Plant added successfully.');
    })
    .catch(error => {
      console.error('Error adding plant:', error);
      alert('Error adding plant. See console for details.');
    });
  }

  mapAddMarker(marker: IDyePlantMarker): void {
    if (!this.map) { return; }
    const m = L.marker([marker.lat, marker.lng], { icon: markerIcon });
    m.addTo(this.map);

    const div = document.createElement('div');
    div.classList.add('dye-data-popup');

    const popup = L.popup({
      content: () => {
        div.dataset['markerId'] = marker.id.toString();
        div.innerHTML = `
          <span>Loading...</span>
        `;
        return div;
      },
    });
    m.bindPopup(popup);

    m.on('popupopen', async () => {
      try {
        const response = await fetch(`/api/dyes?markerId=${marker.id}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
        });
        const data = await response.json() as IPlantData;
        console.log('Popup data:', data);

        div.innerHTML = '';

        const divAdd = document.createElement('div');
        div.appendChild(divAdd);
        const buttonAdd = document.createElement('button');
        divAdd.appendChild(buttonAdd);
        buttonAdd.textContent = 'Add dye plant';
        buttonAdd.addEventListener('click', () => {
          const timestamp = prompt('Please enter a Discord timestamp (i.e. <t:1737591240:t>)');
          const match = timestamp?.match(/<t:(\d+):\w>/);
          if (!match) { alert('Invalid timestamp format.'); return; }

          let epoch = parseInt(match[1], 10);
          if (isNaN(epoch)) { alert('Invalid timestamp format.'); return; }

          let date = DateTime.fromMillis(epoch * 1000);
          date = date.startOf('hour');
          epoch = date.toSeconds();

          this.addPlant(marker.id, epoch);
          this.map?.closePopup(popup);
        });

        const grid = document.createElement('div');
        div.appendChild(grid);
        grid.style.display = 'grid';
        grid.classList.add('dye-data-grid');
        grid.style.gridTemplateColumns = '1fr 1fr';

        grid.innerHTML = `
          <div class="dye-data-cell fw-bold">Local</div>
          <div class="dye-data-cell fw-bold">Sky</div>
        `;

        data.plants.items.sort((a, b) => a.epoch - b.epoch);
        data.plants.items.forEach(plant => {
          const date = DateTime.fromMillis(plant.epoch * 1000);
          const skyDate = date.setZone(DateHelper.skyTimeZone);

          const cell1 = document.createElement('div');
          cell1.classList.add('dye-data-cell');
          cell1.textContent = date.toFormat('yyyy-MM-dd HH:00');
          grid.appendChild(cell1);

          const cell2 = document.createElement('div');
          cell2.classList.add('dye-data-cell');
          cell2.textContent = skyDate.toFormat('yyyy-MM-dd HH:00');
          grid.appendChild(cell2);
        });

      } catch (e) {
        alert('Loading failed. See console for details.');
        console.error(e);
      }
    });
  }
}
