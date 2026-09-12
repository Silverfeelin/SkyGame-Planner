import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DropboxService } from '@app/services/dropbox.service';

@Component({
  selector: 'app-atmos-dropbox-auth',
  templateUrl: './atmos-dropbox-auth.component.html',
  styleUrl: './atmos-dropbox-auth.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'atmospheric' },
  imports: [RouterLink, MatIcon]
})
export class AtmosDropboxAuthComponent implements OnInit {
  private readonly _dropboxService = inject(DropboxService);

  readonly error = signal<string | undefined>(undefined);
  readonly errorDescription = signal<string | undefined>(undefined);
  readonly isAuthenticated = signal<boolean>(this.loadTokens());
  readonly isUsingDropbox = signal<boolean>(localStorage.getItem('storage.type') === 'dropbox');

  ngOnInit(): void {
    const url = new URL(window.location.href);
    if (url.searchParams.has('code')) {
      const code = url.searchParams.get('code') || '';
      this.setAccessCode(code);
    }

    if (url.searchParams.has('error')) {
      this.error.set(url.searchParams.get('error') || '');
      this.errorDescription.set(url.searchParams.get('error_description') || '');
    }

    history.replaceState({}, '', location.pathname);
  }

  login(): void {
    void this._dropboxService.authorize();
  }

  reset(): void {
    this.removeAuth();
    window.open('https://www.dropbox.com/account/connected_apps', '_blank');
  }

  private loadTokens(): boolean {
    const accessToken = localStorage.getItem('dbx-accessToken');
    const refreshToken = localStorage.getItem('dbx-refreshToken');
    return !!(accessToken && refreshToken);
  }

  private setAccessCode(code: string): void {
    try {
      this._dropboxService.setAccessCode(code);
    } catch (e) {
      this.isAuthenticated.set(false);
      console.error(e);
      alert('Something went wrong while authenticating with Dropbox. Please report this problem if it happens after trying again later.');
      return;
    }

    this.isAuthenticated.set(true);
    localStorage.setItem('storage.type', 'dropbox');
    this.isUsingDropbox.set(true);
  }

  private removeAuth(): void {
    localStorage.removeItem('dbx-codeVerifier');
    localStorage.removeItem('dbx-accessToken');
    localStorage.removeItem('dbx-refreshToken');
    this.isAuthenticated.set(false);
  }
}
