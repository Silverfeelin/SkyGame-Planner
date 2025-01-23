import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, viewChild, ViewChildren } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import L from 'leaflet';
import { authenticate, handleRedirect } from './dye-discord';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';

type ClickMode = 'none' | 'addMarker';

interface IRequestBody {
  type?: 'marker' | 'plant';
  epoch: number;
  markerId?: number;
  lat?: number;
  lng?: number;
  size?: number;
  roots?: number;
  red?: number;
  yellow?: number;
  green?: number;
  cyan?: number;
  blue?: number;
  purple?: number;
  black?: number;
  white?: number;
}

interface IDbMarker {
  id: number;
  userId: string;
  username: string;
  lat: number;
  lng: number;
  createdOn: string;
  deleted: boolean;
  deletedOn?: string;
  deletedBy?: number;
}

interface IDbPlant {
  id: number;
  userId: string;
  username: string;
  epoch: number;
  markerId: number;
  size?: number;
  roots?: number;
  red?: number;
  yellow?: number;
  green?: number;
  cyan?: number;
  blue?: number;
  purple?: number;
  black?: number;
  white?: number;
  createdOn: string;
  deleted: boolean;
  deletedOn?: string;
  deletedBy?: string;
}
interface IMapData {
  items: Array<IDbMarker>;
}

interface IPlantData {
  items: Array<IDbPlant>;
}

const markerIcon = L.icon({
  iconUrl: 'assets/icons/symbols/location_on_orange.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -12],
});


