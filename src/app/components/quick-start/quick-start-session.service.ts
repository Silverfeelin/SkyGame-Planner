import { EnvironmentInjector, Injectable, inject, runInInjectionContext, signal } from '@angular/core';
import { StorageService } from '@app/services/storage.service';
import { QuickStartStore } from './quick-start.store';

/** Keeps the quick start between visits to the page, until it's saved or the page is reloaded. */
@Injectable({ providedIn: 'root' })
export class QuickStartSession {
  private readonly _injector = inject(EnvironmentInjector);
  private readonly _storage = inject(StorageService);
  private _store?: QuickStartStore;

  /** The kept quick start was dropped because progress changed elsewhere in the meantime. */
  readonly restarted = signal(false);

  acquire(): QuickStartStore {
    this.restarted.set(false);
    if (this._store?.saved()) {
      this.release();
    } else if (this._store && this.progressChanged(this._store)) {
      // the store's snapshot of earlier progress drives locked tiles and inference, so it can't be reused
      this.release();
      this.restarted.set(true);
    }
    return this._store ??= runInInjectionContext(this._injector, () => new QuickStartStore());
  }

  release(): void {
    this._store?.dispose();
    this._store = undefined;
  }

  private progressChanged(store: QuickStartStore): boolean {
    const before = store.unlockedBefore;
    const now = this._storage.getUnlocked();
    if (before.size !== now.size) { return true; }
    for (const guid of now) {
      if (!before.has(guid)) { return true; }
    }
    return false;
  }
}
