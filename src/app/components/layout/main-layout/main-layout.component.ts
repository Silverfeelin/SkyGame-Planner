import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { GuardResult, MaybeAsync, Router, UrlTree } from '@angular/router';
import { SubscriptionLike, delay, forkJoin, of } from 'rxjs';
import { canActivateData } from 'src/app/guards/can-activate-data';
import { canActivateStorage } from 'src/app/guards/can-activate-storage';
import { DataService, ITrackables } from 'src/app/services/data.service';
import { StorageService } from 'src/app/services/storage.service';
import { IStorageEvent } from 'src/app/services/storage/storage-provider.interface';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnDestroy {
  loading = false;
  ready = false;
  err: any;
  storageSaveError?: Error;

  _storageSub?: SubscriptionLike;

  constructor(
    private readonly _router: Router,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService
  ) {
    of(undefined).pipe(delay(100)).subscribe(() => {
      if (this.ready || this.err) { return; }
      this.loading = true;
      _changeDetectorRef.markForCheck();
    });

    // Workaround for me not knowing how to handle this with canActivateChild guards while showing a loader in the parent.
    let data$ = canActivateData(null as any, null as any) as MaybeAsync<GuardResult>;
    let storage$ = canActivateStorage(null as any, null as any) as MaybeAsync<GuardResult>;

    if (data$ instanceof Promise) { throw new Error('Promise not supported.'); }
    if (storage$ instanceof Promise) { throw new Error('Promise not supported.'); }
    if (data$ instanceof UrlTree || typeof data$ === 'boolean') { data$ = of(data$); }
    if (storage$ instanceof UrlTree || typeof storage$ === 'boolean') { storage$ = of(storage$); }

    forkJoin({ data: data$, storage: storage$ }).subscribe({
      next: model => {
        if (model.storage instanceof UrlTree) {
          this._router.navigateByUrl(model.storage);
          return;
        }

        // Update data with storage data.
        this.updateDataWithStorage();

        _storageService.events.subscribe(evt => {
          this.onStorageEvent(evt);
        });

        this.ready = true;
        this._changeDetectorRef.markForCheck();
      },
      error: err => {
        this.err = err;
        console.error(err);
      }
    }).add(() => {
      this.loading = false;
      _changeDetectorRef.markForCheck();
    });
  }

  onStorageEvent(evt: IStorageEvent) {
    if (evt.type === 'save_error') {
      this.storageSaveError = evt.error;
    } else if (evt.type === 'save_success') {
      this.storageSaveError = undefined;
    } else { return; }
    this._changeDetectorRef.markForCheck();
  }

  retrySaveStorage(): void {
    this._storageService.provider.save().subscribe();
  }

  copy(evt: Event): void {
    evt.preventDefault();
    evt.stopPropagation();
    const txt = (evt.target as HTMLElement).innerText;
    navigator.clipboard.writeText(txt);
  }

  ngOnDestroy(): void {
    this._storageSub?.unsubscribe();
  }

  private updateDataWithStorage(): void {
    const trackables: ITrackables = {
      unlocked: this._storageService.getUnlocked(),
      wingedLights: this._storageService.getWingedLights(),
      favourites: this._storageService.getFavourites()
    };

    this._dataService.refreshUnlocked(trackables);
  }
}
