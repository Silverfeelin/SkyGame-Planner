import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { ItemSize } from '../../item/item.component';
import { SearchService } from 'src/app/services/search.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

interface ISelection { [guid: string]: IItem; }
interface IOutfitRequest { a?: string; r: string; o: string; y: string; g: string; b: string; };

type SelectMode = 'r' | 'o' | 'y' | 'g' | 'b';
type ShowMode = 'all' | 'closet';

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
export class ClosetComponent {
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;
  @ViewChild('ttCopyLnk', { static: false }) private readonly _ttCopyLnk?: NgbTooltip;
  @ViewChild('ttCopyImg', { static: false }) private readonly _ttCopyImg?: NgbTooltip;
  @ViewChild('warnHidden', { static: false }) private readonly _warnHidden?: ElementRef<HTMLElement>;

  _bgImg: HTMLImageElement;

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

  // Item selection
  showingColorPicker = false;
  selectMode: SelectMode = 'r';
  selected: { all: ISelection, r: ISelection, o: ISelection, y: ISelection, g: ISelection, b: ISelection } = { all: {}, r: {}, o: {}, y: {}, g: {}, b: {}};
  hidden: { [guid: string]: boolean } = {};
  available?: ISelection;

  selectionHasHidden = false;
  selectionHasUnavailable = false;

  // Search
  searchText?: string;
  _lastSearchText = '';
  searchResults?: { [guid: string]: IItem };

  // Closet display
  modifyingCloset = false;
  shouldSync = false;
  hideUnselected = false;
  hideIap = false;
  columns: number;
  requesting = false;
  showMode: ShowMode = 'all';
  columnsLabel = 'Show as closet';
  maxColumns = 8;
  itemSize: ItemSize = 'small';
  itemSizePx = 32;
  typeFolded: { [key: string]: boolean } = {};

  // For rendering
  _itemImgs: { [guid: string]: HTMLImageElement } = {};
  _rendering: number = 0;

