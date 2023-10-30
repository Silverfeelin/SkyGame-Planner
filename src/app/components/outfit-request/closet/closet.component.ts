import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { ItemSize } from '../../item/item.component';

interface ISelection { [key: string]: IItem; }
type SelectMode = 'r' | 'g' | 'b';
type ShowMode = 'all' | 'closet';

@Component({
  selector: 'app-closet',
  templateUrl: './closet.component.html',
  styleUrls: ['./closet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClosetComponent {
  @ViewChild('ttCopy', { static: true }) private readonly _ttCopy!: NgbTooltip;

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

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectionRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute
  ) {
    this.hideUnselected = localStorage.getItem('closet.hide-unselected') === '1';
    this.hidden = (JSON.parse(localStorage.getItem('closet.hidden') || '[]') as Array<string>).reduce((map, guid) => (map[guid] = true, map), {} as { [key: string]: boolean });
    this.columns = +localStorage.getItem('closet.columns')! || 6;
    this.showMode = localStorage.getItem('closet.show-mode') as ShowMode || 'all';
    this.itemSize = localStorage.getItem('closet.item-size') as ItemSize || 'small';
    this.itemSizePx = this.itemSize === 'small' ? 32 : 64;

    this.initializeItems();
  }

  copyLink(): void {
    navigator.clipboard.writeText(location.href).then(() => {
      this._ttCopy.open();
      setTimeout(() => this._ttCopy.close(), 1000);
    });
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

    if (!this.selectMode) { return; }
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

    this._changeDetectionRef.markForCheck();
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
}
