import { ChangeDetectionStrategy, Component, Injector, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { StorageProviderFactory } from 'src/app/services/storage/storage-provider-factory';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorageComponent {
  errorMessage?: string;
  storageType: string;
  hasDbx = false;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _storageService: StorageService,
    private readonly _storageProviderFactory: StorageProviderFactory
  ) {
    const query = _route.snapshot.queryParamMap;
    this.errorMessage = query.get('error') || undefined;
    this.storageType = localStorage.getItem('storage.type') || '';

    if (this.errorMessage) {
      history.replaceState(null, '', _router.url.split('?')[0]);
    }
    this.hasDbx = !!localStorage.getItem('dbx-accessToken');
  }

  useLocalStorage(): void {
    if (this.storageType === '') { return; }
    if (!confirm('Are you sure you want to use local storage?')) { return; }
    this.setStorageType('');
  }

  useDropbox(): void {
    if (this.storageType === 'dropbox') { return; }
    if (!this.hasDbx) { return this.linkDropbox(); }
    if (!confirm('Are you sure you want to use Dropbox?')) { return; }
    this.setStorageType('dropbox');
  }

  linkDropbox(): void {
    void this._router.navigate(['/dropbox-auth']);
  }

  private setStorageType(type: string): void {
    this.storageType = type;
    localStorage.setItem('storage.type', type);
    this._storageService.setStorageProvider(this._storageProviderFactory.get());
  }
}
