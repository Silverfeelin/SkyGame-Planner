import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DropboxAuth, Dropbox } from 'dropbox';

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

@Component({
  selector: 'app-dropbox-auth',
  templateUrl: './dropbox-auth.component.html',
  styleUrls: ['./dropbox-auth.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropboxAuthComponent implements OnInit {
  private _auth!: DropboxAuth;
  private _dbx?: Dropbox;

  private _hasTokens = false;

  error?: string;
  errorDescription?: string;

  isAuthenticated = false;

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.resetAuth();
    this.loadTokens();
  }

  ngOnInit(): void {
    const url = new URL(window.location.href);
    if (url.searchParams.has('code')) {
      const code = url.searchParams.get('code') || '';
      this.setAccessCode(code);
    }

    if (url.searchParams.has('error')) {
      this.error = url.searchParams.get('error') || '';
      this.errorDescription = url.searchParams.get('error_description') || '';
    }

    history.replaceState({}, '', location.pathname);
  }


  onAuthChanged(): void {
    this._changeDetectorRef.markForCheck();

    if (this.isAuthenticated) {
      localStorage.setItem('storage.type', 'dropbox');
    }
  }

  login(): void {
    this.authorize();
  }

  reset(): void {
    this.removeAuth();
    window.open('https://www.dropbox.com/account/connected_apps', '_blank');
  }

  private loadTokens(): boolean {
    const accessToken = localStorage.getItem('dbx-accessToken');
    const refreshToken = localStorage.getItem('dbx-refreshToken');
    if (!accessToken || !refreshToken) {
      return false;
    }

    this._hasTokens = true;
    return true;
  }

  private setAuth(accessToken: string, refreshToken: string): void {
    this._auth.setAccessToken(accessToken);
    this._auth.setRefreshToken(refreshToken);
    this._dbx = new Dropbox({ auth: this._auth });
  }

  private resetAuth(): void {
    // Reset auth.
    this.isAuthenticated = false;
    this._dbx = undefined;
    this._auth = new DropboxAuth({
      clientId: CLIENT_ID
    });
  }

  private authorize(): void {
    this.resetAuth();
    this._auth.getAuthenticationUrl(REDIRECT_URI, undefined, 'code', 'offline', undefined, 'none', true).then(authUrl => {
      localStorage.setItem('dbx-codeVerifier', this._auth.getCodeVerifier());
      window.location.href = authUrl.toString();
    }).catch(e => {
      this.resetAuth();
      console.error(e);
      alert('Something went wrong while redirecting you to Dropbox. Please report this problem if it happens after trying again later.');
    });
  }

  private setAccessCode(code: string): void {
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
      this.isAuthenticated = true;
      this._changeDetectorRef.markForCheck();
    }).catch(e => {
      this.resetAuth();
      console.error(e);
      alert('Something went wrong while authenticating with Dropbox. Please report this problem if it happens after trying again later.');
    });
  }

  private removeAuth(): void {
    localStorage.removeItem('dbx-codeVerifier');
    localStorage.removeItem('dbx-accessToken');
    localStorage.removeItem('dbx-refreshToken');

    this.resetAuth();
    this._hasTokens = false;
  }
}
