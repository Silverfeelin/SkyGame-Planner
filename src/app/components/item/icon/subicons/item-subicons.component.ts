import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { EventService } from 'src/app/services/event.service';
import { MatIcon } from '@angular/material/icon';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { IconComponent } from '../../../icon/icon.component';
import { IItem, INode, IIAP, IItemListNode } from 'skygame-data';

/**
 * Subicons drawn on top of item artwork. Deliberately not the `ItemSubicon`
 * union from skygame-data: the four mutually exclusive provenance markers
 * (ultimate, season pass, elder, IAP) collapse into one `source` slot, and
 * `level` is gated like every other marker instead of always rendering.
 */
export type ItemSubicon = 'source' | 'season' | 'favourite' | 'level' | 'unlock' | 'limited';

/** Everything the item has to say about itself. */
export const SUBICONS_ALL: ReadonlyArray<ItemSubicon> = ['source', 'season', 'favourite', 'level', 'unlock', 'limited'];
/** For hosts that are already scoped to one season, where the marker says nothing new. */
export const SUBICONS_NO_SEASON: ReadonlyArray<ItemSubicon> = ['source', 'favourite', 'level', 'unlock', 'limited'];
/** Only what is true of *your* copy of the item; drops where it came from. */
export const SUBICONS_BASE: ReadonlyArray<ItemSubicon> = ['favourite', 'level', 'unlock', 'limited'];
/** Artwork only. */
export const SUBICONS_NONE: ReadonlyArray<ItemSubicon> = [];

interface ISubiconTier {
  /** Favourite star. */
  sm: number;
  /** Owned badge diameter, ring included. Even, so the ring and check centre on whole pixels. */
  dot: number;
  /** Owned badge ring width. */
  ring: number;
  /** Emote level text. */
  level: number;
}

/**
 * Badge sizes per glyph size. Chosen rather than scaled: a 96px item at the
 * same ratio as a 64px one would draw a 36px badge over its artwork.
 */
const SUBICON_TIERS: { readonly [size: number]: ISubiconTier } = {
  24: { sm: 20, dot: 18, ring: 2, level: 13 },
  20: { sm: 17, dot: 16, ring: 2, level: 11 },
  18: { sm: 15, dot: 14, ring: 1, level: 10 },
  13: { sm: 12, dot: 10, ring: 1, level: 8 }
};

/** Below this the bottom left cannot hold the star and the level at once. */
const COMPACT_BELOW = 18;

interface ISubiconBadge {
  src: string;
  cls?: string;
  tooltip: string;
}

interface ISubiconSlots {
  /** Top left: where the item came from. */
  tl?: ISubiconBadge;
  /** Top right: which season the item belongs to. */
  tr?: ISubiconBadge;
  /** Bottom left, stacked with the star above the level. */
  star: boolean;
  level: number;
  /** Bottom right: green when owned through this node/IAP, amber when owned elsewhere. */
  dot?: 'self' | 'other';
  /** Bottom right, only while the item is not owned. */
  br?: ISubiconBadge;
}

const EMPTY_SLOTS: ISubiconSlots = { star: false, level: 0 };

@Component({
    selector: 'app-item-subicons',
    templateUrl: './item-subicons.component.html',
    styleUrl: './item-subicons.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IconComponent, TooltipDirective, MatIcon]
})
export class ItemSubIconsComponent implements OnChanges, OnDestroy {
  @Input() item?: IItem;
  @Input() node?: INode;
  @Input() iap?: IIAP;
  @Input() listNode?: IItemListNode;
  @Input() icons?: ReadonlyArray<ItemSubicon>;

  /**
   * Glyph size in pixels for the three corner badges. Hosts pick the tier that
   * suits their box; app-item-icon derives it from its own [size].
   */
  @Input() size = 20;

  @HostBinding('class.show-tooltips')
  @Input() showTooltips = false;

  slots: ISubiconSlots = EMPTY_SLOTS;

  /** app-icon needs the pixel size as an input to place sprite-sheet offsets. */
  sizePx = '20px';

  private readonly _subs = new SubscriptionBag();

  constructor(
    _eventService: EventService,
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this._subs.add(_eventService.itemFavourited.subscribe(item => {
      if (item !== this.item) { return; }
      this.updateSlots();
      this._changeDetectorRef.markForCheck();
    }));

    this._subs.add(_eventService.itemToggled.subscribe(item => {
      if (item !== this.item) { return; }
      this.updateSlots();
      this._changeDetectorRef.markForCheck();
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['size']) { this.applySize(); }
    this.updateSlots();
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  private applySize(): void {
    const size = this.size || 20;
    const tier = SUBICON_TIERS[size] ?? {
      sm: Math.round(size * 0.85),
      dot: 2 * Math.round(size * 0.4),
      ring: size >= 20 ? 2 : 1,
      level: Math.round(size * 0.55)
    };

    this.sizePx = `${size}px`;
    const style = this._elementRef.nativeElement.style;
    style.setProperty('--subicon-size', this.sizePx);
    style.setProperty('--subicon-size-sm', `${tier.sm}px`);
    style.setProperty('--subicon-dot', `${tier.dot}px`);
    style.setProperty('--subicon-ring', `${tier.ring}px`);
    style.setProperty('--subicon-level', `${tier.level}px`);
  }

  /**
   * Resolves every marker down to at most one badge per corner. Item state is
   * mutated in place elsewhere in the app, so this runs on the toggle events
   * rather than as a computed signal.
   */
  private updateSlots(): void {
    const item = this.item;
    if (!item || !this.icons?.length) { this.slots = EMPTY_SLOTS; return; }
    const allowed = new Set(this.icons);

    const star = allowed.has('favourite') && !!item.favourited;
    const compact = this.size < COMPACT_BELOW;
    const slots: ISubiconSlots = {
      tl: allowed.has('source') ? this.sourceBadge(item) : undefined,
      tr: allowed.has('season') && item.season?.iconUrl
        ? { src: item.season.iconUrl, tooltip: item.season.name }
        : undefined,
      star,
      level: allowed.has('level') && !(compact && star) ? (item.level || 0) : 0
    };

    if (allowed.has('unlock') && item.unlocked) {
      const self = (!this.node && !this.iap && !this.listNode)
        || !!this.node?.unlocked || !!this.iap?.bought || !!this.iap?.gifted || !!this.listNode?.unlocked;
      slots.dot = self ? 'self' : 'other';
    } else if (allowed.has('limited') && !item.unlocked && item.group === 'Limited') {
      slots.br = { src: 'update_disabled', cls: 'subicon-limited', tooltip: 'This item is limited and will not return.' };
    }

    this.slots = slots;
  }

  /**
   * The four provenance markers are mutually exclusive: an item has at most one
   * group, and the IAP marker only claims the corner when there is no group.
   * A season IAP is tinted like the other seasonal markers, a regular one white.
   */
  private sourceBadge(item: IItem): ISubiconBadge | undefined {
    switch (item.group) {
      case 'Ultimate':   return { src: '#season-heart',    cls: 'seasonal', tooltip: 'This item is a season ultimate.' };
      case 'SeasonPass': return { src: '#gift',            cls: 'seasonal', tooltip: 'This item is or was in a season pass.' };
      case 'Elder':      return { src: '#ascended-candle', tooltip: 'This item is from an Elder.' };
    }

    if (!item.iaps?.length) { return undefined; }
    return item.iaps.some(iap => !!iap.shop?.season)
      ? { src: '#gift', cls: 'seasonal', tooltip: 'This item is from a season in-app purchase.' }
      : { src: '#gift', cls: 'currency', tooltip: 'This item is from an in-app purchase.' };
  }
}
