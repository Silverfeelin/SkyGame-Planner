import { DateTime } from 'luxon';
import { Observable, concatMap, of } from 'rxjs';
import { Dropbox, DropboxAuth, DropboxResponseError, files } from 'dropbox';
import { Injectable, OnDestroy } from '@angular/core';
import { BaseStorageProvider } from './base-storage-provider';

interface IDropboxData {
  date: string;
  unlocked: string;
  wingedLights: string;
  favourites: string;
  keys: { [key: string]: unknown };
}

const CLIENT_ID = '5slqiqhhxcxjiqr';

@Injectable({
  providedIn: 'root'
})
export class DropboxStorageProvider extends BaseStorageProvider implements OnDestroy {
  readonly _name = 'Dropbox';

  override _lastDate: DateTime;
  override _syncDate: DateTime;

  private _dbx?: Dropbox;
  private _auth?: DropboxAuth;
  private _rev?: string;

  constructor() {
    super();

    const date = DateTime.fromObject({ year: 2000, month: 1, day: 1 });
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
          this._rev = res.result.rev;

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

  override save(force: boolean): Observable<void> {
    this.events.next({ type: 'save_start' });
    return this.initializeDropbox().pipe(concatMap(() => {
      return new Observable<void>(observer => {
        const data = this.serializeData();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const syncDate = this._lastDate;
        const upload$ = this._rev && !force
          ? this._dbx!.filesUpload({ path: '/data.json', contents: blob, mode: { '.tag': 'update', update: this._rev } })
          : this._dbx!.filesUpload({ path: '/data.json', contents: blob, mode: { '.tag': 'overwrite' } });
        upload$.then(response => {
          if (syncDate <= this._lastDate) { this._syncDate = this._lastDate; }
          this._rev = response.result.rev;
          observer.next();
          observer.complete();
          this.events.next({ type: 'save_success' });
        }).catch((e: any) => {
          e = this.parseDropboxError(e) || e;
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
    const unlocked = data.unlocked || undefined;
    const wingedLights = data.wingedLights || undefined;
    const favourites = data.favourites || undefined;
    this._unlocked = new Set(unlocked?.split(',') ?? []);
    this._wingedLights = new Set(wingedLights?.split(',') ?? []);
    this._favourites = new Set(favourites?.split(',') ?? []);
    this._keys = data.keys || {};
  }

  private serializeData(): IDropboxData {
    return {
      date: this._syncDate.toISO()!,
      unlocked: [...this._unlocked].join(','),
      wingedLights: [...this._wingedLights].join(','),
      favourites: [...this._favourites].join(','),
      keys: this._keys
    };
  }

  private parseDropboxError(e: DropboxResponseError<any>): Error | undefined {
    if (!e) { return; }
    if (!e.error?.error) { return; }

    if (e.error.error['.tag'] === 'path' && e.error.error.reason?.['.tag'] === 'conflict') {
      return new Error('Conflict detected. The file has been modified by another tab or device.');
    }

    return undefined;
  }
}
