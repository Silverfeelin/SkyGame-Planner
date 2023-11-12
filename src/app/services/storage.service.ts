import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  unlocked = new Set<string>();
  unlockedCol = new Set<string>();

  storageChanged = new Subject<StorageEvent>();

  constructor() {
    this.initializeItems();
    this.initializeCol();
    this.subscribeStorage();
  }

  // #region Nodes & items

  private initializeItems(): void {
    const unlocked = localStorage.getItem('unlocked');
    const guids: Array<string> = unlocked?.length && unlocked.split(',') || [];
    guids.forEach(g => this.unlocked.add(g));
  }

  /** Adds unlocked node or items by GUID. */
  add(...guids: Array<string>): void {
    guids?.forEach(g => this.unlocked.add(g));
  }

  /** Removes nodes or items by GUID. */
  remove(...guids: Array<string>): void {
    guids?.forEach(g => this.unlocked.delete(g));
  }

  serializeUnlocked(): string {
    return [...this.unlocked].join(',');
  }

  save(): void {
    const unlocked = this.serializeUnlocked();
    localStorage.setItem('unlocked', unlocked);
  }

  // #endregion

  // #region Children of Light

  private initializeCol(): void {
    const unlockedCol = localStorage.getItem('col.unlocked');
    const colGuids: Array<string> = unlockedCol?.length && unlockedCol.split(',') || [];
    colGuids.forEach(g => this.unlockedCol.add(g));
  }

  addCol(...guids: Array<string>): void {
    guids?.forEach(g => this.unlockedCol.add(g));
  }

  removeCol(...guids: Array<string>): void {
    guids?.forEach(g => this.unlockedCol.delete(g));
  }

  serializeUnlockedCol(): string {
    return [...this.unlockedCol].join(',');
  }

  saveCol(): void {
    const unlocked = this.serializeUnlockedCol();
    localStorage.setItem('col.unlocked', unlocked);
  }

  // #endregion

  // #region Storage updates

  private subscribeStorage(): void {
    window.addEventListener('storage', evt => {
      this.onStorageChanged(evt);
    });
  }

  private onStorageChanged(event: StorageEvent): void {
    this.storageChanged.next(event);
  }

  // #endregion
}
