import { Injectable, OnDestroy } from '@angular/core';
import { Subject, SubscriptionLike } from 'rxjs';
import { IStorageEvent, IStorageProvider } from './storage/storage-provider.interface';
import { StorageProviderFactory } from './storage/storage-provider-factory';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements OnDestroy {
  provider!: IStorageProvider;

  storageChanged = new Subject<StorageEvent>();
  events = new Subject<IStorageEvent>();

  private _eventSub?: SubscriptionLike;

  constructor(
    storageProviderFactory: StorageProviderFactory
  ) {
    this.setStorageProvider(storageProviderFactory.get());
    this.subscribeStorage();
  }

  getUnlocked(): ReadonlySet<string> { return this.provider.getUnlocked(); }
  addUnlocked(guid: string): void { this.provider.addUnlocked(guid); }
  removeUnlocked(guid: string): void { this.provider.removeUnlocked(guid); }
  isUnlocked(guid: string): boolean { return this.provider.isUnlocked(guid); }
  getWingedLights(): ReadonlySet<string> { return this.provider.getWingedLights(); }
  addWingedLight(guid: string): void { this.provider.addWingedLights(guid); }
  removeWingedLight(guid: string): void { this.provider.removeWingedLights(guid); }
  hasWingedLight(guid: string): boolean { return this.provider.hasWingedLight(guid); }
  getFavourites(): ReadonlySet<string> { return this.provider.getFavourites(); }
  addFavourite(guid: string): void { this.provider.addFavourites(guid); }
  removeFavourite(guid: string): void { this.provider.removeFavourites(guid); }
  isFavourite(guid: string): boolean { return this.provider.isFavourite(guid); }

  /** Updates the storage provider. */
  setStorageProvider(provider: IStorageProvider): void {
    this._eventSub?.unsubscribe();

    this._eventSub = provider.events.subscribe(evt => this.events.next(evt));
    this.provider = provider;
  }

  ngOnDestroy(): void {
    this.events.complete();
    this.storageChanged.complete();
  }

  // #region Storage updates

  private subscribeStorage(): void {
    window.addEventListener('storage', evt => { this.onStorageChanged(evt); });
  }

  private onStorageChanged(event: StorageEvent): void {
    this.storageChanged.next(event);
  }

  // #endregion
}
