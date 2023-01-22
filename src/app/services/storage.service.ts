import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  unlocked = new Set<string>();

  constructor() {
    const guids: Array<string> = localStorage.getItem('unlocked')?.split(',') || [];
    guids.forEach(g => this.unlocked.add(g));
  }

  add(...guids: Array<string>): void {
    guids?.forEach(g => this.unlocked.add(g));
  }

  remove(...guids: Array<string>): void {
    guids?.forEach(g => this.unlocked.delete(g));
  }

  save(): void {
    const items = [...this.unlocked].join(',');
    localStorage.setItem('unlocked', items);
  }
}
