import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OAuth2Client, generateCodeVerifier } from '@badgateway/oauth2-client';
import { DropboxService } from 'src/app/services/dropbox.service';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink, MatIcon, NgIf]
})
export class DropboxAuthComponent implements OnInit {
  error?: string;
  errorDescription?: string;

  isAuthenticated = false;
  isUsingDropbox = localStorage.getItem('storage.type') === 'dropbox';

  constructor(
    private readonly _dropboxService: DropboxService,
    private readonly _http: HttpClient,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.resetAuth();
    this.isAuthenticated = this.loadTokens();
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

    return true;
  }

  private resetAuth(): void {
    // Reset auth.
    this.isAuthenticated = false;
  }

  private async authorize(): Promise<void> {
    return this._dropboxService.authorize();
  }

  private setAccessCode(code: string): void {
    try {
      this._dropboxService.setAccessCode(code);
    } catch (e) {
      this.resetAuth();
      console.error(e);
      alert('Something went wrong while authenticating with Dropbox. Please report this problem if it happens after trying again later.');
    }

    this.isAuthenticated = true;
    localStorage.setItem('storage.type', 'dropbox');
    this.isUsingDropbox = true;
    this._changeDetectorRef.markForCheck();
  }

  private removeAuth(): void {
    localStorage.removeItem('dbx-codeVerifier');
    localStorage.removeItem('dbx-accessToken');
    localStorage.removeItem('dbx-refreshToken');

    this.resetAuth();
  }
}
