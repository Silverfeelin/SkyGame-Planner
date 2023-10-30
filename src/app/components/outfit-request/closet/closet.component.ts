import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { ItemSize } from '../../item/item.component';

interface ISelection { [key: string]: IItem; }
type SelectMode = 'r' | 'g' | 'b';
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
const _ga = 0.3;

@Component({
  selector: 'app-closet',
  templateUrl: './closet.component.html',
  styleUrls: ['./closet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClosetComponent {
  @ViewChild('ttCopyLnk', { static: true }) private readonly _ttCopyLnk!: NgbTooltip;
  @ViewChild('ttCopyImg', { static: true }) private readonly _ttCopyImg!: NgbTooltip;

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

  itemTypeUnequip: { [key: string]: boolean } = [
    ItemType.Necklace, ItemType.Hat, ItemType.Held, ItemType.Shoes, ItemType.FaceAccessory
  ].reduce((map, type) => (map[`${type}`] = true, map), {} as { [key: string]: boolean });

  // Item data
  items: { [type: string]: Array<IItem> } = {};

  // Item selection
  selectMode?: SelectMode;
  selected: { a: ISelection, r: ISelection, g: ISelection, b: ISelection } = { a: {}, r: {}, g: {}, b: {}};
  hidden: { [guid: string]: boolean } = {};
  selectionHasHidden = false;

  // Closet display
  modifyingCloset = false;
  // hideMissing = false;
  hideUnselected = false;
  columns: number;
  showMode: ShowMode = 'all';
  columnsLabel = 'Show as closet';
  maxColumns = 8;
  itemSize: ItemSize = 'small';
  itemSizePx = 32;
  typeFolded: { [key: string]: boolean } = {};

  // For rendering
  _itemImgs: { [guid: string]: HTMLImageElement } = {};
  _rendering = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute
  ) {
    this.hideUnselected = localStorage.getItem('closet.hide-unselected') === '1';
    this.hidden = (JSON.parse(localStorage.getItem('closet.hidden') || '[]') as Array<string>).reduce((map, guid) => (map[guid] = true, map), {} as { [key: string]: boolean });
    this.columns = +localStorage.getItem('closet.columns')! || 6;
    this.showMode = localStorage.getItem('closet.show-mode') as ShowMode || 'all';
    this.itemSize = localStorage.getItem('closet.item-size') as ItemSize || 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;

    this._bgImg = new Image();
    this._bgImg.crossOrigin = 'anonymous';
    this._bgImg.src = 'https://silverfeelin.github.io/SkyGame-Planner/assets/game/background.webp';

    this.initializeItems();
  }

  copyLink(): void {
    navigator.clipboard.writeText(location.href).then(() => {
      this._ttCopyLnk.open();
      setTimeout(() => this._ttCopyLnk.close(), 1000);
    });
  }

  copyImage(): void {
    this._rendering = true;

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
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.Outfit], this.itemTypeUnequip[ItemType.Outfit]);
    sx = _wPad;  sy = _wPad * 2 + cOutfit * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.Shoes], this.itemTypeUnequip[ItemType.Shoes]);
    sx = _wPad;  sy = _wPad * 3 + (cOutfit + cShoes) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.Mask], this.itemTypeUnequip[ItemType.Mask]);
    sx = _wPad;  sy = _wPad * 4 + (cOutfit + cShoes + cMask) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.FaceAccessory], this.itemTypeUnequip[ItemType.FaceAccessory]);
    sx = _wPad;  sy = _wPad * 5 + (cOutfit + cShoes + cMask + cFaceAcc) * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[0], this.items[ItemType.Necklace], this.itemTypeUnequip[ItemType.Necklace]);

    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[1], this.items[ItemType.Hair], this.itemTypeUnequip[ItemType.Hair]);
    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad * 2 + cHair * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[1], this.items[ItemType.Hat], this.itemTypeUnequip[ItemType.Hat]);

    sx = _wPad * 3 + (cols[0] + cols[1]) * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[2], this.items[ItemType.Cape], this.itemTypeUnequip[ItemType.Cape]);

    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad;
    this.cvsDrawSection(ctx, sx, sy, cols[3], this.items[ItemType.Held], this.itemTypeUnequip[ItemType.Held]);
    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad * 2 + cHeld * _wBox;
    this.cvsDrawSection(ctx, sx, sy, cols[3], this.items[ItemType.Prop], this.itemTypeUnequip[ItemType.Prop]);

    // Draw attribution
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Icons by contributors of the Sky: Children of the Light Wiki', canvas.width - 8, canvas.height - 8);
    ctx.fillText('© Sky: Children of the Light', canvas.width - 8, canvas.height - 8 - 24);

    // Save canvas to PNG and write to clipboard
    const doneRendering = () => { this._rendering = false; this._changeDetectorRef.detectChanges(); };
    try {
      canvas.toBlob(blob => {
        if (!blob) { return doneRendering(); }
        const item = new ClipboardItem({ [blob.type]: blob });
        navigator.clipboard.write([item]).then(() => {
          doneRendering();
          this._ttCopyImg.open();
          setTimeout(() => this._ttCopyImg.close(), 1000);
        }).catch(error => {
          console.error('Could not copy image to clipboard: ', error);
          alert('Copying failed. Please make sure the document is focused.');
          doneRendering();
        });
      }, 'image/png');
    } catch {
      this._rendering = false;
    }
  }

  setSelectMode(mode: SelectMode): void {
    this.modifyingCloset = false;
    this.selectMode = this.selectMode === mode ? undefined : mode;
  }

  toggleItem(item: IItem): void {
    if (this.modifyingCloset) {
      const hide = !this.hidden[item.guid];
      hide ? (this.hidden[item.guid] = true) : (delete this.hidden[item.guid]);
      localStorage.setItem('closet.hidden', JSON.stringify(Object.keys(this.hidden)));

      this.updateSelectionHasHidden();
      return;
    }

    if (!this.selectMode) { this.selectMode = 'r'; }
    const selected = this.selected[this.selectMode];

    const select = !selected[item.guid];
    delete this.selected.a[item.guid];
    delete this.selected.r[item.guid];
    delete this.selected.g[item.guid];
    delete this.selected.b[item.guid];

    if (select) {
      selected[item.guid] = item;
      this.selected.a[item.guid] = item;
    }

    this.updateSelectionHasHidden();

    const r = this.serializeSelected(Object.values(this.selected.r));
    const g = this.serializeSelected(Object.values(this.selected.g));
    const b = this.serializeSelected(Object.values(this.selected.b));

    const url = new URL(location.href);
    url.searchParams.set('r', r);
    url.searchParams.set('g', g);
    url.searchParams.set('b', b);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);

    this._changeDetectorRef.markForCheck();
  }

  resetSelection(): void {
    if (!confirm('This will remove the color highlights from all items. Are you sure?')) { return; }
    this.selected = { a: {}, r: {}, g: {}, b: {}};
    const url = new URL(location.href);
    url.searchParams.delete('r');
    url.searchParams.delete('g');
    url.searchParams.delete('b');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  toggleItemSize(): void {
    this.itemSize = this.itemSize === 'small' ? 'default' : 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;
    localStorage.setItem('closet.item-size', this.itemSize);
  }

  // toggleHideMissing(): void {
  //   this.hideMissing = !this.hideMissing;
  //   localStorage.setItem('closet.hide-missing', this.hideMissing ? '1' : '0');
  // }

  toggleHideUnselected(): void {
    this.hideUnselected = !this.hideUnselected;
    this.typeFolded = {};
    localStorage.setItem('closet.hide-unselected', this.hideUnselected ? '1' : '0');
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
    this.selectMode = undefined;
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

  setColumns(n: number): void {
    this.columns = n;
    localStorage.setItem('closet.columns', `${n}`);
  }

  updateHiddenFromProgress(): void {
    const hidden: { [guid: string]: boolean } = {};
    let i = 0;
    for (const type of Object.keys(this.items)) {
      for (const item of this.items[type as string]) {
        if (!item.unlocked) { hidden[item.guid] = true; i++; }
      }
    }

    if (!confirm(`This will hide ${i} item(s) from your closet. Are you sure?`)) { return; }
    this.hidden = hidden;
    localStorage.setItem('closet.hidden', JSON.stringify(Object.keys(this.hidden)));
  }

  resetHidden(): void {
    if (!confirm('This will show all items in your closet. Are you sure?')) { return; }
    this.hidden = {};
    localStorage.setItem('closet.hidden', JSON.stringify([]));
  }

  private initializeItems(): void {
    this.items = {};
    for (const type of this.itemTypes) {
      this.items[type as string] = [];
    }

    for (const item of this._dataService.itemConfig.items) {
      let type = item.type;
      if (type === 'Instrument') { type = ItemType.Held; }
      if (!this.items[type as string]) { continue; }

      this.items[type as string].push(item);
    }

    for (const type of this.itemTypes) {
      this.items[type as string].sort((a, b) => (a.order || 99999) - (b.order || 99999));
    }

    const selR = this._route.snapshot.queryParamMap.get('r');
    if (selR?.length) {
      const items = this.deserializeSelected(selR);
      for (const item of items) { this.selected.r[item.guid] = item; this.selected.a[item.guid] = item; }
    }
    const selG = this._route.snapshot.queryParamMap.get('g');
    if (selG?.length) {
      const items = this.deserializeSelected(selG);
      for (const item of items) { this.selected.g[item.guid] = item; this.selected.a[item.guid] = item; }
    }
    const selB = this._route.snapshot.queryParamMap.get('b');
    if (selB?.length) {
      const items = this.deserializeSelected(selB);
      for (const item of items) { this.selected.b[item.guid] = item; this.selected.a[item.guid] = item; }
    }

    this.updateSelectionHasHidden();
  }

  private updateSelectionHasHidden(): void {
    this.selectionHasHidden = Object.keys(this.hidden).some(guid => this.selected.a[guid]);
  }

  private serializeSelected(items: Array<IItem>): string {
    const ids = items.map(item => (item.id || 0).toString(36).padStart(3, '0'));
    return ids.join('');
  }

  private deserializeSelected(serialized: string): Array<IItem> {
    const ids = serialized?.match(/.{3}/g) || [];
    const items = this._dataService.itemConfig.items;
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
    ctx.fillStyle = '#0005';
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

    for (const item of items) {
      if (!item.icon) { nextX(); continue; }
      const img = this._itemImgs[item.guid];
      if (!img) { nextX(); continue; }

      // Draw item box
      ctx.fillStyle = '#0006';
      ctx.beginPath(); ctx.roundRect(sx + x * _wBox, sy + y * _wBox, _wItem, _wItem, 8); ctx.fill();

      // Draw item, translucent if not selected
      if (!this.selected.a[item.guid]) { ctx.globalAlpha = _ga; }
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, sx + x * _wBox, sy + y * (_wBox), _wItem, _wItem);
      ctx.globalAlpha = 1;

      // Draw selection
      if (this.selected.r[item.guid]) { drawSelection('#f00'); }
      if (this.selected.g[item.guid]) { drawSelection('#0f0'); }
      if (this.selected.b[item.guid]) { drawSelection('#00f'); }

      nextX();
    }
  }

  // #endregion
}
