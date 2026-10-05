import { EnvironmentInjector, Injectable, createEnvironmentInjector, inject, signal } from '@angular/core';
import { StorageService } from '@app/services/storage.service';
import { QuickStartStore } from './quick-start.store';

/** Keeps the quick start between visits to the page, until it's saved or the page is reloaded. */
@Injectable({ providedIn: 'root' })
export class QuickStartSession {
  private readonly _parent = inject(EnvironmentInjector);
  private readonly _storage = inject(StorageService);
  private _injector?: EnvironmentInjector;

  /** The kept quick start was dropped because progress changed elsewhere in the meantime. */
  readonly restarted = signal(false);

  acquire(): QuickStartStore {
    this.restarted.set(false);
    const kept = this._injector?.get(QuickStartStore);
    if (kept?.saved()) {
      this.release();
    } else if (kept && this.progressChanged(kept)) {
      // the store's snapshot of earlier progress drives locked tiles and inference, so it can't be reused
      this.release();
      this.restarted.set(true);
    }
    this._injector ??= createEnvironmentInjector([QuickStartStore], this._parent);
    return this._injector.get(QuickStartStore);
  }

  release(): void {
    this._injector?.destroy();
    this._injector = undefined;
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
