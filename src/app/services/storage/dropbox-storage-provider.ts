import { DateTime } from 'luxon';
import { Observable, SubscriptionLike } from 'rxjs';
import { DropboxService } from '../dropbox.service';
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

  private _channel = new BroadcastChannel('dbx');

  override _lastDate = DateTime.now();
  override _syncDate = DateTime.now();

  private _dbx?: Dropbox;
  private _auth?: DropboxAuth;

  constructor(
    private readonly _dropboxService: DropboxService
  ) {
    super();
    this._debounceTime = 3000;
    this._channel.onmessage = (event) => {
      this.onChannelMessage(event as IChannelMessage<unknown>);
    };
  }

  ngOnDestroy(): void {
    this.dispose();
    this._channel.close();
  }

  override load(): Observable<void> {
    if (!this._dbx) {
      this.initializeDbx();
    }

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
        observer.error(e);
      });;
    });
  }

  override save(): Observable<void> {
    if (!this._dbx) {
      this.initializeDbx();
    }

    return new Observable<void>(observer => {
      if (!this._dbx) {
        observer.error(new Error('Dropbox not initialized.'));
        return;
      }

      const data = this.serializeData();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      this._dbx.filesUpload({ path: '/data.json', contents: blob, mode: { '.tag': 'overwrite' } }).then(() => {
        observer.next();
        observer.complete();
      }).catch((e: DropboxResponseError<unknown>) => {
        observer.error(e);
      });
    });
  }

  private initializeDbx(): void {
    const accessToken = localStorage.getItem('dbx-accessToken') || '';
    const refreshToken = localStorage.getItem('dbx-refreshToken') || '';

    if (!accessToken || !refreshToken) {
      throw new Error('Dropbox authorization not found.');
    }

    this._auth = new DropboxAuth({ clientId: CLIENT_ID });
    this._auth!.setAccessToken(accessToken);
    this._auth!.setRefreshToken(refreshToken);
    this._dbx = new Dropbox({ auth: this._auth });
  }

  private onData(data: string): void {
    const model = JSON.parse(data) as IDropboxData;
    this.initializeData(model);
  }

  private initializeData(data: IDropboxData): void {
    this._syncDate = DateTime.fromISO(data.date) as DateTime;
    this._unlocked = new Set(data.unlocked?.split(',') ?? []);
    this._wingedLights = new Set(data.wingedLights?.split(',') ?? []);
    this._favourites = new Set(data.favourites?.split(',') ?? []);
  }

  private sendChannelData(): void {
    this._channel.postMessage({
      type: 'data',
      data: this.serializeData()
    });
  }

  onChannelMessage(message: IChannelMessage<unknown>) {
    if (message.type === 'data') {
      this.onChannelData(message.data as IDropboxData);
    }
    throw new Error('Method not implemented.');
  }

  onChannelData(data: IDropboxData) {
    this.initializeData(data);
  }

  private serializeData(): IDropboxData {
    return {
      date: this._syncDate.toISO(),
      unlocked: [...this._unlocked].join(','),
      wingedLights: [...this._wingedLights].join(','),
      favourites: [...this._favourites].join(',')
    };
  }

}
