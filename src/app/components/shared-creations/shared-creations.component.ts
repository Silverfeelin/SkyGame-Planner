import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import L from 'leaflet';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';
import { SubscriptionBag } from '@app/helpers/subscription-bag';
import { BroadcastService } from '@app/services/broadcast.service';
import { MapService } from '@app/services/map.service';
import { StorageService } from '@app/services/storage.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { nanoid } from 'nanoid';

type SharedCreationType = 'message' | 'memory' | 'space';

interface ISharedCreation {
  id: string;
  type: SharedCreationType;
  position: [number, number];
  label?: string;
  createdAt: string; // 'yyyy-MM-dd HH:mm' in Sky timezone
}

const STORAGE_KEY = 'shared-creations';
const EXPIRY_DAYS = 7;
const DATE_FORMAT = 'yyyy-MM-dd HH:mm';

const ICON_IDS: Record<SharedCreationType, string> = {
  message: 'shared-message',
  memory: 'shared-memory',
  space: 'shared-space',
};

const TYPE_LABELS: Record<SharedCreationType, string> = {
  message: 'Shared Message',
  memory: 'Shared Memory',
  space: 'Shared Space',
};

@Component({
  selector: 'app-shared-creations',
  templateUrl: './shared-creations.component.html',
  styleUrl: './shared-creations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, NgbTooltip],
})
export class SharedCreationsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLElement>;

  placementType = signal<SharedCreationType | null>(null);

  readonly iconIds = ICON_IDS;

  private _map!: L.Map;
  private _creations: ISharedCreation[] = [];
  private _markers = new Map<string, L.Marker>();
  private _subs = new SubscriptionBag();
  private _expiryInterval?: ReturnType<typeof setInterval>;
  private readonly _escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') this.placementType.set(null); };

  constructor(
    private readonly _mapService: MapService,
    private readonly _storageService: StorageService,
    private readonly _broadcastService: BroadcastService,
  ) {}

  ngAfterViewInit(): void {
    const el = this.mapContainer.nativeElement.querySelector<HTMLElement>('.map')!;
    this._map = this._mapService.createMap(el, { view: [-270, 270], zoom: 0, zoomPanOptions: { animate: false, duration: 0 } });
    this._map.on('click', (e: L.LeafletMouseEvent) => this._onMapClick(e));

    this._creations = this._storageService.getKey<ISharedCreation[]>(STORAGE_KEY) ?? [];
    this._creations.forEach(c => this._addMarker(c));

    this._subs.add(
      this._broadcastService.subject.subscribe(msg => {
        if (msg.type === 'storage.changed') this._reloadFromStorage();
      })
    );

    this._expiryInterval = setInterval(() => this._refreshExpiredMarkers(), 60_000);
    document.addEventListener('keydown', this._escHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this._escHandler);
    clearInterval(this._expiryInterval);
    this._subs.unsubscribe();
    this._markers.forEach(m => m.remove());
    this._map?.off();
    this._map?.remove();
  }

  togglePlacement(type: SharedCreationType): void {
    this.placementType.update(cur => cur === type ? null : type);
  }

  private _onMapClick(e: L.LeafletMouseEvent): void {
    const type = this.placementType();
    if (!type) return;
    const creation: ISharedCreation = {
      id: nanoid(10),
      type,
      position: [+e.latlng.lat.toFixed(4), +e.latlng.lng.toFixed(4)],
      createdAt: DateTime.now().setZone(DateHelper.skyTimeZone).toFormat(DATE_FORMAT),
    };
    this._creations.push(creation);
    this._save();
    this._addMarker(creation);
    this.placementType.set(null);
  }

  private _addMarker(creation: ISharedCreation): void {
    const marker = L.marker(creation.position as L.LatLngTuple, {
      icon: this._makeIcon(creation.type, this._isExpired(creation)),
      draggable: true,
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      creation.position = [pos.lat, pos.lng];
      this._save();
    });

    marker.bindPopup(() => this._buildPopup(creation, marker));
    marker.addTo(this._map);
    this._markers.set(creation.id, marker);
  }

  private _makeIcon(type: SharedCreationType, expired: boolean): L.DivIcon {
    const classes = ['shared-creation-marker'];
    if (expired) { classes.push('shared-creation-expired'); }
    return L.divIcon({
      className: classes.join(' '),
      html: `<svg viewBox="0 0 300 300" aria-hidden="true"><use href="/assets/icons/icons.svg#${ICON_IDS[type]}"></use></svg>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  }

  private _buildPopup(creation: ISharedCreation, marker: L.Marker): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 's-leaflet-tooltip s-leaflet-flex';

    const labelWrap = document.createElement('div');
    labelWrap.className = ' s-leaflet-item';
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 50;
    input.placeholder = 'Label (optional)';
    input.value = creation.label ?? '';
    input.className = 'shared-creation-label-input';
    input.addEventListener('change', () => {
      creation.label = input.value.trim() || undefined;
      this._save();
    });
    L.DomEvent.disableClickPropagation(input);
    labelWrap.appendChild(input);
    wrap.appendChild(labelWrap);

    const title = document.createElement('div');
    title.className = 'container s-leaflet-item';
    title.style.fontWeight = 'bold';
    title.innerText = TYPE_LABELS[creation.type];
    wrap.appendChild(title);

    const age = document.createElement('div');
    age.className = 'container s-leaflet-item';
    const expired = this._isExpired(creation);
    const hoursOld = DateTime.now().diff(this._parseCreatedAt(creation.createdAt), 'hours').hours;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const relTime = hoursOld <= 24
      ? rtf.format(-Math.floor(hoursOld), 'hour')
      : rtf.format(-Math.floor(hoursOld / 24), 'day');
    age.innerText = expired ? 'Expired' : `Placed ${relTime}`;
    age.title = this._parseCreatedAt(creation.createdAt).toLocal().toFormat(`${DateHelper.displayFormat} HH:mm`);
    if (expired) age.style.color = '#f87171';
    wrap.appendChild(age);

    const refreshBtn = document.createElement('div');
    refreshBtn.className = 'container link s-leaflet-item';
    refreshBtn.innerHTML = `<div class="menu-icon s-leaflet-maticon">refresh</div><div class="menu-label">Refresh (reset timer)</div>`;
    refreshBtn.addEventListener('click', () => {
      creation.createdAt = DateTime.now().setZone(DateHelper.skyTimeZone).toFormat(DATE_FORMAT);
      this._save();
      marker.setIcon(this._makeIcon(creation.type, false));
      marker.closePopup();
    });
    wrap.appendChild(refreshBtn);

    const removeBtn = document.createElement('div');
    removeBtn.className = 'container link s-leaflet-item';
    removeBtn.innerHTML = `<div class="menu-icon s-leaflet-maticon">delete</div><div class="menu-label">Remove</div>`;
    removeBtn.addEventListener('click', () => {
      marker.closePopup();
      this._removeCreation(creation.id, marker);
    });
    wrap.appendChild(removeBtn);

    return wrap;
  }

  private _removeCreation(id: string, marker: L.Marker): void {
    marker.remove();
    this._markers.delete(id);
    this._creations = this._creations.filter(c => c.id !== id);
    this._save();
  }

  private _save(): void {
    this._storageService.setKey(STORAGE_KEY, this._creations);
  }

  private _parseCreatedAt(createdAt: string): DateTime {
    return DateTime.fromFormat(createdAt, DATE_FORMAT, { zone: DateHelper.skyTimeZone });
  }

  private _isExpired(creation: ISharedCreation): boolean {
    return DateTime.now().diff(this._parseCreatedAt(creation.createdAt), 'days').days > EXPIRY_DAYS;
  }

  private _refreshExpiredMarkers(): void {
    this._creations.forEach(c => {
      const marker = this._markers.get(c.id);
      if (marker) marker.setIcon(this._makeIcon(c.type, this._isExpired(c)));
    });
  }

  private _reloadFromStorage(): void {
    const stored = this._storageService.getKey<ISharedCreation[]>(STORAGE_KEY) ?? [];
    const storedIds = new Set(stored.map(c => c.id));
    this._markers.forEach((marker, id) => {
      if (!storedIds.has(id)) { marker.remove(); this._markers.delete(id); }
    });
    stored.forEach(c => {
      if (!this._markers.has(c.id)) this._addMarker(c);
    });
    this._creations = stored;
  }
}
