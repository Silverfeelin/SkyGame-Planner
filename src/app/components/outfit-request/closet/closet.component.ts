import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';

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
  itemTypeUnequip: { [key: string]: boolean } = [
    ItemType.Necklace, ItemType.Hat, ItemType.Held, ItemType.Shoes, ItemType.FaceAccessory
  ].reduce((map, type) => (map[`${type}`] = true, map), {} as { [key: string]: boolean });

  // Item data
  items: { [key: string]: Array<IItem> } = {};

  // Item selection
  selectMode?: SelectMode;
  selected: { a: ISelection, r: ISelection, g: ISelection, b: ISelection } = { a: {}, r: {}, g: {}, b: {}};
  hidden: { [key: string]: boolean } = {};

  // Closet display
  modifyingCloset = false;
  // hideMissing = false;
  hideUnselected = false;
  columns: number;
  showMode: ShowMode = 'all';
  columnsLabel = 'Show as closet';
  maxColumns = 6;

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectionRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute
  ) {
    this.initializeItems();
    // this.hideMissing = localStorage.getItem('closet.hide-missing') === '1';
    this.hideUnselected = localStorage.getItem('closet.hide-unselected') === '1';
    this.hidden = (JSON.parse(localStorage.getItem('closet.hidden') || '[]') as Array<string>).reduce((map, guid) => (map[guid] = true, map), {} as { [key: string]: boolean });
    this.columns = +localStorage.getItem('closet.columns')! || 3;
    this.showMode = localStorage.getItem('closet.show-mode') as ShowMode || 'all';
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

  // toggleHideMissing(): void {
  //   this.hideMissing = !this.hideMissing;
  //   localStorage.setItem('closet.hide-missing', this.hideMissing ? '1' : '0');
  // }

  toggleHideUnselected(): void {
    this.hideUnselected = !this.hideUnselected;
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

  scrollToType(type: ItemType): void {
    const el = document.querySelector(`.closet-items[data-type="${type}"]`);
    if (!el) { return; }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setColumns(n: number): void {
    this.columns = n;
    localStorage.setItem('closet.columns', `${n}`);
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