@Component({
  selector: 'app-dye-farm-data-component',
  standalone: true,
  imports: [ MatIcon, OverlayComponent ],
  templateUrl: './dye-farm-data-component.component.html',
  styleUrl: './dye-farm-data-component.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DyeFarmDataComponentComponent implements OnInit {
  @ViewChild('map', { static: false }) mapDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('tPopup', { static: true }) tPopup!: ElementRef<HTMLTemplateElement>;

  @ViewChild('inpTime', { static: false }) inpTime!: ElementRef<HTMLInputElement>;
  @ViewChild('inpRoots', { static: false }) inpRoots!: ElementRef<HTMLInputElement>;
  @ViewChildren('inpButterfly') inpButterflies!: QueryList<ElementRef<HTMLInputElement>>;

  clickMode: ClickMode = 'none';
  accessToken?: string;
  map?: L.Map;
  marker?: L.Marker;
  popup?: L.Popup;

  isAddingData = false;
  addDataMarkerId?: number;
  addData: Partial<IDbPlant> = {};

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
    const areaSize: L.LatLngTuple = [ 590, 960 ];
    const padding = 40;
    const gridSize = [ 5, 6 ];
    const mapSize = [ areaSize[0] * gridSize[0], areaSize[1] * gridSize[1] ];
    this.map = L.map(this.mapDiv.nativeElement, {
      attributionControl: false,
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 3,
      zoom: -2,
      center: [ mapSize[0] / 2, mapSize[1] / 2 ],
      maxBounds: [[ -3000, -3000], [ mapSize[0] + 3000, mapSize[1] + 3000 ]],
      zoomControl: false
    });

    // Add images to map.
    const addMap = (url: string, py: number, px: number): void => {
      const y = py * areaSize[0] + padding * py;
      const x = px * areaSize[1] + padding * px;
      L.imageOverlay(url, [[ y, x ], [ y+ areaSize[0], x + areaSize[1]]]).addTo(this.map!);
    };
    addMap('/assets/game/dye-data/5a.jpg', 0, 0);
    addMap('/assets/game/dye-data/5b.jpg', 0, 1);
    addMap('/assets/game/dye-data/5c.jpg', 0, 2);
    addMap('/assets/game/dye-data/4a.jpg', 1, 0);
    addMap('/assets/game/dye-data/4b.jpg', 1, 1);
    addMap('/assets/game/dye-data/4c.jpg', 1, 2);
    addMap('/assets/game/dye-data/4d.jpg', 1, 3);
    addMap('/assets/game/dye-data/3a.jpg', 2, 0);
    addMap('/assets/game/dye-data/3b.jpg', 2, 1);
    addMap('/assets/game/dye-data/3c.jpg', 2, 2);
    addMap('/assets/game/dye-data/2a.jpg', 3, 0);
    addMap('/assets/game/dye-data/2b.jpg', 3, 1);
    addMap('/assets/game/dye-data/1a.jpg', 4, 0);
    addMap('/assets/game/dye-data/1b.jpg', 4, 1);
    addMap('/assets/game/dye-data/1c.jpg', 4, 2);
    addMap('/assets/game/dye-data/1d.jpg', 4, 3);
    addMap('/assets/game/dye-data/1e.jpg', 4, 4);
    addMap('/assets/game/dye-data/1f.jpg', 4, 5);
    addMap('/assets/game/dye-data/1g.webp', 4, 6);
    addMap('/assets/game/dye-data/1h.webp', 4, 7);
    // Add zoom controls.
    const zoom = L.control.zoom({ position: 'bottomright' });
    zoom.addTo(this.map);

    this.map.on('mousemove', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      window.document.title = `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`;
    });

    this.map.on('click', async (event: L.LeafletMouseEvent) => {
      try {
        switch (this.clickMode) {
          case 'addMarker': await this.addMarkerAsync(event); break;
          default: break;
        }
      } catch (error) {
        console.error('Error adding marker:', error);
        alert('An error occurred. See console for details.');
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

    data.items.forEach(marker => {
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

  mapAddMarker(marker: IDbMarker): void {
    if (!this.map) { return; }
    const m = L.marker([marker.lat, marker.lng], { icon: markerIcon });
    m.addTo(this.map);

    // Clone popup template.
    const node = this.tPopup.nativeElement.content.cloneNode(true) as DocumentFragment;
    const div = node.querySelector('div') as HTMLDivElement;
    div.dataset['markerId'] = marker.id.toString();

    // Create popup.
    const width = window.innerWidth > 900 ? 700 : 400;
    const popup = L.popup({
      content: () => div,
      offset: [0, -10],
      minWidth: width, maxWidth: width
    });
    m.bindPopup(popup);

    const divLoading = div.querySelector('.dye-popup-loading') as HTMLDivElement;
    const divContent = div.querySelector('.dye-popup-content') as HTMLDivElement;
    const divResults = div.querySelector('.dye-popup-results') as HTMLDivElement;
    const divUser = div.querySelector('.dye-popup-user') as HTMLDivElement;
    divUser.innerText = marker.username;
    const btnAdd = div.querySelector('.dye-popup-add') as HTMLButtonElement;
    const btnDeleteMarker = div.querySelector('.dye-popup-marker-delete') as HTMLButtonElement;

    btnAdd.addEventListener('click', async () => {
      this.isAddingData = true;
      this.addDataMarkerId = marker.id;
      this._changeDetectorRef.markForCheck();
      return;
    });

    btnDeleteMarker.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this marker? All data submitted on this marker will become inaccessible.')) { return; }
      try {
        await this.deleteMarkerAsync(marker);
      } catch (e) {
        console.error('Error deleting marker:', e);
        alert('Error deleting marker. See console for details. Tip: You can only delete your own markers.');
        return;
      }

      this.map?.closePopup(popup);
      m.remove();
    });

    m.on('popupclose', () => {
      this.popup = undefined;
      this.marker = undefined;
      divLoading.style.display = '';
      divContent.style.display = 'none';
      divResults.innerHTML = '';
    });

    // Load popup data on open.
    m.on('popupopen', async () => {
      this.popup = popup;
      this.marker = m;
      try {
        const response = await fetch(`/api/dyes?markerId=${marker.id}`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
        const data = await response.json() as IPlantData;
        if (!m.isPopupOpen() && !popup.isPopupOpen()) { return; }

        console.log('Popup data:', data);
        divLoading.style.display = 'none';
        divContent.style.display = '';

        // Sort by date.
        data.items.sort((a, b) => b.epoch - a.epoch);
        data.items.forEach(plant => {
          // Delete button.
          const divDelete = document.createElement('div');
          divResults.insertAdjacentElement('beforeend', divDelete);
          divDelete.classList.add('dye-popup-cell', 'link');
          divDelete.innerText = 'X';
          divDelete.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this plant data?')) { return; }
            try {
              await this.deletePlantAsync(plant);
            } catch (e) {
              console.error('Error deleting plant:', e);
              alert('Error deleting plant. See console for details. Tip: You can only delete your own data.');
              return;
            }

            this.map?.closePopup(popup);
            this.map?.openPopup(popup);
          });

          const date = DateTime.fromMillis(plant.epoch * 1000);
          const skyDate = date.setZone(DateHelper.skyTimeZone);
          divResults.insertAdjacentHTML('beforeend', `
            <div class="dye-popup-cell">${date.toFormat('yyyy-MM-dd HH:00')}</div>
            <div class="dye-popup-cell">${skyDate.toFormat('yyyy-MM-dd HH:00')}</div>
            <div class="dye-popup-cell">${plant.username}</div>
            <div class="dye-popup-cell">${plant.size ?? ''}</div>
            <div class="dye-popup-cell">${plant.roots ?? ''}</div>
            <div class="dye-popup-cell">${plant.red ?? ''}</div>
            <div class="dye-popup-cell">${plant.yellow ?? ''}</div>
            <div class="dye-popup-cell">${plant.green ?? ''}</div>
            <div class="dye-popup-cell">${plant.cyan ?? ''}</div>
            <div class="dye-popup-cell">${plant.blue ?? ''}</div>
            <div class="dye-popup-cell">${plant.purple ?? ''}</div>
            <div class="dye-popup-cell">${plant.black ?? ''}</div>
            <div class="dye-popup-cell">${plant.white ?? ''}</div>
          `);
        });

      } catch (e) {
        alert('Loading failed. See console for details.');
        console.error(e);
      }
    });
  }

  setAddTime(h: number): void {
    if (!this.inpTime?.nativeElement) { return; }
    let date = DateTime.now().setZone(DateHelper.skyTimeZone).startOf('hour').setZone();
    date = date.plus({ hours: h });
    this.inpTime.nativeElement.value = date.toFormat('yyyy-MM-dd HH:mm');
  }

  promptAddTimestamp(): void {
    if (!this.inpTime?.nativeElement) { return; }
    const timestamp = prompt('Please enter a Discord timestamp (i.e. <t:1737591240:t>)');
    if (!timestamp) { return; }
    const match = timestamp?.match(/<t:(\d+):\w>/);
    if (!match) { alert('Invalid timestamp format.'); return; }


    let epoch = parseInt(match[1], 10);
    if (isNaN(epoch)) { alert('Invalid timestamp format.'); return; }

    let date = DateTime.fromMillis(epoch * 1000);
    date = date.setZone(DateHelper.skyTimeZone).startOf('hour').setZone();
    this.inpTime.nativeElement.value = date.toFormat('yyyy-MM-dd HH:mm');
  }

  setAddSize(s: number): void {
    this.addData.size = this.addData.size === s ? 0 : s;
  }

  async submitAddData(): Promise<void> {
    if (!this.addDataMarkerId) { return; }

    this.addData.epoch = DateTime.fromFormat(this.inpTime.nativeElement.value, "yyyy-MM-dd'T'HH:mm").toSeconds();
    if (!this.addData.epoch) { alert('Please enter a time.'); return; }

    this.addData.roots = this.inpRoots.nativeElement.value?.length
      ? +this.inpRoots.nativeElement.value || 0
      : undefined;

    this.inpButterflies.forEach(inp => {
      const color = inp.nativeElement.dataset['color']!;
      const d = this.addData as any;
      d[color] = +inp.nativeElement.value || 0;
      if (!d[color]) { delete d[color]; }
    });

    try {
      await this.addPlantAsync(this.addDataMarkerId, this.addData);
    } catch (e) {
      console.error('Error adding plant:', e);
      alert('Error adding plant. See console for details.');
      return;
    }

    this.isAddingData = false;
    this.addDataMarkerId = undefined;
    this.addData = {};
    this._changeDetectorRef.markForCheck();

    if (this.popup && this.marker) {
      const m = this.marker;
      this.map?.closePopup(this.popup);
      m.openPopup();
    }
  }

  async addMarkerAsync(event: L.LeafletMouseEvent): Promise<void> {
    const { lat, lng } = event.latlng;
    const requestBody: IRequestBody = {
      type: 'marker', epoch: Date.now(), lat, lng
    };

    const response = await fetch('/api/dyes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    this.clickMode = 'none';
    this._changeDetectorRef.markForCheck();

    const marker: IDbMarker = {
      id: data.id,
      userId: data.userId,
      username: data.username,
      lat: requestBody.lat!,
      lng: requestBody.lng!,
      createdOn: '',
      deleted: false
    };
    this.mapAddMarker(marker);
  }

  async addPlantAsync(markerId: number, data: Partial<IDbPlant>): Promise<void> {
    const requestBody: IRequestBody = {
      type: 'plant', markerId,
      epoch: data.epoch!,
      size: data.size,
      roots: data.roots,
      red: data.red,
      yellow: data.yellow,
      green: data.green,
      cyan: data.cyan,
      blue: data.blue,
      purple: data.purple,
      black: data.black,
      white: data.white
    };

    const response = await fetch('/api/dyes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) { throw new Error('Failed to add plant.'); }
  }

  async deleteMarkerAsync(marker: IDbMarker): Promise<void> {
    const response = await fetch(`/api/dyes?markerId=${marker.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    if (!response.ok) { throw new Error('Failed to delete marker.'); }
  }

  async deletePlantAsync(plant: IDbPlant): Promise<void> {
    const response = await fetch(`/api/dyes?plantId=${plant.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    if (!response.ok) { throw new Error('Failed to delete marker.'); }
  }
}
