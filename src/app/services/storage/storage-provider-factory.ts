import { Injectable, Injector } from '@angular/core';
import { IStorageProvider } from './storage-provider.interface';
import { DropboxStorageProvider } from './dropbox-storage-provider';
import { LocalStorageProvider } from './local-storage-provider';

@Injectable({
  providedIn: 'root'
})
export class StorageProviderFactory {
  constructor(
    private readonly _injector: Injector
  ) {}

  get(): IStorageProvider {
    const type = localStorage.getItem('storage.type') || '';
    return this.getByType(type);
  }

  getByType(type: string): IStorageProvider {
    switch (type) {
      case 'dropbox': return this._injector.get<DropboxStorageProvider>(DropboxStorageProvider);
      default: return this._injector.get<LocalStorageProvider>(LocalStorageProvider);
    }
  }
}
