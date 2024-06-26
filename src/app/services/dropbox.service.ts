import { Injectable, NgZone } from "@angular/core";
import { generateCodeVerifier, OAuth2Client, OAuth2Token } from '@badgateway/oauth2-client';

const REDIRECT_URI = location.origin + '/dropbox-auth';
const CLIENT_ID = '5slqiqhhxcxjiqr';

export class DropboxError extends Error {
  error: any;
  constructor(message: string, error: any) {
    super(message);
    this.error = error;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DropboxService {
  _client = new OAuth2Client({
    clientId: CLIENT_ID,
    authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
    tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token'
  });

  _token?: OAuth2Token;

  async authorize(): Promise<void> {
    this.reset();
    const codeVerifier = await generateCodeVerifier();
    localStorage.setItem('dbx-codeVerifier', codeVerifier);

    const uri = await this._client.authorizationCode.getAuthorizeUri({
      redirectUri: REDIRECT_URI,
      codeVerifier
    });

    const url = new URL(uri);
    url.searchParams.set('token_access_type', 'offline');
    location.href = url.toString();
  }

  initialize(): void {
    if (this._token) { return; }
    const accessToken = localStorage.getItem('dbx-accessToken');
    const refreshToken = localStorage.getItem('dbx-refreshToken');
    if (!accessToken || !refreshToken) {
      throw new Error('No Dropbox access token found.');
    }

    this._token = {
      accessToken, refreshToken, expiresAt: 0
    };
  }

  async tryRefreshToken(): Promise<void> {
    if (!this._token) { return; }
    // If the token is expired or will expire in 10 seconds, refresh it.
    if (!this._token.expiresAt || this._token.expiresAt < Date.now() - 10000) {
      await this.refreshAccessToken();
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this._token) { throw new Error('No refresh token found.'); }

    const token = await this._client.refreshToken(this._token!);
    this._token = token;
    localStorage.setItem('dbx-accessToken', token.accessToken);
  }

  async setAccessCode(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem('dbx-codeVerifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found. Please report this problem if it happens after trying again later.');
    }

    const token = await this._client.authorizationCode.getToken({
      code,
      redirectUri: REDIRECT_URI,
      codeVerifier
    });

    localStorage.setItem('dbx-accessToken', token.accessToken);
    localStorage.setItem('dbx-refreshToken', token.refreshToken || '');
  }

  async downloadFile(path: string): Promise<any> {
    if (!this._token) { throw new Error('No Dropbox access token found.'); }
    await this.tryRefreshToken();

    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this._token.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path })
      }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new DropboxError(`Failed to download file from Dropbox.`, err);
    }

    // Parse the response as JSON and parse the file contents as JSON.
    return await response.json();
  }

  async uploadFile(path: string, json: string, rev?: string): Promise<any> {
    if (!this._token) { throw new Error('No Dropbox access token found.'); }
    await this.tryRefreshToken();

    const blob = new Blob([json], { type: 'application/json' });

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this._token.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path, mode: { '.tag': rev ? 'update' : 'overwrite', update: rev } }),
        'Content-Type': 'application/octet-stream'
      },
      body: blob
    });

    if (!response.ok) {
      const err = await response.json();
      throw new DropboxError(`Failed to upload file to Dropbox.`, err);
    }

    return await response.json();
  }

  private reset(): void {
    localStorage.removeItem('dbx-codeVerifier');
    localStorage.removeItem('dbx-accessToken');
    localStorage.removeItem('dbx-refreshToken');
  }
}
