import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import {
  CONNECT_APPS, CONNECT_DATA_VERSION, CONNECT_SCOPES, ConnectScopeKey, IConnectAck, IConnectApp, IConnectResponse
} from './connect-apps';

type ConnectState = 'request' | 'sent' | 'denied' | 'error';

interface IScopeView {
  key: ConnectScopeKey;
  label: string;
  description: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'atmospheric', '(window:message)': 'onMessage($event)' },
  imports: [RouterLink, MatIcon]
})
export class ConnectComponent {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);

  readonly state = signal<ConnectState>('request');
  readonly error = signal<string | undefined>(undefined);
  readonly app?: IConnectApp;
  readonly hostname: string = '';
  readonly scopes: Array<IScopeView> = [];
  readonly unavailableScopes: Array<string> = [];
  readonly canShare = computed(() => this.state() === 'request' && this.scopes.length > 0);

  private readonly _nonce?: string;

  constructor() {
    const query = inject(ActivatedRoute).snapshot.queryParamMap;
    this.app = CONNECT_APPS[query.get('app') ?? ''];
    this._nonce = query.get('nonce')?.substring(0, 256) || undefined;
    if (!this.app) { this._fail('This link was not made by a site that Sky Planner shares data with.'); return; }

    this.hostname = new URL(this.app.url).hostname;
    const requested = new Set((query.get('scope') ?? '').split(/[\s,]+/).filter(Boolean));
    for (const key of requested) {
      if (!this.app.scopes.includes(key as ConnectScopeKey)) { this.unavailableScopes.push(key); continue; }
      const scope = CONNECT_SCOPES[key as ConnectScopeKey];
      this.scopes.push({ key: key as ConnectScopeKey, ...scope, count: scope.count(this._dataService) });
    }

    if (window.top !== window) { this._fail('This page can not be embedded in another site.'); return; }
    if (!this._opener()) { this._fail(`Open this page from ${this.app.name} to share your data.`); return; }
    if (!this.scopes.length) { this._fail(`${this.app.name} did not ask for any data Sky Planner can share.`); }
  }

  allow(): void {
    const scopes: IConnectResponse['scopes'] = {};
    for (const scope of this.scopes) {
      scopes[scope.key] = CONNECT_SCOPES[scope.key].resolve(this._dataService, this._storageService);
    }
    if (this._post('granted', scopes)) { this.state.set('sent'); }
  }

  deny(): void {
    if (!this._post('denied', {})) { return; }
    this.state.set('denied');
    window.close();
  }

  close(): void {
    window.close();
  }

  onMessage(event: MessageEvent): void {
    if (!this.app?.origins.includes(event.origin) || event.source !== this._opener()) { return; }
    const ack = event.data as IConnectAck | undefined;
    if (ack?.type !== 'sky-planner:connect:ack' || ack.nonce !== this._nonce) { return; }
    window.close();
  }

  private _post(status: IConnectResponse['status'], scopes: IConnectResponse['scopes']): boolean {
    const opener = this._opener();
    if (!this.app || !opener) {
      this._fail(`The ${this.app?.name ?? 'other'} window was closed. Please try again from there.`);
      return false;
    }

    const response: IConnectResponse = {
      type: 'sky-planner:connect',
      nonce: this._nonce,
      status,
      dataVersion: CONNECT_DATA_VERSION,
      scopes
    };

    // Post data to every origin.
    for (const origin of this.app.origins) {
      opener.postMessage(response, origin);
    }
    return true;
  }

  private _opener(): Window | undefined {
    const opener = window.opener as Window | null;
    return opener && !opener.closed ? opener : undefined;
  }

  private _fail(message: string): void {
    this.error.set(message);
    this.state.set('error');
  }
}
