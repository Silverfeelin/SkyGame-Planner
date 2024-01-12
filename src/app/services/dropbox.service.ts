import { Injectable, OnDestroy } from '@angular/core';
import dayjs from 'dayjs';
import { Dropbox, DropboxAuth, DropboxResponseError } from 'dropbox';
import { Observable, ReplaySubject, Subject, debounce, debounceTime, filter } from 'rxjs';
import { StorageService, storageReloadKeys } from './storage.service';
import { SubscriptionBag } from '../helpers/subscription-bag';

const REDIRECT_URI = location.origin + '/dropbox-auth';
const CLIENT_ID = '5slqiqhhxcxjiqr';

interface DropboxAuthResponse {
  access_token: string;
  account_id: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  uid: string;
}

@Injectable({
  providedIn: 'root'
})
export class DropboxService implements OnDestroy {
  private _auth!: DropboxAuth;
  private _dbx?: Dropbox;

  private _hasTokens = false;
  private _isAuthenticated = false;

  readonly authLoaded = new ReplaySubject<boolean>(1);
  readonly authChanged = new Subject<boolean>();
  readonly authRemoved = new Subject<void>();

  private _subscriptions = new SubscriptionBag();

  constructor(
    private readonly _storageService: StorageService
  ) {
    this.resetAuth();
    this.loadTokens();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  hasTokens(): boolean {
    return this._hasTokens;
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  private subscribeStorage(): void {
    // Subscribe to uninterrupted storage changes.
    const obs$ = this._storageService.storageChanged.pipe(
      filter(e => e.key !== null && storageReloadKeys.has(e.key)),
      debounceTime(5000)
    );

    // Storage changed. Update Dropbox.
    this._subscriptions.add(obs$.subscribe(() => {
      if (!this.isAuthenticated()) { return; }
      this.createFile();
    }));
  }

  private resetAuth(): void {
    localStorage.removeItem('dbx-codeVerifier');

    // Reset auth.
    this._isAuthenticated = false;
    this._dbx = undefined;
    this._auth = new DropboxAuth({
      clientId: CLIENT_ID
    });

    // Stop listening to storage changes.
    this._subscriptions.unsubscribe();
  }

  private loadTokens(): boolean {
    const accessToken = localStorage.getItem('dbx-accessToken');
    const refreshToken = localStorage.getItem('dbx-refreshToken');
    if (!accessToken || !refreshToken) {
      this.authLoaded.next(false);
      return false;
    }

    this._hasTokens = true;
    this.setAuth(accessToken, refreshToken);
    this.checkAuth().subscribe({
      next: () => {
        this.authLoaded.next(true);
      },
      error: () => {
        this.authLoaded.next(false);
      }
    });
    return true;
  }

  private setAuth(accessToken: string, refreshToken: string): void {
    this._auth.setAccessToken(accessToken);
    this._auth.setRefreshToken(refreshToken);
    this._dbx = new Dropbox({ auth: this._auth });
  }

  private checkAndRefreshAccessToken(): Promise<DropboxAuthResponse> {
    return this._auth.checkAndRefreshAccessToken() as unknown as Promise<DropboxAuthResponse>;
  }

  private checkAuth(): Observable<void> {
    return new Observable<void>(observer => {
      this.checkAndRefreshAccessToken().then(() => {
        this._isAuthenticated = true;
        this.subscribeStorage();

        observer.next();
        observer.complete();
      }).catch((e: DropboxResponseError<unknown>) => {
        this.resetAuth();
        observer.error(e);
      });
    });
  }

  authorize(): void {
    this.resetAuth();
    this._auth.getAuthenticationUrl(REDIRECT_URI, undefined, 'code', 'offline', undefined, 'none', true).then(authUrl => {
      localStorage.setItem('dbx-codeVerifier', this._auth.getCodeVerifier());
      window.location.href = authUrl.toString();
    }).catch(e => {
      this.resetAuth();
      console.error(e);
      alert('Something went wrong while redirecting you to Dropbox. Please report this problem if it happens after trying again later.');
      this.authChanged.next(false);
    });
  }

  setAccessCode(code: string): void {
    const codeVerifier = localStorage.getItem('dbx-codeVerifier');
    if (!codeVerifier) {
      alert('No code verifier found. Please report this problem if it happens after trying again later.');
      return;
    }

    this._auth.setCodeVerifier(codeVerifier);
    this._auth.getAccessTokenFromCode(REDIRECT_URI, code).then(response => {
      const result = response.result as DropboxAuthResponse;

      localStorage.setItem('dbx-accessToken', result.access_token);
      localStorage.setItem('dbx-refreshToken', result.refresh_token);

      this.setAuth(result.access_token, result.refresh_token);
      this._isAuthenticated = true;
      this.subscribeStorage();

      this.authChanged.next(true);
    }).catch(e => {
      this.resetAuth();
      console.error(e);
      alert('Something went wrong while authenticating with Dropbox. Please report this problem if it happens after trying again later.');
      this.authChanged.next(false);
    });
  }

  removeAuth(): void {
    localStorage.removeItem('dbx-codeVerifier');
    localStorage.removeItem('dbx-accessToken');
    localStorage.removeItem('dbx-refreshToken');

    this.resetAuth();
    this._hasTokens = false;
    this.authChanged.next(false);
  }

  createFile(): void {
    if (!this._dbx) { return; }
    const data = {
      date: dayjs().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, undefined, 0)], { type: 'application/json' });
    this._dbx.filesUpload({ path: '/data.json', contents: blob, mode: { '.tag': 'overwrite' } }).then(response => {
      console.log(response);
    }).catch((e: DropboxResponseError<unknown>) => {
      console.error(e);
    });
  }

  downloadFile(): void {
    if (!this._dbx) { return; }
    this._dbx.filesDownload({ path: '/data.json' }).then(response => {
      console.log(response);
    }).catch((e: DropboxResponseError<unknown>) => {
      console.error(e);
    });
  }

  getFiles(): void {
    if (!this._dbx) { return; }
    this._dbx.filesListFolder({ path: '' }).then(response => {
      console.log(response);
    }).catch((e: DropboxResponseError<unknown>) => {
      console.error(e);
    });
  }
}
