import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IEventInstance, IItem, ISeason, ItemGroup, ItemType } from 'skygame-data';
import { NavigationHelper } from '@app/helpers/navigation-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { EventService } from '@app/services/event.service';
import { GoalService } from '@app/services/goal.service';
import { ItemDyeVersionService } from '@app/services/item-dye-version.service';
import { StorageService } from '@app/services/storage.service';
import { SettingService } from '@app/services/setting.service';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { ItemSubIconsComponent, SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { ImageOverlayComponent } from '@app/components/layout/image-overlay/image-overlay.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { ITEM_GRID_CATEGORIES } from '../grid/item-grid-layout.component';

interface IItemGroupFact { label: string; icon: string; note: string; }

const TSC_TYPES: ReadonlySet<ItemType> = new Set([
  ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
  ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
  ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Cape
]);

const GROUP_FACTS: { [key in ItemGroup]: IItemGroupFact } = {
  Elder: { label: 'Elder', icon: 'auto_awesome', note: '' },
  SeasonPass: { label: 'Season Pass', icon: 'workspace_premium', note: '' },
  Ultimate: { label: 'Season ultimate', icon: 'favorite', note: '' },
  Limited: { label: 'Limited', icon: 'update_disabled', note: 'Will likely not return.' }
};

/** The summary card of an item: its facts, artwork and links. Shared by the item page and the item panel. */
@Component({
  selector: 'app-item-summary',
  templateUrl: './item-summary.component.html',
  styleUrl: './item-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, ItemIconComponent, ItemSubIconsComponent, WikiLinkComponent, ImageOverlayComponent, ItemTypePipe]
})
export class ItemSummaryComponent {
  readonly SUBICONS_ALL = SUBICONS_ALL;

  private readonly _eventService = inject(EventService);
  private readonly _storageService = inject(StorageService);
  private readonly _goalService = inject(GoalService);
  private readonly _dyeVersionService = inject(ItemDyeVersionService);
  private readonly _settingService = inject(SettingService);

  readonly item = input.required<IItem>();

  /** Bumped when the item is favourited or toggled, since those mutate the item in place. */
  private readonly _refresh = signal(0);

  readonly favourited = computed(() => { this._refresh(); return !!this.item().favourited; });
  readonly unlocked = computed(() => { this._refresh(); return !!this.item().unlocked; });
  readonly isGoal = computed(() => this._goalService.items().includes(this.item().guid));
  readonly navSource = computed(() => NavigationHelper.getItemSource(this.item()));
  readonly navList = computed(() => NavigationHelper.getItemListLink(this.item()));
  readonly tscUrl = computed(() => {
    const item = this.item();
    return TSC_TYPES.has(item.type)
      ? `https://thatskycollection.com/gallery?items=${encodeURIComponent(item.guid)}`
      : undefined;
  });
  readonly showPreview = signal(false);
  readonly debugVisible = this._settingService.debugVisible;

  readonly typeIcon = computed(() => {
    const type = this.item().type;
    return ITEM_GRID_CATEGORIES.find(c => c.type === type)?.svgIcon;
  });

  /** The season the item was introduced in, from the item itself or its first source. */
  readonly season = computed<ISeason | undefined>(() => {
    const item = this.item();
    if (item.season) { return item.season; }
    const origin = ItemHelper.geSourceOrigin(ItemHelper.getItemSource(item));
    return origin?.type === 'season' ? origin.source : undefined;
  });

  /** The last event instance the item appeared in; recurring events keep returning it. */
  readonly eventInstance = computed<IEventInstance | undefined>(() => {
    const origin = ItemHelper.geSourceOrigin(ItemHelper.getItemSource(this.item(), true));
    return origin?.type === 'event' ? origin.source : undefined;
  });

  /** The in-app purchase the item is sold in; the last one is the current offer. */
  readonly iap = computed(() => this.item().iaps?.at(-1));

  readonly group = computed<IItemGroupFact | undefined>(() => {
    const group = this.item().group;
    return group ? GROUP_FACTS[group] : undefined;
  });

  readonly dyeSlots = computed(() => {
    const dye = this.item().dye;
    if (!dye) { return ''; }
    const count = (dye.primary ? 1 : 0) + (dye.secondary ? 1 : 0);
    return count ? `${count} ${count === 1 ? 'slot' : 'slots'}` : 'Dyeable';
  });

  /** Dye costs, listed as the plant cost and the double cost of a dye bottle. */
  readonly dyeCost = computed(() => {
    const dye = this.item().dye;
    if (!dye) { return ''; }
    const costs = [
      dye.primary?.cost && `primary ${dye.primary.cost} / ${dye.primary.cost * 2}`,
      dye.secondary?.cost && `secondary ${dye.secondary.cost} / ${dye.secondary.cost * 2}`
    ].filter(Boolean);
    return costs.length ? `(${costs.join(' · ')})` : '';
  });

  readonly dyeVersionCount = computed(() => this._dyeVersionService.count(this.item().guid));

  constructor() {
    // The item can be unlocked from another tab or from the icon subicons, so the
    // status fact tracks the toggle instead of only the value read on navigation.
    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(item => {
      if (item.guid !== untracked(this.item).guid) { return; }
      this._refresh.update(v => v + 1);
    });

    // An open image belongs to the previous item.
    effect(() => {
      this.item();
      untracked(() => this.showPreview.set(false));
    });
  }

  toggleGoal(): void {
    this._goalService.toggle(this.item().guid);
  }

  toggleFavourite(): void {
    const item = this.item();
    item.favourited = !item.favourited;
    item.favourited
      ? this._storageService.addFavourites(item.guid)
      : this._storageService.removeFavourites(item.guid);
    this._refresh.update(v => v + 1);
    this._eventService.itemFavourited.next(item);
  }

  scrollToDyeVersions(): void {
    document.getElementById('dye-versions')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  copy(text: string | number | undefined): void {
    if (text == null) { return; }
    navigator.clipboard.writeText(`${text}`);
  }
}
