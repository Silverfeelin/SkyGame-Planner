import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { nanoid } from 'nanoid';
import { IGuid, IItem } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { ItemHelper } from '@app/helpers/item-helper';
import { ItemCollectionService } from '@app/services/item-collection.service';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { ImageOverlayComponent } from '@app/components/layout/image-overlay/image-overlay.component';
import { SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import {
  CONNECT_APPS, IConnectApp, IConnectCollection, IConnectCollectionAck, IConnectCollectionReady
} from '../connect-apps';

type CollectionState = 'waiting' | 'choose' | 'add' | 'saved' | 'error';

const WAIT_MS = 5000;

@Component({
  selector: 'app-connect-collection',
  templateUrl: './connect-collection.component.html',
  styleUrls: ['../connect.component.scss', './connect-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'atmospheric', '(window:message)': 'onMessage($event)' },
  imports: [RouterLink, MatIcon, ItemIconComponent, ImageOverlayComponent, TooltipDirective]
})
export class ConnectCollectionComponent {
  private readonly _dataService = inject(DataService);
  private readonly _collectionService = inject(ItemCollectionService);

  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly state = signal<CollectionState>('waiting');
  readonly error = signal<string | undefined>(undefined);
  readonly app?: IConnectApp;
  readonly hostname: string = '';

  readonly name = signal('');
  readonly description = signal('');
  readonly imageUrl = signal('');
  readonly showImage = signal(false);
  readonly items = signal<Array<IItem>>([]);
  readonly unknownCount = signal(0);
  readonly existing = signal<{ guid: string, name: string } | undefined>(undefined);
  readonly savedGuid = signal<string | undefined>(undefined);
  readonly unlockedCount = computed(() => this.items().filter(i => i.unlocked).length);
  readonly calculatorParams = computed(() => ({ items: ItemHelper.serializeQuery(this.items()) }));
  readonly canSave = computed(() => this.state() === 'add' && this.items().length > 0 && !!this.name().trim());

  private readonly _nonce?: string;
  private _waitTimeout?: number;

  constructor() {
    const query = inject(ActivatedRoute).snapshot.queryParamMap;
    this.app = CONNECT_APPS[query.get('app') ?? ''];
    this._nonce = query.get('nonce')?.substring(0, 256) || undefined;
    if (!this.app?.collections) { this._fail('This link was not made by a site that can send collections to Sky Planner.'); return; }

    this.hostname = new URL(this.app.url).hostname;
    if (window.top !== window) { this._fail('This page can not be embedded in another site.'); return; }
    if (!this._opener()) { this._fail(`If you got here from an app like Discord, go back to ${this.app.name}, open it in your browser app (usually from the ⋮ menu) and try again from there.`); return; }

    // The opener may post before this page has loaded, so announce when we're listening.
    this._post<IConnectCollectionReady>({ type: 'sky-planner:collection:ready', nonce: this._nonce, version: 1 });
    this._waitTimeout = window.setTimeout(() => {
      this._fail(`Nothing was received from ${this.app!.name}. Please try again from there.`);
    }, WAIT_MS);
    inject(DestroyRef).onDestroy(() => clearTimeout(this._waitTimeout));
  }

  onMessage(event: MessageEvent): void {
    if (this.state() !== 'waiting') { return; }
    if (!this.app?.origins.includes(event.origin) || event.source !== this._opener()) { return; }
    const message = event.data as Partial<IConnectCollection> | undefined;
    if (message?.type !== 'sky-planner:collection' || message.nonce !== this._nonce) { return; }

    clearTimeout(this._waitTimeout);
    if (!Array.isArray(message.items)) {
      this._fail(`${this.app.name} sent a collection that Sky Planner could not read.`);
      return;
    }

    const knownItems = new Set<IGuid>(this._dataService.itemConfig.items);
    const guids = new Set(message.items.filter((g): g is string => typeof g === 'string'));
    const items: Array<IItem> = [];
    for (const guid of guids) {
      const entity = this._dataService.guidMap.get(guid);
      if (entity && knownItems.has(entity)) { items.push(entity as IItem); }
    }

    this.items.set(items);
    this.unknownCount.set(guids.size - items.length);
    this.existing.set(this._collectionService.findByItems(items));
    this.name.set(this._text(message.name, 100) || `${this.app.name} outfit`);
    this.description.set(this._text(message.description, 2000));
    this.imageUrl.set(this._imageUrl(message.imageUrl));
    this.state.set('choose');
    this._post<IConnectCollectionAck>({ type: 'sky-planner:collection:ack', nonce: this._nonce });
  }

  save(): void {
    if (!this.canSave()) { return; }
    const guid = nanoid(10);
    this._collectionService.upsert({
      guid,
      name: this.name().trim(),
      description: this.description().trim(),
      imageUrl: this.imageUrl(),
      items: this.items()
    });
    this.savedGuid.set(guid);
    this.state.set('saved');
  }

  close(): void {
    window.close();
  }

  private _post<T>(message: T): void {
    const opener = this._opener();
    if (!this.app || !opener) { return; }
    // Only the opener's actual origin receives it.
    for (const origin of this.app.origins) {
      opener.postMessage(message, origin);
    }
  }

  private _opener(): Window | undefined {
    const opener = window.opener as Window | null;
    return opener && !opener.closed ? opener : undefined;
  }

  private _text(value: unknown, maxLength: number): string {
    return typeof value === 'string' ? value.trim().substring(0, maxLength) : '';
  }

  private _imageUrl(value: unknown): string {
    if (typeof value !== 'string' || value.length > 2048) { return ''; }
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }

  private _fail(message: string): void {
    this.error.set(message);
    this.state.set('error');
  }
}
