import { Injectable, signal } from '@angular/core';

const storageKey = 'closet.trusted-hosts';

/** Asks before the closet opens another website, unless the user chose to trust its domain. */
@Injectable()
export class ClosetExternalLinkService {
  readonly trusted = signal<string[]>(this._load());
  /** Link waiting for the user to confirm leaving. */
  readonly pending = signal<string | undefined>(undefined);

  static hostOf(url: string): string {
    try { return new URL(url).hostname; } catch { return ''; }
  }

  isTrusted(url: string): boolean {
    return this.trusted().includes(ClosetExternalLinkService.hostOf(url));
  }

  open(url: string): void {
    if (this.isTrusted(url)) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    this.pending.set(url);
  }

  confirm(remember: boolean): void {
    const url = this.pending();
    if (!url) { return; }
    if (remember) { this.trust(ClosetExternalLinkService.hostOf(url)); }
    this.pending.set(undefined);
    window.open(url, '_blank', 'noopener');
  }

  cancel(): void {
    this.pending.set(undefined);
  }

  trust(host: string): void {
    if (!host || this.trusted().includes(host)) { return; }
    this._save([...this.trusted(), host]);
  }

  private _load(): string[] {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  }

  private _save(hosts: string[]): void {
    this.trusted.set(hosts);
    localStorage.setItem(storageKey, JSON.stringify(hosts));
  }
}
