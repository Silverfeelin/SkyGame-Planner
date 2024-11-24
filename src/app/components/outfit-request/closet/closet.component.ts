import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IItem, ItemSize, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { SearchService } from 'src/app/services/search.service';
import { HttpClient } from '@angular/common/http';
import { SubscriptionLike, lastValueFrom } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { IOutfitRequestBackground, IOutfitRequestBackgrounds } from 'src/app/interfaces/outfit-request.interface';
import { DateHelper, PeriodState } from 'src/app/helpers/date-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import introJs from 'intro.js';
import { IntroStep, TooltipPosition } from 'intro.js/src/core/steps';
import { ITravelingSpirit } from 'src/app/interfaces/traveling-spirit.interface';
import { IEventInstance } from 'src/app/interfaces/event.interface';
import { IReturningSpirit, IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';
import { ItemIconComponent } from '../../items/item-icon/item-icon.component';
import { SpiritTypeIconComponent } from '../../spirit-type-icon/spirit-type-icon.component';
import { CardComponent } from '../../layout/card/card.component';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { NgIf, NgFor, NgTemplateOutlet, NgClass } from '@angular/common';
import { FirefoxClipboardItemComponent } from '../../util/firefox-clipboard-item/firefox-clipboard-item.component';
import { IconService } from '@app/services/icon.service';
import { drawFingerprint } from '../closet-fingerprint';
import { OverlayComponent } from "../../layout/overlay/overlay.component";

interface ISelection { [guid: string]: IItem; }
interface IOutfitRequest { a?: string; r: string; y: string; g: string; b: string; d?: string; };

type RequestColor = 'r' | 'y' | 'g' | 'b';
type ClosetMode = 'all' | 'closet';
type CopyImageMode = 'request' | 'square' | 'closet' | 'template';

/** Size of padding from edge. */
const _wPad = 24;
/** Size of item icon */
const _wItem = 64;
/** Size of dye icon */
const _wDye = 32;
/** Size of gap between items. */
const _wGap = 8;
/** Size of item with gap. */
const _wBox = _wItem + _wGap;
/** Alpha for missing items. */
const _aHide = 0.1;
const _aHalfHide = 0.4;

interface IDye {
  primary?: DyeColor;
  secondary?: DyeColor;
}

type DyeColor = 'red' | 'purple' | 'blue' | 'cyan' | 'green' | 'yellow' | 'black' | 'white';
const dyeColors = ['red', 'purple', 'blue', 'cyan', 'green', 'yellow', 'black', 'white'];

@Component({
    selector: 'app-closet',
    templateUrl: './closet.component.html',
    styleUrls: ['./closet.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FirefoxClipboardItemComponent, NgClass, NgIf, RouterLink, MatIcon, NgFor, CardComponent, SpiritTypeIconComponent, ItemIconComponent, NgbTooltip, NgTemplateOutlet, OverlayComponent]
})
export class ClosetComponent implements OnDestroy {
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;
  @ViewChild('ttCopyLnk', { static: false }) private readonly _ttCopyLnk?: NgbTooltip;
  @ViewChild('ttCopyImg', { static: false }) private readonly _ttCopyImg?: NgbTooltip;
  @ViewChild('warnHidden', { static: false }) private readonly _warnHidden?: ElementRef<HTMLElement>;
  @ViewChild('divColorPicker', { static: false }) private readonly _divColorPicker?: ElementRef<HTMLElement>;
  @ViewChild('divCopyImagePicker', { static: false }) private readonly _divCopyImagePicker?: ElementRef<HTMLElement>;
  @ViewChild('divClosetContainer', { static: false }) private readonly _divClosetContainer?: ElementRef<HTMLElement>;
  @ViewChild('divDyePicker', { static: true }) private readonly _divDyePicker!: ElementRef<HTMLElement>;

  // Background
  _bgImg!: HTMLImageElement;
  bgAttribution?: string;
  bgFilter?: string;
  backgroundSections: Array<IOutfitRequestBackgrounds> = [];
  backgroundSectionMap: { [guid: string]: IOutfitRequestBackgrounds } = {};
  backgroundMap: { [guid: string]: IOutfitRequestBackground } = {};

  // Item type data
  itemTypes: Array<ItemType> = [
    ItemType.Outfit, ItemType.Shoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
    ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop
  ];
  itemTypeOrder: { [key: string]: number } = this.itemTypes.reduce((map, type, i) => (map[type] = i, map), {} as { [key: string]: number });
  itemIcons: { [key: string]: string } = {
    'Outfit': 'outfit',
    'Shoes': 'shoes',
    'Mask': 'mask',
    'FaceAccessory': 'face-acc',
    'Necklace': 'necklace',
    'Hair': 'hair',
    'HairAccessory': 'hair-acc',
    'HeadAccessory': 'head-acc',
    'Cape': 'cape',
    'Held': 'held',
    'Furniture': 'shelf',
    'Prop': 'cup'
  };

  // Item data
  allItems: Array<IItem> = [];
  itemMap: { [guid: string]: IItem } = {};
  items: { [type: string]: Array<IItem> } = {};
  ongoingItems: { [guid: string]: IItem } = {};

  showingColorPicker = false;
  showingBackgroundPicker = false;
  showingImagePicker = false;
  showingDyePicker = false;
  dyeItem?: IItem;

  // Item selection
  color?: RequestColor = 'r';
  selected: { all: ISelection, r: ISelection, y: ISelection, g: ISelection, b: ISelection } = { all: {}, r: {}, y: {}, g: {}, b: {}};
  dyes: { [guid: string]: Array<IDye> } = {};
  dyeClasses: { [key: string]: Array<string> | undefined } = {};
  hidden: { [guid: string]: boolean } = {};
  available?: ISelection;

  selectionHasHidden = false;
  selectionHasUnavailable = false;

  // Search
  searchText?: string;
  _lastSearchText = '';
  searchResults?: { [guid: string]: IItem };

  // Closet display
  requesting = false;
  modifyingCloset = false;
  shouldSync = false;
  hideUnselected = false;
  hideIap = false;
  showOngoing = false;
  columns: number;
  closetMode: ClosetMode = 'all';
  maxColumns = 8;
  itemSize: ItemSize = 'small';
  itemSizePx = 32;
  typeFolded: { [key: string]: boolean } = {};
  isRendering: number = 0; // 1 = link, 2 = image
  lastLink?: string; // Reuse last copy link to prevent unnecessary KV writes.

  // Traveling Spirit
  ts?: ITravelingSpirit;
  tsState?: PeriodState;
  tsItems?: Array<IItem>;
  // Returning Spirits
  rs?: IReturningSpirits;
  rsSpirits: Array<{ returning: IReturningSpirit, items: Array<IItem> }> = [];
  // Event
  events: Array<{instance: IEventInstance, items: Array<IItem>, iapItems: Array<IItem>}> = [];

  // Internal
  _clickSub: SubscriptionLike;

  _imgNone = new Image();
  _imgUnknown = new Image();
  _imgSheets: { [key: string]: HTMLImageElement } = {};
  _svgDyes: { [key: string]: SVGElement } = {};

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _iconService: IconService,
    private readonly _searchService: SearchService,
    private readonly _matIconRegistry: MatIconRegistry,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _http: HttpClient,
    private readonly _route: ActivatedRoute
  ) {
    this.requesting = location.pathname.endsWith('request');

    this._imgNone.src = '/assets/icons/none.webp';
    this._imgUnknown.src = '/assets/icons/question.webp';
    _iconService.getSheets().forEach(sheet => {
      const img = new Image();
      img.src = `/assets/game/${sheet}`;
      this._imgSheets[sheet] = img;
    });

    // Load dye SVGs
    ['none', ...dyeColors].forEach(d => {
      _matIconRegistry.getNamedSvgIcon(`dye-${d}`).subscribe(svg => { this._svgDyes[d] = svg; });
    });

    // Load user preferences.
    this.hideUnselected = localStorage.getItem('closet.hide-unselected') === '1';
    this.showOngoing = localStorage.getItem('closet.show-ongoing') === '1'
    this.hidden = (JSON.parse(localStorage.getItem('closet.hidden') || '[]') as Array<string>).reduce((map, guid) => (map[guid] = true, map), {} as { [key: string]: boolean });
    this.columns = +localStorage.getItem('closet.columns')! || 6;
    this.closetMode = localStorage.getItem('closet.show-mode') as ClosetMode || 'all';
    this.itemSize = localStorage.getItem('closet.item-size') as ItemSize || 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;
    this.shouldSync = localStorage.getItem('closet.sync') === '1';
    // Don't save hide IAP. Conflicts with other visibility code.

    this.initializeBackground();
    this.initializeItems();
    this.initializeTs();
    this.initializeRs();
    this.initializeEvents();

    this._clickSub = _eventService.clicked.subscribe(evt => {
      this.clickoutColorPicker(evt);
      this.clickoutCopyImagePicker(evt);
    });
  }

  ngOnDestroy(): void {
    this._clickSub.unsubscribe();
  }

  showDyePicker(item: IItem, evt: MouseEvent): void {
    if (!item.dyeSlots) { return; }
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.showingDyePicker = true;
    this.dyeItem = item;
    this.dyes[item.guid] ??= Array.from({ length: item.dyeSlots }, () => ({}));
  }

  closeDyePicker(): void {
    this.showingDyePicker = false;
    this.dyeItem = undefined;
    this.updateUrlFromSelection();
  }

  selectDye(index: number, type: 'primary' | 'secondary', color: DyeColor | undefined): void {
    if (!this.dyeItem) { return; }
    const dye = this.dyes[this.dyeItem.guid];
    if (!dye[index]) { dye[index] = {}; }
    dye[index][type] = color;

    if (type === 'primary') {
      if (!this.dyeClasses[this.dyeItem.guid]) { this.dyeClasses[this.dyeItem.guid] = []; }
      this.dyeClasses[this.dyeItem.guid]![index] = color ? `dye-${color}` : '';
    }
  }

  /** Toggles item selection. */
  toggleItem(item: IItem): void {
    this.lastLink = undefined;

    if (this.modifyingCloset) {
      return this.toggleItemHidden(item);
    }

    if (!this.color) {
      delete this.selected.all[item.guid];
      delete this.selected.r[item.guid];
      delete this.selected.y[item.guid];
      delete this.selected.g[item.guid];
      delete this.selected.b[item.guid];
    } else {
      const selected = this.selected[this.color];
      const select = !selected[item.guid];
      if (select) {
        selected[item.guid] = item;
        this.selected.all[item.guid] = item;
      } else {
        delete selected[item.guid];
        if (!this.selected.r[item.guid] && !this.selected.y[item.guid] && !this.selected.g[item.guid] && !this.selected.b[item.guid]) {
          delete this.selected.all[item.guid];
        }
      }
    }

    this.updateUrlFromSelection();
    this.updateSelectionWarnings();
    this._changeDetectorRef.markForCheck();
  }

  /** Toggles the hidden status of an item when modifying closet. */
  toggleItemHidden(item: IItem): void {
    // Disable sync when modifying closet.
    if (this.shouldSync) {
      if (!confirm('Modifying your closet will disable syncing with your tracked items. Are you sure?')) { return; }
      this.shouldSync = false;
      localStorage.setItem('closet.sync', '0');
    }

    // Toggle item.
    const hide = !this.hidden[item.guid];
    hide ? (this.hidden[item.guid] = true) : (delete this.hidden[item.guid]);
    localStorage.setItem('closet.hidden', JSON.stringify(Object.keys(this.hidden)));
    this.updateSelectionWarnings();
    return;
  }

  /** Resets all selected items. */
  resetSelected(): void {
    if (!confirm('This will remove the color highlights from all items. Are you sure?')) { return; }
    this.selected = { all: {}, r: {}, y: {}, g: {}, b: {}};
    this.selectionHasHidden = false;
    const url = new URL(location.href);
    url.searchParams.delete('k');
    url.searchParams.delete('r');
    url.searchParams.delete('y');
    url.searchParams.delete('g');
    url.searchParams.delete('b');
    this.lastLink = undefined;
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  /** Sets a random selection of items. */
  randomSelection(): void {
    if (!confirm('This will randomly select items from your closet. Are you sure?')) { return; }
    this.selected = { all: {}, r: {}, y: {}, g: {}, b: {}};
    this.selectionHasHidden = false;

    const heldProp = Math.random() < 0.4;
    for (const type of Object.keys(this.items)) {
      if (type === ItemType.Held && !heldProp) { continue; }
      if (type === ItemType.Prop && heldProp) { continue; }
      if (type === ItemType.Furniture) { continue; }
      let items = this.items[type as string];
      if (!this.requesting) { items = items.filter(item => !this.hidden[item.guid]); }
      if (this.available) { items = items.filter(item => this.available![item.guid]); }
      if (this.hideIap) { items = items.filter(item => !item.iaps?.length); }

      const item = items[Math.floor(Math.random() * items.length)];
      if (!item) { continue; }
      this.selected.r[item.guid] = item;
      this.selected.all[item.guid] = item;
    }

    this.updateUrlFromSelection();
    this.updateSelectionWarnings();
    this._changeDetectorRef.markForCheck();
  }

  calculateCost(): void {
    const items = Object.values(this.selected.all);
    if (!items.length) {
      alert('There are no items selected.');
      return;
    }

    let ids = this.serializeItems(items);
    ids = ids.substring(0, 1800);

    const url = new URL(`${location.origin}/item/unlock-calculator`);
    url.searchParams.set('items', ids)
    window.open(url.href, '_blank');
  }

  /** Toggles item size between small and normal. */
  toggleItemSize(): void {
    this._toggleItemSize();
    localStorage.setItem('closet.item-size', this.itemSize);
  }

  _toggleItemSize(): void {
    this.itemSize = this.itemSize === 'small' ? 'default' : 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;
  }

  /** Toggles visibility of items that aren't selected. */
  toggleHideUnselected(): void {
    this.hideUnselected = !this.hideUnselected;
    this.typeFolded = {};
    localStorage.setItem('closet.hide-unselected', this.hideUnselected ? '1' : '0');
  }

  /** Toggles visibility of IAP items. */
  toggleIap(): void {
    this.hideIap = !this.hideIap;
    localStorage.setItem('closet.hide-iap', this.hideIap ? '1' : '0');
  }

  /** Toggles between showing own closet or all items. */
  toggleCloset(): void {
    this.closetMode = this.closetMode === 'all' ? 'closet' : 'all';
    if (this.closetMode !== 'closet') {
      this.modifyingCloset = false;
    }
    localStorage.setItem('closet.show-mode', this.closetMode);
  }

  /** Toggles modifying closet mode. */
  modifyCloset(): void {
    this.modifyingCloset = !this.modifyingCloset;
    this.modifyingCloset && (this.closetMode = 'closet');
    this._changeDetectorRef.markForCheck();
  }

  toggleOngoing(): void {
    this.showOngoing = !this.showOngoing;
    localStorage.setItem('closet.show-ongoing', this.showOngoing ? '1' : '0');
  }

  toggleClosetSection(type: ItemType): void {
    const hide = !this.typeFolded[type];
    hide ? (this.typeFolded[type] = true) : (delete this.typeFolded[type]);
  }

  scrollToType(type: ItemType): void {
    const el = document.querySelector(`.closet-items[data-type="${type}"]`);
    if (!el) { return; }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToWarning(): void {
    this._warnHidden?.nativeElement.scrollIntoView();
  }

  setColumns(n: number): void {
    this.columns = n;
    localStorage.setItem('closet.columns', `${n}`);
  }

  // #region Background

  private initializeBackground(): void {
    this._bgImg = new Image();
    this._bgImg.crossOrigin = 'anonymous';

    // Load background config.
    this.backgroundSections = Object.values(this._dataService.outfitRequestConfig.backgrounds);
    let defaultBg: string | undefined = undefined;
    for (const section of this.backgroundSections) {
      this.backgroundSectionMap[section.guid] = section;
      if (!defaultBg && section.default) { defaultBg = section.guid; }
      for (const bg of section.backgrounds) {
        this.backgroundMap[bg.guid] = bg;
        if (!defaultBg && bg.default) { defaultBg = bg.guid; }
      }
    }

    // Load initial background
    let bgGuid = localStorage.getItem('closet.background') || '';
    if (!this.backgroundMap[bgGuid] && !this.backgroundSectionMap[bgGuid]) {
      bgGuid = defaultBg || Object.values(this.backgroundMap).at(0)!.guid;
    }

    this.setBackground(bgGuid);
  }

  showBackgroundPicker(evt: MouseEvent): void {
    this.showingBackgroundPicker = !this.showingBackgroundPicker;
    evt.preventDefault();
    evt.stopPropagation();
    this._changeDetectorRef.markForCheck();
  }

  setBackground(guid: string): void {
    let background = this.backgroundMap[guid];

    // Random background from section.
    const section = this.backgroundSectionMap[guid];
    if (section) {
      background = section.backgrounds[Math.floor(Math.random() * section.backgrounds.length)];
    }

    localStorage.setItem('closet.background', guid || '');
    this._bgImg.src = background.url;
    this.bgAttribution = background.section?.attribution || '';
    this.bgFilter = background.filter;

    this.showingBackgroundPicker = false;
    this._changeDetectorRef.markForCheck();
  }

  // #endregion

  // #region Color

  showColorPicker(evt: MouseEvent): void {
    this.showingColorPicker = !this.showingColorPicker;
    evt.preventDefault();
    evt.stopPropagation();
    this._changeDetectorRef.markForCheck();
  }

  clickoutColorPicker(evt: MouseEvent): void {
    if (!this.showingColorPicker) { return; }
    const target = evt.target as HTMLElement;
    if (this._divColorPicker?.nativeElement.contains(target)) { return; }
    this.showingColorPicker = false;
    this._changeDetectorRef.markForCheck();
  }

  /** Changes the color for selecting items. */
  setColor(color: RequestColor | undefined): void {
    this.showingColorPicker = false;
    this.modifyingCloset = false;
    this.color = color;
  }

  // #endregion

  // #region Sync

  toggleSync(): void {
    const shouldSync = !this.shouldSync;
    if (shouldSync) {
      if (Object.keys(this.hidden).length && !confirm('Syncing from your tracked items will overwrite any changes made on this page. Are you sure?')) { return; }
      this.syncUnlocked();
    }

    this.shouldSync = shouldSync;
    localStorage.setItem('closet.sync', shouldSync ? '1' : '0');
  }

  syncUnlocked(): void {
    // Get hidden from tracked items.
    const hidden: { [guid: string]: boolean } = {};
    for (const type of Object.keys(this.items)) {
      for (const item of this.items[type as string]) {
        if (!item.unlocked) { hidden[item.guid] = true; }
      }
    }

    this.hidden = hidden;
    this.lastLink = undefined;
    this.updateSelectionWarnings();
    localStorage.setItem('closet.hidden', JSON.stringify(Object.keys(this.hidden)));
  }

  resetSync(): void {
    if (!confirm('This will show all items in your closet. Are you sure?')) { return; }
    this.hidden = {};
    this.shouldSync = false;
    localStorage.setItem('closet.sync', '0');
    this.lastLink = undefined;
    localStorage.setItem('closet.hidden', JSON.stringify([]));
  }

  // #endregion

  search(): void {
    this.searchText = this.input.nativeElement.value;
    if (this.searchText === this._lastSearchText) { return; }
    this._lastSearchText = this.searchText;

    if (!this.searchText || this.searchText.length < 3) {
      this.searchResults = undefined;
      this._changeDetectorRef.markForCheck();
      return;
    }

    const items = this._searchService.searchItems(this.searchText, { limit: 50, hasIcon: true });
    this.searchResults = items.reduce((map, item) => (map[item.data.guid] = item.data, map), {} as { [guid: string]: IItem });
    this._changeDetectorRef.markForCheck();
  }

  selectSearch(): void {
    this.input.nativeElement.select();
  }

  /** Apply current selection to URL to keep data when refreshing. */
  private updateUrlFromSelection(): void {
    const r = this.serializeItems(Object.values(this.selected.r));
    const y = this.serializeItems(Object.values(this.selected.y));
    const g = this.serializeItems(Object.values(this.selected.g));
    const b = this.serializeItems(Object.values(this.selected.b));

    const url = new URL(location.href);
    url.searchParams.delete('k');
    url.searchParams.set('r', r);
    url.searchParams.set('y', y);
    url.searchParams.set('g', g);
    url.searchParams.set('b', b);

    // Serialize dyes if the URL doesn't get too long.
    const d = this.serializeDyes();
    if (d.length <= 400) { url.searchParams.set('d', d); }

    // Update URL.
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  /** Updates warning indicators */
  private updateSelectionWarnings(): void {
    this.selectionHasHidden = Object.keys(this.hidden).some(guid => this.selected.all[guid]);
    this.selectionHasUnavailable = this.available ? Object.keys(this.selected.all).some(guid => !this.available![guid]) : false;
    this._changeDetectorRef.markForCheck();
  }
  // #region TS

  private initializeTs(): void {
    if (!this.requesting) { return; }

    const ts = this._dataService.travelingSpiritConfig.items.at(-1);
    if (!ts) { return; }
    const state = DateHelper.getStateFromPeriod(ts.date, ts.endDate);
    if (state === 'ended') { return; }
    this.ts = ts;
    this.tsState = state;

    const types = new Set<ItemType>(this.itemTypes);
    const items = NodeHelper.getItems(ts.tree.node).filter(item => types.has(item.type));
    items.sort((a, b) => this.itemTypeOrder[a.type] - this.itemTypeOrder[b.type]);
    this.tsItems = items;
  }

  private initializeRs(): void {
    if (!this.requesting) { return; }

    const rs = this._dataService.returningSpiritsConfig.items.at(-1);
    if (!rs) { return; }
    const state = DateHelper.getStateFromPeriod(rs.date, rs.endDate);
    if (state !== 'active') { return; }
    this.rs = rs;

    const types = new Set<ItemType>(this.itemTypes);
    this.rs.spirits?.forEach(spirit => {
      const items = NodeHelper.getItems(spirit.tree.node).filter(item => types.has(item.type));
      items.sort((a, b) => this.itemTypeOrder[a.type] - this.itemTypeOrder[b.type]);
      this.rsSpirits.push({ returning: spirit, items });
    });
  }

  private initializeEvents(): void {
    if (!this.requesting) { return; }

    const types = new Set<ItemType>(this.itemTypes);
    const instances = this._dataService.eventConfig.items.map(e => e.instances?.at(-1)).filter(i => i && DateHelper.isActive(i.date, i.endDate));
    instances.forEach(instance => {
      if (!instance) { return; }
      const spirits = instance.spirits || [];

      const items = spirits.map(s => NodeHelper.getItems(s.tree?.node)).flat().filter(i => types.has(i.type));
      const shops = instance.shops || [];
      const listItems = shops.map(s => s.itemList?.items || []).flat();
      const iapItems = shops.map(s => (s.iaps || []).map(a => a.items || [])).flat().flat();
      items.push(...listItems.filter(i => types.has(i.item.type)).map(i => i.item));

      items.sort((a, b) => this.itemTypeOrder[a.type] - this.itemTypeOrder[b.type]);
      iapItems.sort((a, b) => this.itemTypeOrder[a.type] - this.itemTypeOrder[b.type]);
      this.events.push({ instance: instance, items, iapItems });
    });
  }

  // #endregion

  // #region Initialize items

  private initializeItems(): void {
    // Unequippable items.
    const itemTypeUnequip: { [key: string]: number } = [
      ItemType.Necklace, ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Held, ItemType.Shoes, ItemType.FaceAccessory
    ].reduce((map, type, i) => (map[`${type}`] = 46655 - i, map), {} as { [key: string]: number });

    // Populate items by type
    this.items = {};
    for (const type of this.itemTypes) {
      this.items[type as string] = [];
      const unequipId = itemTypeUnequip[type];
      if (unequipId) {
        const item: IItem = { id: unequipId, guid: type.substring(0, 10).padStart(10, '_'), name: 'None', icon: 'assets/icons/none.webp', type: type, unlocked: true, order: -1 };
        this.items[type as string].push(item);
        this.allItems.push(item);
        this.itemMap[item.guid] = item;
      }
    }

    // Get ongoing items.
    const season = DateHelper.getActive(this._dataService.seasonConfig.items);
    season?.spirits?.forEach(spirit => {
      NodeHelper.getItems(spirit.tree?.node).forEach(item => this.ongoingItems[item.guid] = item);
    });
    season?.shops?.forEach(shop => {
      shop.iaps?.forEach(iap => iap.items?.forEach(item => this.ongoingItems[item.guid] = item));
      shop.itemList?.items?.forEach(node => this.ongoingItems[node.item.guid] = node.item);
    });
    this._dataService.eventConfig.items.forEach(event => {
      const instance = DateHelper.getActive(event.instances);
      instance?.spirits?.forEach(spirit => {
        NodeHelper.getItems(spirit.tree?.node).forEach(item => this.ongoingItems[item.guid] = item);
      });
      instance?.shops?.forEach(shop => {
        shop.iaps?.forEach(iap => iap.items?.forEach(item => this.ongoingItems[item.guid] = item));
        shop.itemList?.items?.forEach(node => this.ongoingItems[node.item.guid] = node.item);
      });
    });
    NodeHelper.getItems(DateHelper.getActive(this._dataService.travelingSpiritConfig.items)?.tree?.node).forEach(item => this.ongoingItems[item.guid] = item);
    DateHelper.getActive(this._dataService.returningSpiritsConfig.items)?.spirits?.forEach(spirit => {
      NodeHelper.getItems(spirit.tree?.node).forEach(item => this.ongoingItems[item.guid] = item);
    });

    // Add items to closets.
    for (const item of this._dataService.itemConfig.items) {
      if (item.closetHide) { continue; }
      let type = item.type;
      if (!this.items[type as string]) { continue; }

      this.items[type as string].push(item);
      this.allItems.push(item);
      this.itemMap[item.guid] = item;
    }

    // Sort items by order.
    for (const type of this.itemTypes) {
      ItemHelper.sortItems(this.items[type as string]);
    }

    if (this.shouldSync) {
      this.syncUnlocked();
    }

    const queryParams = this._route.snapshot.queryParamMap;
    if (queryParams.has('k')) {
      this.initializeFromKV(queryParams.get('k')!);
    } else {
      this.initializeFromObj({
        a: queryParams.get('a') || '',
        r: queryParams.get('r') || '',
        y: queryParams.get('y') || '',
        g: queryParams.get('g') || '',
        b: queryParams.get('b') || '',
        d: queryParams.get('d') || ''
      });
    }
  }

  /** Loads selection data from KV API. */
  private initializeFromKV(key: string): void {
    if (!key) { return; }
    const sKey = encodeURIComponent(key);
    this._http.get(`/api/outfit-request?key=${sKey}`, { responseType: 'json' }).subscribe({
      next: (data: any) => {
        if (!data) {
          alert('This link is invalid or has expired.');
          return;
        }
        const request = data as IOutfitRequest;
        this.initializeFromObj(request);
      },
      error: () => {
        alert('Failed to get outfit request data');
      }
    });
  }

  /** Loads selection data from model. */
  private initializeFromObj(data: IOutfitRequest): void {
    this.available = undefined;
    const a = this.deserializeItems(data.a);
    if (a?.length) {
      this.available = a.reduce((map, item) => (map[item.guid] = item, map), {} as ISelection);
    }

    this.selected = { all: {}, r: {}, y: {}, g: {}, b: {}};
    const r = this.deserializeItems(data.r);
    for (const item of r) { this.selected.r[item.guid] = item; this.selected.all[item.guid] = item; }
    const y = this.deserializeItems(data.y);
    for (const item of y) { this.selected.y[item.guid] = item; this.selected.all[item.guid] = item; }
    const g = this.deserializeItems(data.g);
    for (const item of g) { this.selected.g[item.guid] = item; this.selected.all[item.guid] = item; }
    const b = this.deserializeItems(data.b);
    for (const item of b) { this.selected.b[item.guid] = item; this.selected.all[item.guid] = item; }

    this.dyes = {};
    this.dyeClasses = {};
    const dyes = this.deserializeDyes(data.d);
    if (dyes.length) {
      Object.keys(this.selected.all).forEach((guid, i) => {
        this.dyes[guid] = dyes[i] || {};
        if (!this.dyeClasses[guid]) { this.dyeClasses[guid] = []; }
        if (dyes[i][0]?.primary) { this.dyeClasses[guid]![0] = `dye-${dyes[i][0].primary}`; }
        if (dyes[i][1]?.primary) { this.dyeClasses[guid]![1] = `dye-${dyes[i][1].primary}`; }
      });
    }

    this.updateSelectionWarnings();
  }

  // #endregion

  // #region Serialization

  private serializeModel(): IOutfitRequest {
    return {
      r: this.serializeItems(Object.values(this.selected.r)),
      y: this.serializeItems(Object.values(this.selected.y)),
      g: this.serializeItems(Object.values(this.selected.g)),
      b: this.serializeItems(Object.values(this.selected.b)),
      d: this.serializeDyes()
    };
  }

  private serializeItems(items: Array<IItem>): string {
    const ids = items.map(item => (item.id || 0).toString(36).padStart(3, '0'));
    return ids.join('');
  }

  private deserializeItems(serialized: string | undefined): Array<IItem> {
    if (!serialized?.length) { return []; }

    const ids = serialized?.match(/.{3}/g) || [];
    const items = this.allItems;
    const itemIdMap = items.reduce((map, item) => {
      item.id && (map[item.id] = item);
      return map;
    }, {} as { [key: number]: IItem });

    const selected: Array<IItem> = [];
    for (const id of ids) {
      const item = itemIdMap[parseInt(id, 36)];
      item && selected.push(item);
    }

    return selected;
  }


  private serializeDyes(): string {
    // Get dyes in order or r/y/g/b, skipping duplicates.
    const guids = new Set<string>();
    const dyes: Array<Array<IDye>> = [
      ...Object.values(this.selected.r).filter(item => !guids.has(item.guid) && guids.add(item.guid)).map(item => this.dyes[item.guid] || []),
      ...Object.values(this.selected.y).filter(item => !guids.has(item.guid) && guids.add(item.guid)).map(item => this.dyes[item.guid] || []),
      ...Object.values(this.selected.g).filter(item => !guids.has(item.guid) && guids.add(item.guid)).map(item => this.dyes[item.guid] || []),
      ...Object.values(this.selected.b).filter(item => !guids.has(item.guid) && guids.add(item.guid)).map(item => this.dyes[item.guid] || [])
    ];

    // No dyes, skip serializing a bunch of zeroes.
    if (!dyes.some(d => d.length && d.some(c => c.primary || c.secondary))) { return ''; }

    // Map dyes to 4 characters (2 dyes per slot).
    return dyes.map(dye => {
      const a = this.getDyeIndex(dye[0]?.primary);
      const b = this.getDyeIndex(dye[0]?.secondary);
      const c = this.getDyeIndex(dye[1]?.primary);
      const d = this.getDyeIndex(dye[1]?.secondary);
      return a.toString(36) + b.toString(36) + c.toString(36) + d.toString(36);
    }).join('');
  }

  private deserializeDyes(serialized: string | undefined): Array<Array<IDye>> {
    if (!serialized?.length) { return []; }
    const dyes = serialized?.match(/.{4}/g) || [];
    const deserializedDyes: Array<Array<IDye>> = [];
    // Read every pair of dyes.
    for (const dye of dyes) {
      const a = parseInt(dye[0], 36);
      const b = parseInt(dye[1], 36);
      const c = parseInt(dye[2], 36);
      const d = parseInt(dye[3], 36);
      deserializedDyes.push([
        { primary: this.getDye(a), secondary: this.getDye(b) },
        { primary: this.getDye(c), secondary: this.getDye(d) }
      ]);
    }
    return deserializedDyes;
  }


  private getDyeIndex(color: DyeColor | undefined): number {
    switch (color) {
      case 'red': return 1;
      case 'purple': return 2;
      case 'blue': return 3;
      case 'cyan': return 4;
      case 'green': return 5;
      case 'yellow': return 6;
      case 'black': return 7;
      case 'white': return 8;
      default: return 0;
    }
  };

  private getDye(index: number): DyeColor | undefined {
    switch (index) {
      case 1: return 'red';
      case 2: return 'purple';
      case 3: return 'blue';
      case 4: return 'cyan';
      case 5: return 'green';
      case 6: return 'yellow';
      case 7: return 'black';
      case 8: return 'white';
      default: return undefined;
    }
  }

  // #endregion

  // #region Output

  copyLink(): void {
    if (this.lastLink) {
      navigator.clipboard.writeText(this.lastLink).then(() => {
        this._ttCopyLnk?.open();
        setTimeout(() => this._ttCopyLnk?.close(), 1000);
      }).catch(error  => {
        console.error(error);
        alert('Copying link failed. Please make sure the document is focused.');
      });
      return;
    }

    this.isRendering = 1;
    this._changeDetectorRef.markForCheck();

    const request = this.serializeModel();

    // Add available items from closet.
    if (!this.requesting) {
      const items = this.allItems.filter(item => !this.hidden[item.guid]);
      request.a = this.serializeItems(items);
    }

    const link = new URL(location.href);
    link.pathname = this.requesting ? '/outfit-request/closet' : '/outfit-request/request';
    link.search = '';

    const apiUrl = '/api/outfit-request';
    const fetchPromise = async () => {
      let key;
      try {
        const keyResult = await lastValueFrom(this._http.post<{key: string}>(apiUrl, request, { responseType: 'json' }));
        key = keyResult.key;
      } catch (e) { console.error(e); }

      // Create link
      if (key) {
        link.searchParams.set('k', key);
      } else {
        link.searchParams.set('r', request.r);
        link.searchParams.set('y', request.y);
        link.searchParams.set('g', request.g);
        link.searchParams.set('b', request.b);
        link.searchParams.set('d', request.d || '');
      }

      this.lastLink = link.href;
      return new Blob([link.href], { type: 'text/plain' });
    };

    const doneCopying = () => { this.isRendering = 0; this._changeDetectorRef.detectChanges(); };
    try {
      const item = new ClipboardItem({ ['text/plain']: fetchPromise() });
      navigator.clipboard.write([item]).then(() => {
        doneCopying();
        this._ttCopyLnk?.open();
        setTimeout(() => this._ttCopyLnk?.close(), 1000);
      }).catch(error => {
        console.error(error);
        alert('Copying failed. Please make sure the document is focused.');
        doneCopying();
      });
    } catch (e) { console.error(e); doneCopying(); }
  }

  showCopyImagePicker(evt?: MouseEvent): void {
    // When in closet, show copy options.
    this.showingImagePicker = true;
    evt?.preventDefault();
    evt?.stopPropagation();
    this._changeDetectorRef.markForCheck();
  }

  hideCopyImagePicker(): void {
    this.showingImagePicker = false;
    this._changeDetectorRef.markForCheck();
  }

  clickoutCopyImagePicker(evt: MouseEvent): void {
    if (!this.showingImagePicker) { return; }
    const target = evt.target as HTMLElement;
    if (this._divCopyImagePicker?.nativeElement.contains(target)) { return; }
    if (document.querySelector('.introjs-tooltip')) { return; }
    this.hideCopyImagePicker();
  }

  copyImage(mode: CopyImageMode): void {
    this.showingImagePicker = false;
    this.isRendering = 2;
    this._changeDetectorRef.markForCheck();

    setTimeout(() => {
      const canvas = mode === 'square' ? this.renderSquare() : this.renderImage(mode);
      this.saveCanvasToClipboard(canvas);
    });
  }

  shareImage(mode: CopyImageMode): void {
    if (!navigator.share) { alert('Sharing is not supported by this browser.'); return; }

    this.showingImagePicker = false;
    this.isRendering = 2;
    this._changeDetectorRef.markForCheck();

    setTimeout(() => {
      const canvas = mode === 'square' ? this.renderSquare() : this.renderImage(mode);
      this.shareCanvas(canvas);
    });
  }

  private renderSquare(): HTMLCanvasElement {
    const getSelectedPerType = (selection: ISelection) => Object.values(selection).reduce((map, item) => {
      let type = item.type;
      if (type === ItemType.Furniture || type === ItemType.Held) { type = ItemType.Prop; }
      if (!map[type]) { map[type] = item; }
      return map;
    }, {} as { [key: string]: IItem });

    const selectedByType = [
      getSelectedPerType(this.selected.r),
      getSelectedPerType(this.selected.y),
      getSelectedPerType(this.selected.g),
      getSelectedPerType(this.selected.b)
    ];
    selectedByType.sort((a, b) => Object.keys(b).length - Object.keys(a).length);

    const getItemByType = (type: ItemType) => selectedByType.find(map => map[type])?.[type];
    const itemTypes = [
      ItemType.Outfit, ItemType.Shoes, ItemType.Mask,
      ItemType.FaceAccessory, ItemType.Necklace, ItemType.Hair, ItemType.HairAccessory,
      ItemType.HeadAccessory, ItemType.Cape, ItemType.Prop
    ];
    const items = itemTypes.map(getItemByType);

    const canvas = document.createElement('canvas');
    canvas.width = _wItem * 5 + _wGap * 6;
    canvas.height = _wItem * 2 + _wGap * 3 + _wDye * 4 + 24;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    this.cvsDrawBackground(ctx);

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';

    let l1 = '© Sky Children of the Light';
    if (this.bgAttribution) { l1 = `${this.bgAttribution} | ${l1}`; }
    ctx.fillText(l1, canvas.width - 8, 0 + 15);

    let l2 = 'Icons provided by the Sky: CotL Wiki';
    ctx.fillText(l2, canvas.width - 8, canvas.height - 6);

    const placeholders = [
      'EEQZwFIJRs', '_k3jPMWKOY', 'Em7ZxGZAN5',
      'fR9CRzzD25', '_5IHtakDvf', 'QmNo-bmeLi', 'E_yfCZYU5C',
      'f-X2dDeB9w', 'ec8jU3Gerw', 'biKOov4qJQ'
    ];
    const placeholderItems = placeholders.map(guid => this.itemMap[guid]);
    // Store item images for drawing.
    const itemDivs = document.querySelectorAll('.closet-item');
    const itemImgs = Array.from(itemDivs).reduce((obj, div) => {
      const img = div.querySelector('.item-icon img') as HTMLImageElement;
      if (!img) { return obj; }
      const guid = div.getAttribute('data-guid')!;
      obj[guid] = img;
      return obj;
    }, {} as { [guid: string]: HTMLImageElement });

    items.forEach((item, i) => {
      const x = _wGap + (i % 5) * (_wItem + _wGap);
      const row = Math.floor(i / 5);
      const y = _wGap + row * (_wItem + _wGap + (_wDye * 2)) + 12;

      // Draw item box
      ctx.fillStyle = '#0006';
      ctx.beginPath(); ctx.roundRect(x, y, _wItem, _wItem + _wDye * 2, 4); ctx.fill();

      const drawPlaceholder = () => {
        const mappedIcon = placeholderItems[i].icon ? this._iconService.getIcon(placeholderItems[i].icon!) : undefined;
        const placeholderImg = itemImgs[placeholders[i]];
        if (!placeholderImg && !mappedIcon) { throw new Error('Item image for placeholder was not loaded!'); }
        ctx.globalAlpha = 0.25;
        if (mappedIcon) {
          const sheet = this._imgSheets[mappedIcon.file];
          ctx.drawImage(sheet, mappedIcon.x, mappedIcon.y, 128, 128, x, y, _wItem, _wItem);
        } else {
          ctx.drawImage(placeholderImg, x, y, _wItem, _wItem);
        }
        ctx.globalAlpha = 1;
      };

      if (item && item.icon) {
        if (itemImgs[item.guid]?.src === this._imgNone.src) { drawPlaceholder(); }
        const mappedIcon = this._iconService.getIcon(item.icon);
        const img = itemImgs[item.guid];

        if (mappedIcon) {
          const sheet = this._imgSheets[mappedIcon.file];
          ctx.drawImage(sheet, mappedIcon.x, mappedIcon.y, 128, 128, x, y, _wItem, _wItem);
        } else {
          ctx.drawImage(img, x, y, _wItem, _wItem);
        }


        // Draw dyes
        if (item.dyeSlots! > 0) {
          const drawDye = (dye: DyeColor | undefined, dx: number, dy: number) => {
            ctx.save();
            const color = dye || 'none';
            const path = new Path2D(this._svgDyes[color].querySelector('path')!.getAttribute('d')!);

            ctx.translate(dx, dy);
            ctx.scale(32 / 300, 32 / 300); // SVG icon has 300x300 viewBox
            if (color === 'black') {
              ctx.fillStyle = '#232323';
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 3;
              ctx.setLineDash([]);
              ctx.fill(path);
              ctx.stroke(path);
            } else {
              ctx.fillStyle = getComputedStyle(document.body).getPropertyValue(`--dye-${color}`).trim();
              ctx.fill(path);
            }
            ctx.restore();
          };

          const drawLine = (dy: number) => {
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.moveTo(x + 8, dy + _wItem + 0.5);
            ctx.lineTo(x + _wItem - 8, dy + _wItem + 0.5);
            ctx.stroke();
            ctx.restore();
          };

          const dyes = this.dyes[item.guid];
          drawDye(dyes[0]?.primary, x + 4, y + _wItem);
          drawDye(dyes[0]?.secondary, x + (_wDye - 4) * 1, y + _wItem);
          if (item.dyeSlots! > 1) {
            drawLine(y + _wDye);
            drawDye(dyes[1]?.primary, x + 4, y + _wItem + _wDye);
            drawDye(dyes[1]?.secondary, x + (_wDye - 4) * 1, y + _wItem + _wDye);
          }
        }
      } else {
        drawPlaceholder();
        ctx.drawImage(this._imgUnknown, x, y, _wItem, _wItem);
      }
    });

    drawFingerprint(ctx, [2, canvas.height - 2], items.map(i => i?.id || 0));
    return canvas;
  }

  private renderImage(mode: CopyImageMode): HTMLCanvasElement {
    /* Draw image in sections based roughly on the number of items per closet. */
    /* Because this is a shared image instead of URL we care more about spacing than closet columns. */
    const cols = [10, 7, 5, 7];
    const canvas = document.createElement('canvas');

    const cOutfit = Math.ceil(this.items[ItemType.Outfit].length / cols[0]);
    const cShoes = Math.ceil(this.items[ItemType.Shoes].length / cols[0]);
    const cMask = Math.ceil(this.items[ItemType.Mask].length / cols[0]);
    const cFaceAcc = Math.ceil(this.items[ItemType.FaceAccessory].length / cols[0]);
    const cNecklace = Math.ceil(this.items[ItemType.Necklace].length / cols[0]);
    const cHair = Math.ceil(this.items[ItemType.Hair].length / cols[1]);
    const cHairAcc = Math.ceil(this.items[ItemType.HairAccessory].length / cols[1]);
    const cHeadAcc = Math.ceil(this.items[ItemType.HeadAccessory].length / cols[1]);
    const cCape = Math.ceil(this.items[ItemType.Cape].length / cols[2]);
    const cHeld = Math.ceil(this.items[ItemType.Held].length / cols[3]);
    const cFurniture = Math.ceil(this.items[ItemType.Furniture].length / cols[3]);
    const cProp = Math.ceil(this.items[ItemType.Prop].length / cols[3]);
    const h1 = (cOutfit + cShoes + cMask + cFaceAcc + cNecklace) * _wBox + _wPad * 6 -_wGap;
    const h2 = (cHair + cHairAcc + cHeadAcc) * _wBox + _wPad * 4 - _wGap;
    const h3 = cCape * _wBox + _wPad * 2 - _wGap;
    const h4 = (cHeld + cFurniture + cProp) * _wBox + _wPad * 4 - _wGap;
    const h = Math.max(h1, h2, h3, h4);

    canvas.width = 5 * _wPad + _wBox * cols.reduce((sum, c) => sum + c, 0) - _wGap;
    canvas.height = h === h4 ? h + 48 : h === h1 ? h : h + 24;
    const ctx = canvas.getContext('2d')!;
    this.cvsDrawBackground(ctx);

    // Store item images for drawing.
    const itemDivs = document.querySelectorAll('.closet-item');
    const itemImgs = Array.from(itemDivs).reduce((obj, div) => {
      const img = div.querySelector('.item-icon img') as HTMLImageElement;
      if (!img) { return obj; }
      const guid = div.getAttribute('data-guid')!;
      obj[guid] = img;
      return obj;
    }, {} as { [guid: string]: HTMLImageElement });

    // Draw item sections
    let sx = _wPad, sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.Outfit], itemImgs);
    sx = _wPad;  sy = _wPad * 2 + cOutfit * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.Shoes], itemImgs);
    sx = _wPad;  sy = _wPad * 3 + (cOutfit + cShoes) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.Mask], itemImgs);
    sx = _wPad;  sy = _wPad * 4 + (cOutfit + cShoes + cMask) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.FaceAccessory], itemImgs);
    sx = _wPad;  sy = _wPad * 5 + (cOutfit + cShoes + cMask + cFaceAcc) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.Necklace], itemImgs);

    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[1], mode, this.items[ItemType.Hair], itemImgs);
    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad * 2 + cHair * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[1], mode, this.items[ItemType.HairAccessory], itemImgs);
    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad * 3 + (cHair + cHairAcc) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[1], mode, this.items[ItemType.HeadAccessory], itemImgs);

    sx = _wPad * 3 + (cols[0] + cols[1]) * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[2], mode, this.items[ItemType.Cape], itemImgs);

    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[3], mode, this.items[ItemType.Held], itemImgs);
    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad * 2 + cHeld * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[3], mode, this.items[ItemType.Furniture], itemImgs);
    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad * 3 + (cHeld + cFurniture) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[3], mode, this.items[ItemType.Prop], itemImgs);

    // Draw attribution
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';

    let l1 = 'Icons by contributors of the Sky: Children of the Light Wiki';
    if (this.bgAttribution) { l1 = `${this.bgAttribution} | ${l1}`; }
    ctx.fillText(l1, canvas.width - 8, canvas.height - 8);

    let l2 = '© Sky: Children of the Light';
    ctx.fillText(l2, canvas.width - 8, canvas.height - 8 - 24);

    return canvas;
  }

  private shareCanvas(canvas: HTMLCanvasElement): void {
    const doneSharing = (msg?: string) => { msg && alert(msg); this.isRendering = 0; this._changeDetectorRef.detectChanges(); };
    canvas.toBlob(blob => {
      if (!blob) { return doneSharing('Sharing failed.'); }

      const data: ShareData = {
        files: [ new File([blob], 'sky-outfit-request.png', { type: 'image/png' }) ],
        title: 'Sky: CotL Outfit Request',
      };

      if (!navigator.canShare(data)) { return doneSharing('Sharing is not supported on this device.'); }
      try { navigator.share(data); } catch { return doneSharing('Sharing failed.'); }
      doneSharing();
    });
  }

  private saveCanvasToClipboard(canvas: HTMLCanvasElement): void {
    // Save canvas to PNG and write to clipboard
    const doneCopying = () => { this.isRendering = 0; this._changeDetectorRef.detectChanges(); };
    const renderPromise = new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        blob ? resolve(blob) : reject('Failed to render image.');
      });
    });

    try {
      const item = new ClipboardItem({ 'image/png': renderPromise });
      navigator.clipboard.write([item]).then(() => {
        doneCopying();
        this._ttCopyImg?.open();
        setTimeout(() => this._ttCopyImg?.close(), 1000);
      }).catch(error => {
        console.error(error);
        alert('Copying failed. Please make sure the document is focused.');
        doneCopying();
      });
    } catch(e) { console.error(e); doneCopying(); }
  }

  private cvsDrawBackground(ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    ctx.filter = this.bgFilter ?? 'blur(4px) brightness(0.6)';

    const imgAspectRatio = this._bgImg.naturalWidth / this._bgImg.naturalHeight;
    const canvasAspectRatio = canvas.width / canvas.height;

    let drawWidth, drawHeight;

    if (imgAspectRatio > canvasAspectRatio) {
      drawHeight = canvas.height;
      drawWidth = this._bgImg.naturalWidth * (drawHeight / this._bgImg.naturalHeight);
    } else {
      drawWidth = canvas.width;
      drawHeight = this._bgImg.naturalHeight * (drawWidth / this._bgImg.naturalWidth);
    }

    const xn = canvas.width / 2 - drawWidth / 2;
    const yn = canvas.height / 2 - drawHeight / 2;

    ctx.drawImage(this._bgImg, 0, 0, this._bgImg.naturalWidth, this._bgImg.naturalHeight, xn - 10, yn - 10, drawWidth + 20, drawHeight + 20);
    ctx.filter = 'none';
  }

  private cvsDrawSection(ctx: CanvasRenderingContext2D, sx: number, sy: number, c: number, mode: CopyImageMode, items: Array<IItem>, itemImgs: { [guid: string]: HTMLImageElement }): void {
    let x = 0; let y = 0;
    const nextX = () => { if (++x >= c) { x = 0; y++; }};
    const h = Math.ceil(items.length / c);

    // Draw rectangle around section
    ctx.fillStyle = '#0008';
    ctx.beginPath(); ctx.roundRect(sx - _wGap, sy - _wGap, _wBox * c + _wGap, _wBox * h + _wGap, 8); ctx.fill();
    ctx.strokeStyle = '#0006'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(sx - _wGap, sy - _wGap, _wBox * c + _wGap, _wBox * h + _wGap, 8); ctx.stroke();

    for (const item of items) {
      if (!item.icon) { nextX(); continue; }
      const mappedIcon = this._iconService.getIcon(item.icon);
      const img = itemImgs[item.guid];
      if (!mappedIcon && !img) { nextX(); continue; }

      // Draw item box
      ctx.fillStyle = '#0006';
      ctx.beginPath(); ctx.roundRect(sx + x * _wBox, sy + y * _wBox, _wItem, _wItem, 8); ctx.fill();

      // For template show everything.
      if (mode !== 'template') {
        // Hide IAPs.
        if (this.hideIap && item.iaps?.length && !this.selected.all[item.guid]) { ctx.globalAlpha = _aHide; }
        // While requesting hide all unselected items.
        if (mode === 'request' && !this.selected.all[item.guid]) { ctx.globalAlpha = _aHide; }
        // For closet hide items not owned.
        if (mode === 'closet' && this.hidden[item.guid]) {
          // Make selected and ongoing items more opaque.
          ctx.globalAlpha = this.selected.all[item.guid] || (this.showOngoing && this.ongoingItems[item.guid]) ? _aHalfHide : _aHide;
        }
      }

      if (mappedIcon) {
        const sheet = this._imgSheets[mappedIcon.file];
        ctx.drawImage(sheet, mappedIcon.x, mappedIcon.y, 128, 128, sx + x * _wBox, sy + y * _wBox, _wItem, _wItem);
      } else {
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, sx + x * _wBox, sy + y * (_wBox), _wItem, _wItem);
      }
      ctx.globalAlpha = 1;

      // Draw selection
      if (this.selected.all[item.guid]) {
        ctx.lineWidth = 4;
        const selections = [];
        if (this.selected.r[item.guid]) { selections.push({ c: '#f00' }); }
        if (this.selected.y[item.guid]) { selections.push({ c: '#ff0' }); }
        if (this.selected.g[item.guid]) { selections.push({ c: '#0f0' }); }
        if (this.selected.b[item.guid]) { selections.push({ c: '#0aa0ff' }); }
        if (selections.length > 1) {
          // Create multi-color border from selections.
          const offsetAngle = selections.length === 2 ? -Math.PI : selections.length === 3 ? 7 * Math.PI / 6 : Math.PI;
          const grad = ctx.createConicGradient(offsetAngle, sx + x * _wBox + _wItem / 2, sy + y * _wBox + _wItem / 2);
          for (let i = 0; i < selections.length; i++) {
            console.log(i, selections.length);
            grad.addColorStop(i / selections.length, selections[i].c);
            grad.addColorStop((i+1) / selections.length, selections[i].c);
          }
          ctx.strokeStyle =  grad;
        } else {
          // Draw solid border.
          ctx.strokeStyle = selections[0].c;
        }

        ctx.beginPath(); ctx.roundRect(sx + x * _wBox, sy + y * _wBox, _wItem, _wItem, 8); ctx.stroke();
      }

      nextX();
    }
  }

  // #endregion

  // #region Tour

  startTour(): void {
    const self = this;

    // Set small icons for tour.
    if (this.itemSize === 'default') { this._toggleItemSize(); }

    // Steps must be ordered, these numbers are only used to find the element in the HTML (data-step).
    const s = {
      REQUEST: 0,
      ITEM: 1, ITEM_SECTION: 2, ITEM_COLOR: 3,
      COPY: 4, COPY_LINK: 5, COPY_IMAGE: 6, COPY_IMAGE_CLOSET: 7, COPY_IMAGE_REQUEST: 8, COPY_IMAGE_SQUARE: 9, COPY_IMAGE_TEMPLATE: 10,
      OPTIONS: 100, CLOSET_ITEMS: 101, CLOSET_MODIFY: 102, CLOSET_COLUMNS: 103, CLOSET_ONGOING: 104, CLOSET_SYNC: 105, CLOSET_DONE: 106,
      OPTION_FILTER: 121, OPTION_SIZE: 122, OPTION_IAP: 123, OPTION_RESET: 124, OPTION_SHUFFLE: 125, OPTION_SEARCH: 126,
      LINK_COLLAGE: 901, LINK_HOME: 904
    };

    const steps: Array<Partial<SkyIntroStep>> = [];

    if (this.requesting) {
      steps.push({ sStep: s.REQUEST, title: 'Closet', intro: 'If you are trying to share your closet instead of creating a request, please visit this page. The page you\'re on right now is meant only for creating requests.'});
    } else {
      steps.push({ sStep: s.REQUEST, title: 'Request', intro: 'If you are trying to create a request instead of sharing your closet, please visit this page. Although you can create requests on this page it\'s meant for viewing or sharing your closet.' });
    }

    steps.push(...[
      { sStep: s.ITEM, title: 'Sky cosmetics', intro: 'Here you can see all cosmetics from Sky. You can create a request simply by clicking the icons to select them.' },
      { sStep: s.ITEM_SECTION, title: 'Closets', intro: 'Each closet is organized as it appears in Sky. Try clicking an icon now!' },
      { sStep: s.ITEM_COLOR, title: 'Selection color', intro: 'If you want to select items with different colors you can click here. Use this when marking alternative items or when you want to see multiple outfits in one request.' },
      { sStep: s.COPY, title: 'Share request', intro: 'When you are done selecting items you can share your request.' },
      { sStep: s.COPY_LINK, title: 'Copy link', intro: 'A shareable link will be copied to your clipboard. You can paste this link in Discord. The link allows other players to easily see if they have the items for your request and lasts 1 week.' },
      { sStep: s.COPY_IMAGE, title: 'Share image', intro: 'There are multiple options available when sharing an image.' },
    ]);

    !this.requesting && steps.push({ sStep: s.COPY_IMAGE_CLOSET, title: 'Share closet', intro: 'Sharing your closet will hide items you do not own. This can be useful when asking for outfit suggestions or when opening your closet for requests.' });
    steps.push({ sStep: s.COPY_IMAGE_REQUEST, title: 'Share full request', intro: 'Sharing a full request will hide items you haven\'t selected on the full template. This can be useful when requesting one or multiple outfits.' });
    steps.push({ sStep: s.COPY_IMAGE_SQUARE, title: 'Share fit request', intro: 'Sharing a fit request will create a smaller square with just the icons of one outfit.' });
    !this.requesting && steps.push({ sStep: s.COPY_IMAGE_TEMPLATE, title: 'Share template', intro: 'Sharing the template will show all items.' });

    steps.push({ sStep:s.OPTIONS, title: 'Options', intro: 'Various options to change what\'s displayed can be found here.' })
    if (!this.requesting) {
      steps.push({ sStep: s.CLOSET_ITEMS, title: 'Show items', intro: 'You can switch between showing all items or only the items you own.' });
      steps.push({ sStep: s.CLOSET_MODIFY, title: 'Modify closet', intro: 'To change the items shown in your closet you can modify your closet here. In the next steps we\'ll go over these options.' });
      steps.push({ sStep: s.CLOSET_COLUMNS, title: 'Closet columns', intro: 'Depending on your device and orientation Sky will show a number of items in your closet per row. You can select that number here to make this page match Sky.' });
      steps.push({ sStep: s.CLOSET_ONGOING, title: 'Ongoing items', intro: 'In Sky it is possible to preview items from the ongoing season and event. By enabling this option these items will still be visible (slightly darkened) when showing only your items.' });
      steps.push({ sStep: s.CLOSET_SYNC, title: 'Sync closet', intro: 'If you look at the rest of this website you\'ll be able to find spirit trees and IAPs. These can be used to keep track of your unlocked items. If you keep track of your progress this way you can sync this closet page to use that progress.' });
      steps.push({ sStep: s.CLOSET_SYNC, title: 'Pick your items', intro: 'You can also choose to toggle items by clicking on them in the grid below while this \'Modify closet\' panel is open.' });
      steps.push({ sStep: s.CLOSET_DONE, title: 'Done', intro: 'When you\'re done modifying your closet you can close the panel here.', disableInteraction: true });
    }

    !this.requesting && steps.push({ sStep: s.OPTION_FILTER, title: 'Filter items', intro: 'By enabling this option only the selected items will be shown. This makes it easier to see the items in a request.' })
    steps.push({ sStep: s.OPTION_SIZE, title: 'Icon size', intro: 'Switch between showing small and large item icons.' })
    !this.requesting && steps.push({ sStep: s.OPTION_IAP, title: 'In-app purchases', intro: 'Show or hide items that cost real money. The icons will appear darker when you hide them.' })
    steps.push({ sStep: s.OPTION_RESET, title: 'Reset', intro: 'Remove all items you\'ve selected.' })
    steps.push({ sStep: s.OPTION_SHUFFLE, title: 'Shuffle', intro: 'Remove all items you\'ve selected and select one random item from each closet.' })
    steps.push({ sStep: s.OPTION_SEARCH, title: 'Search', intro: 'You can search for items here. Matching items will have a purple border. Item names often include the spirit name, for example \'Spinning Mentor Cape\'.' })

    !this.requesting && steps.push({ sStep: s.LINK_COLLAGE, title: 'Collage tool', intro: 'This button will take you to a page where you can create a simple collage using screenshots from the game.' });
    this.requesting && steps.push({ sStep: s.LINK_HOME, title: 'Home', intro: 'This button will take you to the home page of the Sky Planner website.' });

    steps.forEach((step, i) => { step.step = i + 1; }); // Assign step order from array.

    setTimeout(() => {
      const intro = introJs(this._elementRef.nativeElement).setOptions({
        scrollTo: 'tooltip',
        steps, showBullets: false, autoPosition: false
      });

      // Get element / position from current DOM state.
      const retarget = (step: SkyIntroStep) => {
        const el = self._elementRef.nativeElement.querySelector(`[data-step="${step.sStep}"]`) as HTMLElement;
        if (!el) { return; }
        step.element = el;
        step.position = el.dataset['position'] as TooltipPosition || 'bottom-left-aligned';
      };

      let previousStep: SkyIntroStep;
      intro.onafterchange(function() {
        previousStep = this._introItems[this._currentStep] as SkyIntroStep;
      });

      intro.onbeforechange(function() {
        const step = this._introItems[this._currentStep] as SkyIntroStep;
        if (!step) { return true; }

        if (step.sStep === s.ITEM_SECTION && self._divClosetContainer?.nativeElement) {
          self._divClosetContainer.nativeElement.scrollLeft = 0;
        }

        // Show copy image picker during these steps.
        if (step.sStep >= s.COPY_IMAGE_CLOSET && step.sStep <= s.COPY_IMAGE_TEMPLATE) {
          self.showCopyImagePicker();
        } else {
          self.hideCopyImagePicker();
        }

        // Show modifying closet during these steps.
        if (step.sStep > s.CLOSET_MODIFY && step.sStep <= s.CLOSET_DONE) {
          !self.modifyingCloset && self.modifyCloset();
        } else {
          self.modifyingCloset && self.modifyCloset();
        }

        // Allow side effects to happen before step change.
        return new Promise(res => setTimeout(() => {
          retarget(step);
          res(true);
        }, 0));
      });

      intro.start();
    });
  }

  // #endregion
}

interface SkyIntroStep extends Partial<IntroStep> {
  sStep: number;
}
