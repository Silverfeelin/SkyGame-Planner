import {
  ChangeDetectionStrategy, Component, ElementRef, OnInit,
  ViewChild, inject, input, output, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ItemHelper } from '@app/helpers/item-helper';
import { DataService } from '@app/services/data.service';
import { SearchService } from '@app/services/search.service';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { IItem, ItemSize, ItemType } from 'skygame-data';

export type ItemSelection = { [key in ItemType]?: IItem };

@Component({
  selector: 'atmos-vault-item-picker',
  templateUrl: './atmos-vault-item-picker.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent, FormsModule, ItemTypePipe]
})
export class AtmosVaultItemPickerComponent implements OnInit {
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  readonly selectionChange = output<ItemSelection>();
  readonly selectionInput = input<ItemSelection>({});

  private readonly _dataService = inject(DataService);
  private readonly _searchService = inject(SearchService);
  private readonly _elementRef = inject(ElementRef<HTMLElement>);

  columns = 6;
  itemSize = signal<ItemSize>('small');
  itemSizePx = signal<number>(32);

  readonly requiredParams: { [key in ItemType]?: string } = {
    [ItemType.Outfit]: 'outfitId', [ItemType.Mask]: 'maskId',
    [ItemType.Hair]: 'hairId', [ItemType.Cape]: 'capeId'
  };
  readonly optionalParams: { [key in ItemType]?: string } = {
    [ItemType.Shoes]: 'shoesId', [ItemType.FaceAccessory]: 'faceAccessoryId',
    [ItemType.Necklace]: 'necklaceId', [ItemType.HairAccessory]: 'hairAccessoryId',
    [ItemType.HeadAccessory]: 'headAccessoryId', [ItemType.Prop]: 'propId'
  };

  readonly itemTypes: Array<ItemType> = [
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
    ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop
  ];
  readonly selectionTypes = this.itemTypes.filter(
    t => t !== ItemType.Held && t !== ItemType.Furniture && t !== ItemType.OutfitShoes
  );

  readonly sections: Array<Array<ItemType>> = [
    [ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes],
    [ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace],
    [ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory],
    [ItemType.Cape],
    [ItemType.Held, ItemType.Furniture, ItemType.Prop]
  ];

  readonly itemIcons: { [key: string]: string } = {
    ['Outfit']: 'outfit', ['Shoes']: 'shoes', ['OutfitShoes']: 'outfit-shoes',
    ['Mask']: 'mask', ['FaceAccessory']: 'face-acc', ['Necklace']: 'necklace',
    ['Hair']: 'hair', ['HairAccessory']: 'hair-acc', ['HeadAccessory']: 'head-acc',
    ['Cape']: 'cape',
    ['Held']: 'held', ['Furniture']: 'shelf', ['Prop']: 'cup'
  };

  items: { [type: string]: Array<IItem> } = {};
  itemMap: { [guid: string]: IItem } = {};
  nonItems: { [id: number]: IItem } = {};

  selection = signal<ItemSelection>({});
  selectionMap = signal<{ [guid: string]: IItem }>({});
  typeFolded = signal<{ [type: string]: boolean }>({});
  sectionFolded = signal<boolean[]>([]);

  searchText = signal<string>('');
  searchResults = signal<{ [guid: string]: IItem } | undefined>(undefined);
  private _lastSearchText = '';

  ngOnInit(): void {
    const storedSize = localStorage.getItem('closet.item-size') as ItemSize;
    if (storedSize) {
      this.itemSize.set(storedSize);
      this.itemSizePx.set(storedSize === 'small' ? 32 : 64);
    }
    this.initializeItems();
    this.restoreFromInput();
  }

  private restoreFromInput(): void {
    const sel = this.selectionInput();
    if (Object.keys(sel).length) {
      this.selection.set({ ...sel });
      const map = Object.values(sel).reduce((m, item) => {
        if (item) { m[item.guid] = item; }
        return m;
      }, {} as { [guid: string]: IItem });
      this.selectionMap.set(map);
    }
  }

  search(value: string): void {
    if (value === this._lastSearchText) { return; }
    this._lastSearchText = value;
    this.searchText.set(value);

    if (!value || value.length < 3) {
      this.searchResults.set(undefined);
      return;
    }

    const items = this._searchService.searchItems(value, { limit: 500, hasIcon: true });
    const map = items.reduce((m, item) => (m[item.data.guid] = item.data, m), {} as { [guid: string]: IItem });
    this.searchResults.set(map);
  }

  selectItem(item?: IItem): void {
    if (!item) { return; }
    let type = item.type;
    if (type === ItemType.Held || type === ItemType.Furniture) { type = ItemType.Prop; }
    if (type === ItemType.OutfitShoes) { type = ItemType.Outfit; }

    const sel = { ...this.selection() };

    if (sel[type] === item) {
      // Deselect
      delete sel[type];
    } else {
      sel[type] = item;
    }

    const map = Object.values(sel).reduce((m, it) => {
      if (it) { m[it.guid] = it; }
      return m;
    }, {} as { [guid: string]: IItem });

    this.selection.set(sel);
    this.selectionMap.set(map);
    this.selectionChange.emit(sel);
    this.updateUrl(sel);
  }