  // For sharing
  _lastLink?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _searchService: SearchService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _http: HttpClient,
    private readonly _route: ActivatedRoute
  ) {
    // Load user preferences.
    this.hideUnselected = localStorage.getItem('closet.hide-unselected') === '1';
    this.hidden = (JSON.parse(localStorage.getItem('closet.hidden') || '[]') as Array<string>).reduce((map, guid) => (map[guid] = true, map), {} as { [key: string]: boolean });
    this.columns = +localStorage.getItem('closet.columns')! || 6;
    this.showMode = localStorage.getItem('closet.show-mode') as ShowMode || 'all';
    this.itemSize = localStorage.getItem('closet.item-size') as ItemSize || 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;
    this.shouldSync = localStorage.getItem('closet.sync') === '1';

    // Set background for rendering.
    this._bgImg = new Image();
    this._bgImg.crossOrigin = 'anonymous';
    const rndImg = ['isle', 'prairie', 'forest', 'village', 'wasteland', 'vault'][Math.floor(Math.random() * 6)];
    this._bgImg.src = `/assets/game/background/${rndImg}.webp`;

    this.requesting = location.pathname.endsWith('request');
    this.initializeItems();
  }

  copyLink(): void {
    if (this._lastLink) {
      navigator.clipboard.writeText(this._lastLink).then(() => {
        this._ttCopyLnk?.open();
        setTimeout(() => this._ttCopyLnk?.close(), 1000);
      }).catch(error  => {
        console.error(error);
        alert('Copying link failed. Please make sure the document is focused.');
      });
      return;
    }

    this._rendering = 1;
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
        link.searchParams.set('o', request.o);
        link.searchParams.set('y', request.y);
        link.searchParams.set('g', request.g);
        link.searchParams.set('b', request.b);
      }

      this._lastLink = link.href;
      return new Blob([link.href], { type: 'text/plain' });
    };

    const doneCopying = () => { this._rendering = 0; this._changeDetectorRef.detectChanges(); };
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

  copyImage(): void {
    this._rendering = 2;
    this._changeDetectorRef.markForCheck();

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
    canvas.height = h === h4 ? h + 48 : h === h3 ? h + 24 : h;
    const ctx = canvas.getContext('2d')!;
    this.cvsDrawBackground(ctx);

    // Store item images for drawing.
    const itemDivs = document.querySelectorAll('.closet-item');
    this._itemImgs = Array.from(itemDivs).reduce((obj, div) => {
      const img = div.querySelector('.item-icon img') as HTMLImageElement;
      if (!img) { return obj; }
      const guid = div.getAttribute('data-guid')!;
      obj[guid] = img;
      return obj;
    }, {} as { [guid: string]: HTMLImageElement });

    // Draw item sections
    let sx = _wPad, sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.Outfit], false);
    sx = _wPad;  sy = _wPad * 2 + cOutfit * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.Shoes], false);
    sx = _wPad;  sy = _wPad * 3 + (cOutfit + cShoes) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.Mask], false);
    sx = _wPad;  sy = _wPad * 4 + (cOutfit + cShoes + cMask) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.FaceAccessory], false);
    sx = _wPad;  sy = _wPad * 5 + (cOutfit + cShoes + cMask + cFaceAcc) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.Necklace], false);

    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[1], this.items[ItemType.Hair], false);
    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad * 2 + cHair * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[1], this.items[ItemType.Hat], false);

    sx = _wPad * 3 + (cols[0] + cols[1]) * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[2], this.items[ItemType.Cape], false);

    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[3], this.items[ItemType.Held], false);
    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad * 2 + cHeld * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[3], this.items[ItemType.Prop], false);

    // Draw attribution
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Icons by contributors of the Sky: Children of the Light Wiki', canvas.width - 8, canvas.height - 8);
    ctx.fillText('© Sky: Children of the Light', canvas.width - 8, canvas.height - 8 - 24);

    // Save canvas to PNG and write to clipboard
    const doneCopying = () => { this._rendering = 0; this._changeDetectorRef.detectChanges(); };
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

  setSelectMode(mode: SelectMode): void {
    this.showingColorPicker = false;
    this.modifyingCloset = false;
    this.selectMode = mode;
  }

  toggleItem(item: IItem): void {
    this._lastLink = undefined;

    if (this.modifyingCloset) {
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
      this.updateSelectionHasHidden();
      return;
    }

    const selected = this.selected[this.selectMode];
    const select = !selected[item.guid];
    delete this.selected.all[item.guid];
    delete this.selected.r[item.guid];
    delete this.selected.o[item.guid];
    delete this.selected.y[item.guid];
    delete this.selected.g[item.guid];
    delete this.selected.b[item.guid];

    if (select) {
      selected[item.guid] = item;
      this.selected.all[item.guid] = item;
    }

    this.updateUrlFromSelection();
    this.updateSelectionHasHidden();
    this._changeDetectorRef.markForCheck();
  }

  resetSelection(): void {
    if (!confirm('This will remove the color highlights from all items. Are you sure?')) { return; }
    this.selected = { all: {}, r: {}, o: {}, y: {}, g: {}, b: {}};
    this.selectionHasHidden = false;
    const url = new URL(location.href);
    url.searchParams.delete('k');
    url.searchParams.delete('r');
    url.searchParams.delete('o');
    url.searchParams.delete('y');
    url.searchParams.delete('g');
    url.searchParams.delete('b');
    this._lastLink = undefined;
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  randomSelection(): void {
    if (!confirm('This will randomly select items from your closet. Are you sure?')) { return; }
    this.selected = { all: {}, r: {}, o: {}, y: {}, g: {}, b: {}};
    this.selectionHasHidden = false;

    const heldProp = Math.random() < 0.4;
    for (const type of Object.keys(this.items)) {
      if (type === ItemType.Held && !heldProp) { continue; }
      if (type === ItemType.Prop && heldProp) { continue; }
      const items = this.items[type as string].filter(item => !this.hidden[item.guid]);
      const item = items[Math.floor(Math.random() * items.length)];
      if (!item) { continue; }
      this.selected.r[item.guid] = item;
      this.selected.all[item.guid] = item;
    }

    this.updateUrlFromSelection();
    this.updateSelectionHasHidden();
    this._changeDetectorRef.markForCheck();
  }

  toggleItemSize(): void {
    this.itemSize = this.itemSize === 'small' ? 'default' : 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;
    localStorage.setItem('closet.item-size', this.itemSize);
  }

  toggleHideUnselected(): void {
    this.hideUnselected = !this.hideUnselected;
    this.typeFolded = {};
    localStorage.setItem('closet.hide-unselected', this.hideUnselected ? '1' : '0');
  }

  toggleIap(): void {
    this.hideIap = !this.hideIap;
    localStorage.setItem('closet.hide-iap', this.hideIap ? '1' : '0');
  }

  toggleCloset(): void {
    this.showMode = this.showMode === 'all' ? 'closet' : 'all';
    if (this.showMode !== 'closet') {
      this.modifyingCloset = false;
    }
    localStorage.setItem('closet.show-mode', this.showMode);
  }

  modifyCloset(): void {
    this.modifyingCloset = !this.modifyingCloset;
    this.modifyingCloset && (this.showMode = 'closet');
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

  toggleSyncUnlocked(): void {
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
    this._lastLink = undefined;
    this.updateSelectionHasHidden();
    localStorage.setItem('closet.hidden', JSON.stringify(Object.keys(this.hidden)));
  }

  resetSync(): void {
    if (!confirm('This will show all items in your closet. Are you sure?')) { return; }
    this.hidden = {};
    this.shouldSync = false;
    localStorage.setItem('closet.sync', '0');
    this._lastLink = undefined;
    localStorage.setItem('closet.hidden', JSON.stringify([]));
  }

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

  showColorPicker(): void {
    this.showingColorPicker = !this.showingColorPicker;
    this._changeDetectorRef.markForCheck();
  }

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
      if (type === 'Instrument') { type = ItemType.Held; }
      if (!this.items[type as string]) { continue; }

      this.items[type as string].push(item);
      this.allItems.push(item);
      this.itemMap[item.guid] = item;
    }

    // Sort items by order.
    for (const type of this.itemTypes) {
      this.items[type as string].sort((a, b) => (a.order || 99999) - (b.order || 99999));
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
        o: queryParams.get('o') || '',
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

    this.selected = { all: {}, r: {}, o: {}, y: {}, g: {}, b: {}};
    const r = this.deserializeItems(data.r);
    for (const item of r) { this.selected.r[item.guid] = item; this.selected.all[item.guid] = item; }
    const o = this.deserializeItems(data.o);
    for (const item of o) { this.selected.o[item.guid] = item; this.selected.all[item.guid] = item; }
    const y = this.deserializeItems(data.y);
    for (const item of y) { this.selected.y[item.guid] = item; this.selected.all[item.guid] = item; }
    const g = this.deserializeItems(data.g);
    for (const item of g) { this.selected.g[item.guid] = item; this.selected.all[item.guid] = item; }
    const b = this.deserializeItems(data.b);
    for (const item of b) { this.selected.b[item.guid] = item; this.selected.all[item.guid] = item; }

    this.updateSelectionHasHidden();
  }

  private updateUrlFromSelection(): void {
    const r = this.serializeItems(Object.values(this.selected.r));
    const o = this.serializeItems(Object.values(this.selected.o));
    const y = this.serializeItems(Object.values(this.selected.y));
    const g = this.serializeItems(Object.values(this.selected.g));
    const b = this.serializeItems(Object.values(this.selected.b));

    const url = new URL(location.href);
    url.searchParams.delete('k');
    url.searchParams.set('r', r);
    url.searchParams.set('o', o);
    url.searchParams.set('y', y);
    url.searchParams.set('g', g);
    url.searchParams.set('b', b);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  private updateSelectionHasHidden(): void {
    this.selectionHasHidden = Object.keys(this.hidden).some(guid => this.selected.all[guid]);
    this.selectionHasUnavailable = this.available ? Object.keys(this.selected.all).some(guid => !this.available![guid]) : false;
    this._changeDetectorRef.markForCheck();
  }

  private serializeModel(): IOutfitRequest {
    return {
      r: this.serializeItems(Object.values(this.selected.r)),
      o: this.serializeItems(Object.values(this.selected.o)),
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

  // #region Template canvas helpers

  private cvsDrawBackground(ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    ctx.filter = 'blur(4px) brightness(0.8)';

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

  private cvsDrawSection(ctx: CanvasRenderingContext2D, sx: number, sy: number, c: number, items: Array<IItem>, unequip: boolean): void {
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

    const drawSelection = (color: string): void => {
      ctx.strokeStyle = color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(sx + x * _wBox, sy + y * _wBox, _wItem, _wItem, 8); ctx.stroke();
    }

    const hasAnySelected = Object.keys(this.selected.all).length > 0;
    const showCloset = this.showMode === 'closet';

    for (const item of items) {
      if (!item.icon) { nextX(); continue; }
      const img = this._itemImgs[item.guid];
      if (!img) { nextX(); continue; }

      // Draw item box
      ctx.fillStyle = '#0006';
      ctx.beginPath(); ctx.roundRect(sx + x * _wBox, sy + y * _wBox, _wItem, _wItem, 8); ctx.fill();

      // Hide unselected IAPs.
      if (this.hideIap && item.iaps?.length && !this.selected.all[item.guid]) { ctx.globalAlpha = _aHide; }
      if (this.requesting) {
        // While requesting hide all unselected items.
        if (!this.selected.all[item.guid]) { ctx.globalAlpha = _aHide; }
      } else {
        // In closet hide missing items.
        if (showCloset && this.hidden[item.guid]) { ctx.globalAlpha = this.selected.all[item.guid] ? _aHalfHide : _aHide; }
      }
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, sx + x * _wBox, sy + y * (_wBox), _wItem, _wItem);
      ctx.globalAlpha = 1;

      // Draw selection
      if (this.selected.r[item.guid]) { drawSelection('#f00'); }
      if (this.selected.o[item.guid]) { drawSelection('#f80'); }
      if (this.selected.y[item.guid]) { drawSelection('#ff0'); }
      if (this.selected.g[item.guid]) { drawSelection('#0f0'); }
      if (this.selected.b[item.guid]) { drawSelection('#0aa0ff'); }

      nextX();
    }
  }

  // #endregion
}
