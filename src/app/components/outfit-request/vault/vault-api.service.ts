import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { nanoid } from 'nanoid';
import { StorageService } from '@app/services/storage.service';

export interface IApiOutfit {
  id?: number;
  link: string;
  date?: string;
  protocolLink?: string;
  outfitId: number;
  maskId: number;
  hairId: number;
  capeId: number;
  shoesId?: number;
  faceAccessoryId?: number;
  necklaceId?: number;
  hairAccessoryId?: number;
  headAccessoryId?: number;
  propId?: number;
  sizeId?: number;
  lightingId?: number;
  key?: string;
  canDelete?: boolean;
}

export interface IApiOutfits {
  items: Array<IApiOutfit>;
}

@Injectable({ providedIn: 'root' })
export class VaultApiService {
  private readonly _http = inject(HttpClient);
  private readonly _storageService = inject(StorageService);

  private _key: string;

  get key(): string { return this._key; }

  constructor() {
    // Dual persistence: localStorage AND StorageService. Cloud key wins.
    const localKey = localStorage.getItem('outfit-vault-key') ?? '';
    const cloudKey = this._storageService.getKey('outfit-vault-key');

    if (cloudKey && typeof cloudKey === 'string') {
      this._key = cloudKey;
      // sync to localStorage as well
      localStorage.setItem('outfit-vault-key', cloudKey);
    } else if (localKey) {
      this._key = localKey;
      this._storageService.setKey('outfit-vault-key', localKey);
    } else {
      this._key = '';
    }
  }

  generateKey(): string {
    this._key = nanoid(32);
    localStorage.setItem('outfit-vault-key', this._key);
    this._storageService.setKey('outfit-vault-key', this._key);
    return this._key;
  }

  ensureKey(): string {
    if (!this._key) { this.generateKey(); }
    return this._key;
  }

  /** GET /api/outfit-vault — list vault entries */
  getOutfits(params: Record<string, string>): Observable<IApiOutfits> {
    const url = new URL('/api/outfit-vault', window.location.origin);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    return this._http.get<IApiOutfits>(url.pathname + url.search, { responseType: 'json' });
  }

  /** POST /api/outfit-vault — submit entry */
  submitOutfit(model: IApiOutfit): Observable<unknown> {
    return this._http.post('/api/outfit-vault', model, { responseType: 'json' });
  }

  /** DELETE /api/outfit-vault — delete entry */
  deleteOutfit(id: number, key: string): Observable<unknown> {
    const url = new URL('/api/outfit-vault', window.location.origin);
    url.searchParams.set('key', key);
    url.searchParams.set('id', `${id}`);
    return this._http.delete(url.pathname + url.search, { responseType: 'json' });
  }
}
