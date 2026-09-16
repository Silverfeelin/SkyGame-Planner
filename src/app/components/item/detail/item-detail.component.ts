import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { take } from 'rxjs';
import { IEventInstance, IItem, ISeason, ItemGroup } from 'skygame-data';
import { INavigationTarget, NavigationHelper } from '@app/helpers/navigation-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { TitleService } from '@app/services/title.service';
import { SettingService } from '@app/services/setting.service';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { ItemSubIconsComponent, SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { ImageOverlayComponent } from '@app/components/layout/image-overlay/image-overlay.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { ItemQuickActionsComponent } from '../quick-actions/item-quick-actions.component';
import { ITEM_GRID_CATEGORIES } from '../grid/item-grid-layout.component';

interface IItemGroupFact { label: string; icon: string; note: string; }

const GROUP_FACTS: { [key in ItemGroup]: IItemGroupFact } = {
  Elder: { label: 'Elder', icon: 'auto_awesome', note: '' },
  SeasonPass: { label: 'Season Pass', icon: 'workspace_premium', note: '' },
  Ultimate: { label: 'Season ultimate', icon: 'favorite', note: '' },
  Limited: { label: 'Limited', icon: 'update_disabled', note: 'Will likely not return.' }
};

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, ItemIconComponent, ItemSubIconsComponent, WikiLinkComponent, ImageOverlayComponent, ItemTypePipe, ItemQuickActionsComponent]
})
export class ItemDetailComponent {
  readonly SUBICONS_ALL = SUBICONS_ALL;

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
  readonly unlocked = signal(false);
  readonly dyePreviewMode = signal<0 | 1 | 2>(0);
  readonly showPreview = signal(false);
  readonly showTipUnlock = signal(false);
  readonly debugVisible = this._settingService.debugVisible;

  readonly typeIcon = computed(() => {
    const type = this.item()?.type;
    return ITEM_GRID_CATEGORIES.find(c => c.type === type)?.svgIcon;
  });

  /** The season the item was introduced in, from the item itself or its first source. */
  readonly season = computed<ISeason | undefined>(() => {
    const item = this.item();
    if (!item) { return undefined; }
    if (item.season) { return item.season; }
    const origin = ItemHelper.geSourceOrigin(ItemHelper.getItemSource(item));
    return origin?.type === 'season' ? origin.source : undefined;
  });

  /** The last event instance the item appeared in; recurring events keep returning it. */
  readonly eventInstance = computed<IEventInstance | undefined>(() => {
    const item = this.item();
    if (!item) { return undefined; }
    const origin = ItemHelper.geSourceOrigin(ItemHelper.getItemSource(item, true));
    return origin?.type === 'event' ? origin.source : undefined;
  });

  /** The in-app purchase the item is sold in; the last one is the current offer. */
  readonly iap = computed(() => this.item()?.iaps?.at(-1));

  readonly group = computed<IItemGroupFact | undefined>(() => {
    const group = this.item()?.group;
    return group ? GROUP_FACTS[group] : undefined;
  });

  readonly dyeSlots = computed(() => {
    const dye = this.item()?.dye;
    if (!dye) { return ''; }
    const count = (dye.primary ? 1 : 0) + (dye.secondary ? 1 : 0);
    return count ? `${count} ${count === 1 ? 'slot' : 'slots'}` : 'Dyeable';
  });

  /** Dye costs, listed as the plant cost and the double cost of a dye bottle. */
  readonly dyeCost = computed(() => {
    const dye = this.item()?.dye;
    if (!dye) { return ''; }
    const costs = [
      dye.primary?.cost && `primary ${dye.primary.cost} / ${dye.primary.cost * 2}`,
      dye.secondary?.cost && `secondary ${dye.secondary.cost} / ${dye.secondary.cost * 2}`
    ].filter(Boolean);
    return costs.length ? `(${costs.join(' · ')})` : '';
  });

  constructor() {
    this._route.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(params => {
      this.resolveItem(params.get('guid') ?? '');
    });

    this._route.queryParamMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(params => {
      this.showTipUnlock.set(params.get('showTipUnlock') === '1');
    });

    // The item can be unlocked from another tab or from the icon subicons, so the
    // status fact tracks the toggle instead of only the value read on navigation.
    this._eventService.itemToggled.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(item => {
      if (item.guid !== this.item()?.guid) { return; }
      this.unlocked.set(!!item.unlocked);
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
    this.unlocked.set(!!item?.unlocked);
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

  goBack(): void {
    window.history.back();
  }

  preventDefault(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
