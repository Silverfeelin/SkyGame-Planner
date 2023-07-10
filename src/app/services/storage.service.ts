import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  unlocked = new Set<string>();

  constructor() {
    const unlocked = localStorage.getItem('unlocked');
    const guids: Array<string> = unlocked?.length && unlocked.split(',') || [];
    guids.forEach(g => this.unlocked.add(g));
  }

  add(...guids: Array<string>): void {
    guids?.forEach(g => this.unlocked.add(g));
  }

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
}
