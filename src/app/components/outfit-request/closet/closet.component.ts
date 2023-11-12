import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { ItemSize } from '../../item/item.component';
import { SearchService } from 'src/app/services/search.service';
import { HttpClient } from '@angular/common/http';
import { SubscriptionLike, lastValueFrom } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { IOutfitRequestBackground, IOutfitRequestBackgrounds } from 'src/app/interfaces/outfit-request.interface';

interface ISelection { [guid: string]: IItem; }
interface IOutfitRequest { a?: string; r: string; y: string; g: string; b: string; };

type RequestColor = 'r' | 'y' | 'g' | 'b';
type ClosetMode = 'all' | 'closet';
type CopyImageMode = 'request' | 'closet' | 'template';

/** Size of padding from edge. */
const _wPad = 24;
/** Size of item icon */
const _wItem = 64;
/** Size of gap between items. */
const _wGap = 8;
/** Size of item with gap. */
const _wBox = _wItem + _wGap;
/** Alpha for missing items. */
const _aHide = 0.1;
const _aHalfHide = 0.4;

@Component({
  selector: 'app-closet',
  templateUrl: './closet.component.html',
  styleUrls: ['./closet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClosetComponent implements OnDestroy {
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;
  @ViewChild('ttCopyLnk', { static: false }) private readonly _ttCopyLnk?: NgbTooltip;
  @ViewChild('ttCopyImg', { static: false }) private readonly _ttCopyImg?: NgbTooltip;
  @ViewChild('warnHidden', { static: false }) private readonly _warnHidden?: ElementRef<HTMLElement>;
  @ViewChild('divColorPicker', { static: false }) private readonly _divColorPicker?: ElementRef<HTMLElement>;
  @ViewChild('divCopyImagePicker', { static: false }) private readonly _divCopyImagePicker?: ElementRef<HTMLElement>;

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
    ItemType.Hair, ItemType.Hat,
    ItemType.Cape,
    ItemType.Held, ItemType.Prop
  ];
  itemIcons: { [key: string]: string } = {
    'Outfit': 'outfit',
    'Shoes': 'shoes',
    'Mask': 'mask',
    'FaceAccessory': 'face-acc',
    'Necklace': 'necklace',
    'Hair': 'hair',
    'Hat': 'hat',
    'Cape': 'cape',
    'Held': 'held',
    'Prop': 'prop'
  };

  // Item data
  allItems: Array<IItem> = [];
  itemMap: { [guid: string]: IItem } = {};
  items: { [type: string]: Array<IItem> } = {};

  showingColorPicker = false;
  showingBackgroundPicker = false;
  showingImagePicker = false;

  // Item selection
  color?: RequestColor = 'r';
  selected: { all: ISelection, r: ISelection, y: ISelection, g: ISelection, b: ISelection } = { all: {}, r: {}, y: {}, g: {}, b: {}};
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
  columns: number;
  closetMode: ClosetMode = 'all';
  maxColumns = 8;
  itemSize: ItemSize = 'small';
  itemSizePx = 32;
  typeFolded: { [key: string]: boolean } = {};
  isRendering: number = 0; // 1 = link, 2 = image
  lastLink?: string; // Reuse last copy link to prevent unnecessary KV writes.

  // Internal
  _clickSub: SubscriptionLike;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _searchService: SearchService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _http: HttpClient,
    private readonly _route: ActivatedRoute
  ) {
    this.requesting = location.pathname.endsWith('request');

    // Load user preferences.
    this.hideUnselected = localStorage.getItem('closet.hide-unselected') === '1';
    this.hidden = (JSON.parse(localStorage.getItem('closet.hidden') || '[]') as Array<string>).reduce((map, guid) => (map[guid] = true, map), {} as { [key: string]: boolean });
    this.columns = +localStorage.getItem('closet.columns')! || 6;
    this.closetMode = localStorage.getItem('closet.show-mode') as ClosetMode || 'all';
    this.itemSize = localStorage.getItem('closet.item-size') as ItemSize || 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;
    this.shouldSync = localStorage.getItem('closet.sync') === '1';
    // Don't save hide IAP. Conflicts with other visibility code.

    this.initializeBackground();
    this.initializeItems();

    this._clickSub = _eventService.clicked.subscribe(evt => {
      this.clickoutColorPicker(evt);
      this.clickoutCopyImagePicker(evt);
    });
  }

  ngOnDestroy(): void {
    this._clickSub.unsubscribe();
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

  /** Toggles item size between small and normal. */
  toggleItemSize(): void {
    this.itemSize = this.itemSize === 'small' ? 'default' : 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;
    localStorage.setItem('closet.item-size', this.itemSize);
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
    if (!this.backgroundMap[bgGuid]) {
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
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  /** Updates warning indicators */
  private updateSelectionWarnings(): void {
    this.selectionHasHidden = Object.keys(this.hidden).some(guid => this.selected.all[guid]);
    this.selectionHasUnavailable = this.available ? Object.keys(this.selected.all).some(guid => !this.available![guid]) : false;
    this._changeDetectorRef.markForCheck();
  }

  // #region Initialize items

  private initializeItems(): void {
    // Unequippable items.
    const itemTypeUnequip: { [key: string]: number } = [
      ItemType.Necklace, ItemType.Hat, ItemType.Held, ItemType.Shoes, ItemType.FaceAccessory
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

    // Add items to closets.
    for (const item of this._dataService.itemConfig.items) {
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
        b: queryParams.get('b') || ''
      });
    }
  }

  /** Loads selection data from KV API. */
  private initializeFromKV(key: string): void {
    if (!key) { return; }
    const sKey = encodeURIComponent(key);
    this._http.get(`/api/outfit-request?key=${sKey}`, { responseType: 'json' }).subscribe({
      next: (data: any) => {
        if (!data) { return; }
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

    this.updateSelectionWarnings();
  }

  // #endregion

  // #region Serialization

  private serializeModel(): IOutfitRequest {
    return {
      r: this.serializeItems(Object.values(this.selected.r)),
      y: this.serializeItems(Object.values(this.selected.y)),
      g: this.serializeItems(Object.values(this.selected.g)),
      b: this.serializeItems(Object.values(this.selected.b))
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

  showCopyImagePicker(evt: MouseEvent): void {
    // When requesting always copy image as request.
    if (this.requesting) { this.copyImage('request'); return; }

    // When in closet, show copy options.
    this.showingImagePicker = !this.showingImagePicker;
    evt.preventDefault();
    evt.stopPropagation();
    this._changeDetectorRef.markForCheck();
  }

  clickoutCopyImagePicker(evt: MouseEvent): void {
    if (!this.showingImagePicker) { return; }
    const target = evt.target as HTMLElement;
    if (this._divCopyImagePicker?.nativeElement.contains(target)) { return; }
    this.showingImagePicker = false;
    this._changeDetectorRef.markForCheck();
  }

  copyImage(mode: CopyImageMode): void {
    this.showingImagePicker = false;
    this.isRendering = 2;
    this._changeDetectorRef.markForCheck();

    setTimeout(() => {
      this.renderImage(mode);
    });
  }

  private renderImage(mode: CopyImageMode): void {
    /* Draw image in sections based roughly on the number of items per closet. */
    /* Because this is a shared image instead of URL we care more about spacing than closet columns. */
    const cols = [10, 7, 5, 5];
    const canvas = document.createElement('canvas');

    const cOutfit = Math.ceil(this.items[ItemType.Outfit].length / cols[0]);
    const cShoes = Math.ceil(this.items[ItemType.Shoes].length / cols[0]);
    const cMask = Math.ceil(this.items[ItemType.Mask].length / cols[0]);
    const cFaceAcc = Math.ceil(this.items[ItemType.FaceAccessory].length / cols[0]);
    const cNecklace = Math.ceil(this.items[ItemType.Necklace].length / cols[0]);
    const cHair = Math.ceil(this.items[ItemType.Hair].length / cols[1]);
    const cHat = Math.ceil(this.items[ItemType.Hat].length / cols[1]);
    const cCape = Math.ceil(this.items[ItemType.Cape].length / cols[2]);
    const cHeld = Math.ceil(this.items[ItemType.Held].length / cols[3]);
    const cProp = Math.ceil(this.items[ItemType.Prop].length / cols[3]);
    const h1 = (cOutfit + cShoes + cMask + cFaceAcc + cNecklace) * _wBox + _wPad * 6 -_wGap;
    const h2 = (cHair + cHat) * _wBox + _wPad * 3 - _wGap;
    const h3 = cCape * _wBox + _wPad * 2 - _wGap;
    const h4 = (cHeld + cProp) * _wBox + _wPad * 3 - _wGap;
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
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.Outfit], itemImgs, false);
    sx = _wPad;  sy = _wPad * 2 + cOutfit * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.Shoes], itemImgs, false);
    sx = _wPad;  sy = _wPad * 3 + (cOutfit + cShoes) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.Mask], itemImgs, false);
    sx = _wPad;  sy = _wPad * 4 + (cOutfit + cShoes + cMask) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.FaceAccessory], itemImgs, false);
    sx = _wPad;  sy = _wPad * 5 + (cOutfit + cShoes + cMask + cFaceAcc) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], mode, this.items[ItemType.Necklace], itemImgs, false);

    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[1], mode, this.items[ItemType.Hair], itemImgs, false);
    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad * 2 + cHair * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[1], mode, this.items[ItemType.Hat], itemImgs, false);

    sx = _wPad * 3 + (cols[0] + cols[1]) * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[2], mode, this.items[ItemType.Cape], itemImgs, false);

    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[3], mode, this.items[ItemType.Held], itemImgs, false);
    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad * 2 + cHeld * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[3], mode, this.items[ItemType.Prop], itemImgs, false);

    // Draw attribution
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';

    let l1 = 'Icons by contributors of the Sky: Children of the Light Wiki';
    if (this.bgAttribution) { l1 = `${this.bgAttribution} | ${l1}`; }
    ctx.fillText(l1, canvas.width - 8, canvas.height - 8);

    let l2 = '© Sky: Children of the Light';
    ctx.fillText(l2, canvas.width - 8, canvas.height - 8 - 24);

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

  private cvsDrawSection(ctx: CanvasRenderingContext2D, sx: number, sy: number, c: number, mode: CopyImageMode, items: Array<IItem>, itemImgs: { [guid: string]: HTMLImageElement }, unequip: boolean): void {
    let x = 0; let y = 0;
    const nextX = () => { if (++x >= c) { x = 0; y++; }};
    const h = Math.ceil(items.length / c);

    // Draw rectangle around section
    ctx.fillStyle = '#0008';
    ctx.beginPath(); ctx.roundRect(sx - _wGap, sy - _wGap, _wBox * c + _wGap, _wBox * h + _wGap, 8); ctx.fill();
    ctx.strokeStyle = '#0006'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(sx - _wGap, sy - _wGap, _wBox * c + _wGap, _wBox * h + _wGap, 8); ctx.stroke();

    if (unequip) {
      const imgNone = document.querySelector('.item-none img') as HTMLImageElement;
      ctx.fillStyle = '#0008';
      ctx.beginPath(); ctx.roundRect(sx + x * _wBox, sy + y * _wBox, _wItem, _wItem, 8); ctx.fill();
      ctx.globalAlpha = 0.2;
      ctx.drawImage(imgNone, 0, 0, imgNone.naturalWidth, imgNone.naturalHeight, sx + x * _wBox, sy + y * _wBox, 64, 64);
      ctx.globalAlpha = 1;
      nextX();
    }

    const showingOwnItems = this.closetMode === 'closet';
    for (const item of items) {
      if (!item.icon) { nextX(); continue; }
      const img = itemImgs[item.guid];
      if (!img) { nextX(); continue; }

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
        if (mode === 'closet' && this.hidden[item.guid]) { ctx.globalAlpha = this.selected.all[item.guid] ? _aHalfHide : _aHide; }
      }

      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, sx + x * _wBox, sy + y * (_wBox), _wItem, _wItem);
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
}
