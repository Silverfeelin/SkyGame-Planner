import { DateTime } from 'luxon';
import { Observable, concatMap, of } from 'rxjs';
import { Dropbox, DropboxAuth, DropboxResponseError } from 'dropbox';
import { Injectable, OnDestroy } from '@angular/core';
import { BaseStorageProvider } from './base-storage-provider';

interface IDropboxData {
  date: string;
  unlocked: string;
  wingedLights: string;
  favourites: string;
}

interface IChannelMessage<T> {
  type: 'data';
  data: T;
}

const CLIENT_ID = '5slqiqhhxcxjiqr';

@Injectable({
  providedIn: 'root'
})
export class DropboxStorageProvider extends BaseStorageProvider implements OnDestroy {
  override _lastDate: DateTime;
  override _syncDate: DateTime;

  private _dbx?: Dropbox;
  private _auth?: DropboxAuth;

  constructor() {
    super();

    const date = DateTime.now();
    this._lastDate = date;
    this._syncDate = date;
    this._debounceTime = 3000;
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  override load(): Observable<void> {
    return this.initializeDropbox().pipe(concatMap(() => {
      return new Observable<void>(observer => {
        if (!this._dbx) {
          observer.error(new Error('Dropbox not initialized.'));
          return;
        }

        this._dbx.filesDownload({ path: '/data.json' }).then(res => {
          const reader = new FileReader();
          const blob = (res.result as any).fileBlob;

          reader.onload = () => {
            this.onData(reader.result as string);
            observer.next();
            observer.complete();
          };
          reader.onerror = (e) => { observer.error(e); };
          reader.readAsText(blob);
        }).catch((e: DropboxResponseError<unknown>) => {
          // Accept file not found since it's created on first save.
          const err = e.error as any;
          if (err?.error?.['.tag'] === 'path' && err.error['path']?.['.tag'] === 'not_found') {
            this.onData('{}');
            observer.next();
            observer.complete();
            return;
          }

          observer.error(e);
        });
      });
    }));
  }

  override save(): Observable<void> {
    this.events.next({ type: 'save_start' });
    return this.initializeDropbox().pipe(concatMap(() => {
      return new Observable<void>(observer => {
        const data = this.serializeData();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const syncDate = this._lastDate;
        this._dbx!.filesUpload({ path: '/data.json', contents: blob, mode: { '.tag': 'overwrite' } }).then(() => {
          if (syncDate === this._lastDate) { this._syncDate = this._lastDate; }
          observer.next();
          observer.complete();
          this.events.next({ type: 'save_success' });
        }).catch((e: DropboxResponseError<unknown>) => {
          observer.error(e);
          this.events.next({ type: 'save_error', error: e as unknown as Error });
        });
      });
    }));
  }

  private initializeDropbox(): Observable<void> {
    if (this._dbx) {
      return of(void 0);
    }

    return new Observable<void>(observer => {
      const accessToken = localStorage.getItem('dbx-accessToken') || '';
      const refreshToken = localStorage.getItem('dbx-refreshToken') || '';

      if (!accessToken || !refreshToken) {
        observer.error(new Error('Dropbox authorization not found.'));
      }

      this._auth = new DropboxAuth({ clientId: CLIENT_ID });
      this._auth!.setAccessToken(accessToken);
      this._auth!.setRefreshToken(refreshToken);
      this._dbx = new Dropbox({ auth: this._auth });
      observer.next();
      observer.complete();
    });
  }

  private onData(data: string): void {
    const model = JSON.parse(data) as IDropboxData;
    this.initializeData(model);
  }

  private initializeData(data: IDropboxData): void {
    this._syncDate = data.date ? DateTime.fromISO(data.date) as DateTime : DateTime.now();
    this._unlocked = new Set(data.unlocked?.split(',') ?? []);
    this._wingedLights = new Set(data.wingedLights?.split(',') ?? []);
    this._favourites = new Set(data.favourites?.split(',') ?? []);
  }

  private serializeData(): IDropboxData {
    return {
      date: this._syncDate.toISO()!,
      unlocked: [...this._unlocked].join(','),
      wingedLights: [...this._wingedLights].join(','),
      favourites: [...this._favourites].join(',')
    };
  }

}
