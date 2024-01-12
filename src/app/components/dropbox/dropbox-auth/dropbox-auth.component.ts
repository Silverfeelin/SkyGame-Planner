import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { merge } from 'rxjs';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { DropboxService } from 'src/app/services/dropbox.service';

@Component({
  selector: 'app-dropbox-auth',
  templateUrl: './dropbox-auth.component.html',
  styleUrls: ['./dropbox-auth.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropboxAuthComponent implements OnInit, OnDestroy {
  error?: string;
  errorDescription?: string;

  isAuthenticated = false;

  _subscriptions = new SubscriptionBag();

  constructor(
    private readonly _dropboxService: DropboxService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    const url = new URL(window.location.href);
    if (url.searchParams.has('code')) {
      const code = url.searchParams.get('code') || '';
      this._dropboxService.setAccessCode(code);
    }

    if (url.searchParams.has('error')) {
      this.error = url.searchParams.get('error') || '';
      this.errorDescription = url.searchParams.get('error_description') || '';
    }

    history.replaceState({}, '', location.pathname);

    this._subscriptions.add(merge(this._dropboxService.authLoaded, this._dropboxService.authChanged).subscribe(() => {
      this.onAuthChanged();
    }));
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  onAuthChanged(): void {
    this.isAuthenticated = this._dropboxService.isAuthenticated();
    this._changeDetectorRef.markForCheck();
  }

  login(): void {
    this._dropboxService.authorize();
  }

  download(): void {
    this._dropboxService.downloadFile();
  }

  reset(): void {
    this._dropboxService.removeAuth();
    window.open('https://www.dropbox.com/account/connected_apps', '_blank');
  }
}
