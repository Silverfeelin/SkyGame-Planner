import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GuardResult, NavigationEnd, Router, UrlTree, RouterOutlet, RouterLink } from '@angular/router';
import { Observable, SubscriptionLike, delay, filter, forkJoin, of } from 'rxjs';
import { canActivateData } from 'src/app/guards/can-activate-data';
import { canActivateStorage } from 'src/app/guards/can-activate-storage';
import { DataService, ITrackables } from 'src/app/services/data.service';
import { StorageService } from 'src/app/services/storage.service';
import { IStorageEvent, StorageEventType } from 'src/app/services/storage/storage-provider.interface';
import { MatIcon } from '@angular/material/icon';
import { canActivateIcons } from '@app/guards/can-activate-icons';
import { OverlayComponent } from "../overlay/overlay.component";
import { AtmosphericTopbarComponent } from '@app/redesign/shell/atmospheric-topbar.component';
import { AtmosphericSidebarComponent } from '@app/redesign/shell/atmospheric-sidebar.component';
import { AtmosphericFooterComponent } from '@app/redesign/shell/atmospheric-footer.component';

@Component({
    selector: 'app-main-layout',
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'atmospheric' },
    imports: [MatIcon, RouterOutlet, RouterLink, OverlayComponent, AtmosphericTopbarComponent, AtmosphericSidebarComponent, AtmosphericFooterComponent]
})
export class MainLayoutComponent implements OnDestroy {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    // If storage is out of sync, warn on page leave.
    if (!this._storageService.isOutOfSync()) { return; }
    event.preventDefault();
  }

  loading = false;
  ready = false;
  err: any;
  storageSaveError?: Error;
  storageSaveState?: StorageEventType;
  showSaveIndicator = false;
  showChrome = signal(true);

  _storageSub?: SubscriptionLike;

  constructor(
    private readonly _router: Router,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService
  ) {
    this._updateChrome();
    _router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => {
      this._updateChrome();
    });
    of(undefined).pipe(delay(100)).subscribe(() => {
      if (this.ready || this.err) { return; }
      this.loading = true;
      _changeDetectorRef.markForCheck();
    });

    // Workaround for me not knowing how to handle this with canActivateChild guards while showing a loader in the parent.
    let data$ = canActivateData(null as any, null as any) as Observable<GuardResult>;
    let icons$ = canActivateIcons(null as any, null as any) as Observable<GuardResult>;
    let storage$ = canActivateStorage(null as any, null as any) as Observable<GuardResult>;

    if (data$ instanceof Promise) { throw new Error('Promise not supported.'); }
    if (icons$ instanceof Promise) { throw new Error('Promise not supported.'); }
    if (storage$ instanceof Promise) { throw new Error('Promise not supported.'); }
    if (data$ instanceof UrlTree || typeof data$ === 'boolean') { data$ = of(data$); }
    if (icons$ instanceof UrlTree || typeof icons$ === 'boolean') { icons$ = of(icons$); }
    if (storage$ instanceof UrlTree || typeof storage$ === 'boolean') { storage$ = of(storage$); }

    forkJoin({ data: data$, icons: icons$, storage: storage$ }).subscribe({
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

  saveTimeout?: number;
  onStorageEvent(evt: IStorageEvent) {
    // Show storage error message.
    switch (evt.type) {
      case 'save_start': case 'data_changed': break;
      case 'save_error': this.storageSaveError = evt.error; break;
      case 'save_success': this.storageSaveError = undefined; break;
        default: return;
    }

    // Update indicator.
    this.storageSaveState = evt.type;
    this.showSaveIndicator = true;

    if (this.saveTimeout) { clearTimeout(this.saveTimeout); }
    if (evt.type === 'save_success') {
      this.saveTimeout = window.setTimeout(() => {
        this.showSaveIndicator = false;
        this._changeDetectorRef.markForCheck();
      }, 2500);
    }
    this._changeDetectorRef.markForCheck();
  }

  retrySaveStorage(): void {
    this._storageService.provider.save(true).subscribe();
  }

  refresh(): void {
    window.location.reload();
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

  private _updateChrome(): void {
    let route = this._router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
      if (route.data['chrome'] === false) {
        this.showChrome.set(false);
        return;
      }
    }
    this.showChrome.set(true);
  }

  private updateDataWithStorage(): void {
    const trackables: ITrackables = {
      unlocked: this._storageService.getUnlocked(),
      wingedLights: this._storageService.getWingedLights(),
      favourites: this._storageService.getFavourites(),
      gifted: this._storageService.getGifted()
    };

    this._dataService.refreshUnlocked(trackables);
  }
}
