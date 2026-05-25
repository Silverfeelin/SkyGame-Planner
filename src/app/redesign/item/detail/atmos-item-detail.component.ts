import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { take } from 'rxjs';
import { IItem } from 'skygame-data';
import { INavigationTarget, NavigationHelper } from '@app/helpers/navigation-helper';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { TitleService } from '@app/services/title.service';
import { SettingService } from '@app/services/setting.service';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ItemSubIconsComponent } from '@app/components/items/item-icon/item-subicons/item-subicons.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';

@Component({
  selector: 'app-atmos-item-detail',
  templateUrl: './atmos-item-detail.component.html',
  styleUrl: './atmos-item-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, ItemIconComponent, ItemSubIconsComponent, WikiLinkComponent, OverlayComponent]
})
export class AtmosItemDetailComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _dataService = inject(DataService);
  private readonly _eventService = inject(EventService);
  private readonly _storageService = inject(StorageService);
  private readonly _titleService = inject(TitleService);
  private readonly _settingService = inject(SettingService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly item = signal<IItem | undefined>(undefined);
  readonly navSource = signal<INavigationTarget | undefined>(undefined);
  readonly navList = signal<INavigationTarget | undefined>(undefined);
  readonly favourited = signal(false);
  readonly dyePreviewMode = signal<0 | 1 | 2>(0);
  readonly showTipUnlock = signal(false);
  readonly debugVisible = this._settingService.debugVisible;

  constructor() {
    this._route.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(params => {
      this.resolveItem(params.get('guid') ?? '');
    });

    this._route.queryParamMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(params => {
      this.showTipUnlock.set(params.get('showTipUnlock') === '1');
    });
  }

  private resolveItem(guid: string): void {
    if (this._dataService.guidMap.size === 0) {
      this._dataService.onData.pipe(take(1)).subscribe(() => this.resolveItem(guid));
      return;
    }

    const item = this._dataService.guidMap.get(guid) as IItem | undefined;
    this.item.set(item);
    this.favourited.set(!!item?.favourited);
    this.navSource.set(item ? NavigationHelper.getItemSource(item) : undefined);
    this.navList.set(item ? NavigationHelper.getItemListLink(item) : undefined);
    this._titleService.setTitle(item?.name ?? 'Item');
  }

  toggleFavourite(): void {
    const item = this.item();
    if (!item) { return; }
    item.favourited = !item.favourited;
    this.favourited.set(!!item.favourited);
    item.favourited
      ? this._storageService.addFavourites(item.guid)
      : this._storageService.removeFavourites(item.guid);
    this._eventService.itemFavourited.next(item);
  }

  copy(text: string | number | undefined): void {
    if (text == null) { return; }
    navigator.clipboard.writeText(`${text}`);
  }

  openSrc(event: Event): void {
    this.preventDefault(event);
    const src = (event.target as HTMLImageElement).src;
    window.open(src, '_blank');
  }

  goBack(): void {
    window.history.back();
  }

  preventDefault(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
