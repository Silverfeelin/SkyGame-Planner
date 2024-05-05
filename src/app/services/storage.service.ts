import { Injectable, OnDestroy } from '@angular/core';
import { Subject, SubscriptionLike } from 'rxjs';
import { IStorageEvent, IStorageExport, IStorageProvider } from './storage/storage-provider.interface';
import { StorageProviderFactory } from './storage/storage-provider-factory';
import { BroadcastService } from './broadcast.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements OnDestroy {
  provider!: IStorageProvider;

  events = new Subject<IStorageEvent>();

  private _eventSub?: SubscriptionLike;

  constructor(
    private readonly broadcastService: BroadcastService,
    storageProviderFactory: StorageProviderFactory
  ) {
    this.setStorageProvider(storageProviderFactory.get());
  }

  isOutOfSync(): boolean {
    return this.provider.isOutOfSync();
  }

  getProviderName(): string {
    return this.provider.getName();
  }

  import(data: IStorageExport): void {
    this.provider.import(data);
    this.provider.save(false).subscribe();
  }

  export(): IStorageExport {
    return this.provider.export();
  }

  getUnlocked(): ReadonlySet<string> { return this.provider.getUnlocked(); }
  addUnlocked(...guids: Array<string>): void {
    this.provider.addUnlocked(...guids);
    this.notifyChange();
  }
  removeUnlocked(...guids: Array<string>): void {
    this.provider.removeUnlocked(...guids);
    this.notifyChange();
  }
  isUnlocked(guid: string): boolean { return this.provider.isUnlocked(guid); }
  getWingedLights(): ReadonlySet<string> { return this.provider.getWingedLights(); }
  addWingedLights(...guids: Array<string>): void {
    this.provider.addWingedLights(...guids);
    this.notifyChange();
  }
  removeWingedLights(...guids: Array<string>): void {
    this.provider.removeWingedLights(...guids);
    this.notifyChange();
  }
  hasWingedLight(guid: string): boolean { return this.provider.hasWingedLight(guid); }
  getFavourites(): ReadonlySet<string> { return this.provider.getFavourites(); }
  addFavourites(...guids: Array<string>): void {
    this.provider.addFavourites(...guids);
    this.notifyChange();
  }
  removeFavourites(...guids: Array<string>): void {
    this.provider.removeFavourites(...guids);
    this.notifyChange();
  }
  isFavourite(guid: string): boolean { return this.provider.isFavourite(guid); }

  getMapMarkers(): ReadonlySet<string> { return this.provider.getMapMarkers(); }
  addMapMarkers(...guids: Array<string>): void {
    this.provider.addMapMarkers(...guids);
    this.notifyChange();
  }
  removeMapMarkers(...guids: Array<string>): void {
    this.provider.removeMapMarkers(...guids);
    this.notifyChange();
  }
  hasMapMarker(guid: string): boolean { return this.provider.hasMapMarker(guid); }

  setKey<T>(key: string, value: T): void {
    this.provider.setKey(key, value);
    this.notifyChange();
  }
  getKey<T>(key: string): T | undefined { return this.provider.getKey(key); }

  /** Updates the storage provider. */
  setStorageProvider(provider: IStorageProvider): void {
    this._eventSub?.unsubscribe();

    this._eventSub = provider.events.subscribe(evt => this.events.next(evt));
    this.provider = provider;
  }

  ngOnDestroy(): void {
    this.events.complete();
  }

  private notifyChange(): void {
    this.events.next({ type: 'data_changed' });
    this.broadcastService.broadcast({ type: 'storage.changed', data: null });
  }
}