  removeItem(item: IItem, type: ItemType, event?: Event): void {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    const sel = { ...this.selection() };
    delete sel[type];
    const map = { ...this.selectionMap() };
    delete map[item.guid];
    this.selection.set(sel);
    this.selectionMap.set(map);
    this.selectionChange.emit(sel);
    this.updateUrl(sel);
  }

  gotoType(type: ItemType): void {
    this.foldType(type, false);
    if (type === ItemType.Prop) {
      const tf = this.typeFolded();
      if (tf[ItemType.Held]) { this.foldType(ItemType.Held, false); }
      type = ItemType.Held;
    }
    if (type === ItemType.OutfitShoes) {
      const tf = this.typeFolded();
      if (tf[ItemType.Outfit]) { this.foldType(ItemType.Outfit, false); }
      type = ItemType.Outfit;
    }
    setTimeout(() => {
      const el = this._elementRef.nativeElement.querySelector(`.closet-items[data-type="${type}"]`);
      const elSelection = this._elementRef.nativeElement.querySelector('.selection-sticky');
      if (!el) { return; }
      const bound = el.getBoundingClientRect();
      document.documentElement.scrollTop = bound.top + document.documentElement.scrollTop - (elSelection?.clientHeight ?? 0) - 4;
      const elGrid = this._elementRef.nativeElement.querySelector('.closet-grid');
      if (!elGrid) { return; }
      const boundGrid = elGrid.getBoundingClientRect();
      elGrid.scrollLeft = bound.left + elGrid.scrollLeft - boundGrid.left;
    });
  }

  foldType(type: ItemType, fold?: boolean): void {
    const tf = { ...this.typeFolded() };
    const hide = fold ?? !tf[type];
    if (!!hide === !!tf[type]) { return; }
    if (hide) { tf[type] = true; } else { delete tf[type]; }
    this.typeFolded.set(tf);

    const sf = [...this.sectionFolded()];
    const iSection = this.sections.findIndex(s => s.includes(type));
    if (iSection >= 0) {
      sf[iSection] = this.sections[iSection].every(t => tf[t]);
      this.sectionFolded.set(sf);
    }
  }

  toggleItemSize(): void {
    const newSize: ItemSize = this.itemSize() === 'small' ? 'default' : 'small';
    this.itemSize.set(newSize);
    this.itemSizePx.set(newSize === 'small' ? 32 : 64);
    localStorage.setItem('closet.item-size', newSize);
  }

  reset(): void {
    if (!confirm('Are you sure you want to reset your selection?')) { return; }
    this._reset();
  }

  _reset(): void {
    this.selection.set({});
    this.selectionMap.set({});
    this.selectionChange.emit({});
    this.updateUrl({});
  }

  private updateUrl(sel: ItemSelection): void {
    const url = new URL(window.location.href);
    for (const p of Object.values(this.requiredParams)) { url.searchParams.delete(p); }
    for (const p of Object.values(this.optionalParams)) { url.searchParams.delete(p); }
    for (const type of Object.keys(sel)) {
      const item = sel[type as ItemType];
      const q = this.requiredParams[type as ItemType] ?? this.optionalParams[type as ItemType];
      if (!item || !q) { continue; }
      url.searchParams.set(q, `${item.id}`);
    }
    history.replaceState(history.state, '', url.pathname + url.search);
  }

  private initializeItems(): void {
    const itemTypeUnequip: { [key: string]: number } = [
      ItemType.Necklace, ItemType.HeadAccessory, ItemType.FaceAccessory,
      ItemType.Held, ItemType.Shoes, ItemType.FaceAccessory
    ].reduce((map, type, i) => (map[`${type}`] = 46655 - i, map), {} as { [key: string]: number });

    this.items = {};
    for (const type of this.itemTypes) {
      this.items[type as string] = [];
      const unequipId = itemTypeUnequip[type];
      if (unequipId) {
        const item: IItem = {
          id: unequipId, guid: type.substring(0, 10).padStart(10, '_'),
          name: 'None', icon: 'assets/icons/none.webp', type: type,
          unlocked: true, order: -1
        };
        this.items[type as string].push(item);
        this.itemMap[item.guid] = item;
        this.nonItems[item.id!] = item;
      }
    }
    for (const item of this._dataService.itemConfig.items) {
      const type = item.type;
      if (!this.items[type as string]) { continue; }
      this.items[type as string].push(item);
      this.itemMap[item.guid] = item;
    }
    for (const type of this.itemTypes) {
      ItemHelper.sortItems(this.items[type as string]);
    }
  }

  /** Called by parent to load selection from URL params */
  initSelectionFromUrl(
    nonItems: { [id: number]: IItem }
  ): ItemSelection {
    const sel: ItemSelection = {};
    const map: { [guid: string]: IItem } = {};
    const url = new URL(window.location.href);
    const allParams = { ...this.requiredParams, ...this.optionalParams };
    for (const type of Object.keys(allParams)) {
      const q = allParams[type as ItemType]!;
      const id = +url.searchParams.get(q)! || 0;
      if (!id) { continue; }
      let item = this._dataService.itemIdMap.get(id);
      item = item ?? nonItems[id];
      if (!item) { continue; }
      sel[type as ItemType] = item;
      map[item.guid] = item;
    }
    this.selection.set(sel);
    this.selectionMap.set(map);
    return sel;
  }
}
