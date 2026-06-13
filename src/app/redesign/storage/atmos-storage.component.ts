import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { StorageService } from '@app/services/storage.service';
import { StorageProviderFactory } from '@app/services/storage/storage-provider-factory';

@Component({
  selector: 'app-atmos-storage',
  templateUrl: './atmos-storage.component.html',
  styleUrl: './atmos-storage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'atmospheric' },
  imports: [RouterLink, MatIcon]
})
export class AtmosStorageComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _storageService = inject(StorageService);
  private readonly _storageProviderFactory = inject(StorageProviderFactory);

  readonly errorParam = signal<string | undefined>(undefined);
  readonly storageType = signal<string>(localStorage.getItem('storage.type') || '');
  readonly hasDbx = signal<boolean>(!!localStorage.getItem('dbx-accessToken'));

  ngOnInit(): void {
    const query = this._route.snapshot.queryParamMap;
    const error = query.get('error') || undefined;
    this.errorParam.set(error);
    if (error) {
      history.replaceState(null, '', this._router.url.split('?')[0]);
    }
  }

  useLocalStorage(): void {
    if (this.storageType() === '') { return; }
    if (!confirm('Are you sure you want to use local storage?')) { return; }
    this.setStorageType('');
  }

  useDropbox(): void {
    if (this.storageType() === 'dropbox') { return; }
    if (!this.hasDbx()) { return this.linkDropbox(); }
    if (!confirm('Are you sure you want to use Dropbox?')) { return; }
    this.setStorageType('dropbox');
  }

  linkDropbox(): void {
    void this._router.navigate(['/r/dropbox-auth']);
  }

  private setStorageType(type: string): void {
    this.storageType.set(type);
    localStorage.setItem('storage.type', type);
    this._storageService.setStorageProvider(this._storageProviderFactory.get());
  }
}
