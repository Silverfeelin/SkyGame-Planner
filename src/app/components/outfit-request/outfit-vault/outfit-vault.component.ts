import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import dayjs from 'dayjs';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';

interface IApiOutfits {
  items: Array<IApiOutfit>
};

interface IApiOutfit {
  id?: number;
  link: string;
  date?: string;
  protocolLink?: string;
  outfitId: number;
  maskId: number;
  hairId: number;
  capeId: number;
  shoesId?: number;
  faceAccessoryId?: number;
  necklaceId?: number;
  hatId?: number;
  propId?: number;
  key?: string;
};

interface IResult {
  data: IApiOutfit;
  date?: dayjs.Dayjs;
  items: Selection<IItem>;
}

type Selection<T> = { [key in ItemType]?: T; }
type ShowMode = 'list' | 'result' | 'submit';


@Component({
  selector: 'app-outfit-vault',
  templateUrl: './outfit-vault.component.html',
  styleUrls: ['./outfit-vault.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutfitVaultComponent {
  columns = 6;

  requiredParams: { [key in ItemType]?: string } = { [ItemType.Outfit]: 'o', [ItemType.Mask]: 'm', [ItemType.Hair]: 'h', [ItemType.Cape]: 'c' };
  optionalParams: { [key in ItemType]?: string } = { [ItemType.Shoes]: 's', [ItemType.FaceAccessory]: 'f', [ItemType.Necklace]: 'n', [ItemType.Hat]: 't', [ItemType.Prop]: 'p' };
  paramTypes: { [key: string]: ItemType } = { outfitId: ItemType.Outfit, maskId: ItemType.Mask, hairId: ItemType.Hair, capeId: ItemType.Cape, shoesId: ItemType.Shoes, faceAccessoryId: ItemType.FaceAccessory, necklaceId: ItemType.Necklace, hatId: ItemType.Hat, propId: ItemType.Prop };

  itemTypes: Array<ItemType> = [
    ItemType.Outfit, ItemType.Shoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.Hat,
    ItemType.Cape,
    ItemType.Held, ItemType.Prop
  ];
  selectionTypes = this.itemTypes.filter(type => type !== ItemType.Held);
  typeFolded: { [key: string]: boolean } = {};

  sections: Array<Array<ItemType>> = [
    [ItemType.Outfit, ItemType.Shoes],
    [ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace],
    [ItemType.Hair, ItemType.Hat],
    [ItemType.Cape],
    [ItemType.Held, ItemType.Prop]
  ];
  sectionFolded: Array<boolean> = [];

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
  items: { [type: string]: Array<IItem> } = {};
  itemMap: { [guid: string]: IItem } = {};
  nonItems: { [id: number]: IItem } = {}; // Items that should not be saved (unequip symbol).

  selection: { [key in ItemType]?: IItem; } = {};
  selectionMap: { [key: string]: IItem } = {};

  resultData?: IApiOutfits;
  results?: Array<IResult>;

  showMode: ShowMode = 'list';

  // Finding
  isFinding = false;

  // Submitting
  isSubmitting = false;
  submitUnderstood = false;
  sDiscordLink = '';
  pDiscordLink = '';
  sKey = localStorage.getItem('outfit-vault-key') ?? 'public';
  discordLinkValid = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _http: HttpClient
  ) {
    this.initializeItems();
    this.initializeSelection();
  }

  gotoType(type: ItemType): void {
    this.showMode = 'list';

    // Unfold section.
    this.foldType(type, false);
    if (type === ItemType.Prop) {
      this.typeFolded[ItemType.Held] && this.foldType(ItemType.Held, false);
      type = ItemType.Held;
    }

    setTimeout(() => {
      const el = this._elementRef.nativeElement.querySelector(`.closet-items[data-type="${type}"]`);
      const elSelection = this._elementRef.nativeElement.querySelector(`.selection-sticky`);
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
    const hide = fold ?? !this.typeFolded[type];
    if (!!hide === !!this.typeFolded[type]) { return; }
    hide ? (this.typeFolded[type] = true) : (delete this.typeFolded[type]);
    const iSection = this.sections.findIndex(s => s.includes(type));
    if (iSection >= 0) {
      this.sectionFolded[iSection] = this.sections[iSection].every(type => this.typeFolded[type]);
    }
  }

  selectItem(item: IItem, type: ItemType): void {
    if (type === ItemType.Held) { type = ItemType.Prop; }

    // Remove selection.
    if (this.selection[type] === item) {
      this.removeItem(item, type);
      this.updateUrl();
      return;
    }

    this.selection[type] = item;
    this.selectionMap = Object.values(this.selection).reduce((map, item) => (map[item.guid] = item, map), {} as { [key: string]: IItem });

    this.updateUrl();
    //this.foldType(type, true);
    //type === ItemType.Prop && this.foldType(ItemType.Held, true);

    // setTimeout(() => {
    //   const el = this._elementRef.nativeElement.querySelector(`.vault-selection`);
    //   el?.scrollIntoView({ behavior: 'smooth' });
    // });
  }

  removeItem(item: IItem, type: ItemType, event?: Event): void {
    delete this.selection[type];
    delete this.selectionMap[item.guid];

    event?.preventDefault();
    event?.stopImmediatePropagation();
  }

  findOutfits(): void {
    if (Object.keys(this.requiredParams).every(type => !this.selection[type as ItemType])) {
      alert('Please select at least an outfit, mask, hairstyle or cape.');
      return;
    }

    this.isFinding = true;
    const url = new URL('/api/outfit-vault', window.location.origin);
    for (const requiredType of Object.keys(this.requiredParams)) {
      const item = this.selection[requiredType as ItemType];
      if (!item || this.nonItems[item.id!]) { continue; }
      url.searchParams.set(this.requiredParams[requiredType as ItemType]!, `${item.id}`);
    }
    for (const optionalType of Object.keys(this.optionalParams)) {
      const item = this.selection[optionalType as ItemType];
      if (!item || this.nonItems[item.id!]) { continue; }
      url.searchParams.set(this.optionalParams[optionalType as ItemType]!, `${item.id}`);
    }

    // Search.
    this._http.get<IApiOutfits>(url.pathname + url.search, { responseType: 'json' }).subscribe({
      next: data => { this.onResult(data); },
      error: e => {
        console.error(e);
        alert('Failed to get outfits. Please try again later.');
      }
    }).add(() => {
      this.isFinding = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  onResult(result: IApiOutfits): void {
    const linkRegex = /^https:\/\/discord\.com\/(channels\/575762611111592007\/\d{1,32}\/\d{1,32})$/;
    this.resultData = result;
    this.results = result?.items?.map(resItem => {
      const items = Object.keys(resItem).reduce((map, key) => {
        const type = this.paramTypes[key];
        if (!type) { return map; }
        const id = resItem[key as keyof IApiOutfit]! as number;
        if (!id) { return map; }
        let item = this._dataService.itemIdMap.get(id);
        item ??= this.nonItems[id];
        if (!item) { return map; }
        map[type] = item;
        return map;
      }, {} as Selection<IItem>);

      const match = linkRegex.exec(resItem.link);
      resItem.protocolLink = match ? `discord://-/${match[1]}` : '';

      return {
        data: resItem,
        date: resItem.date ? dayjs(resItem.date) : undefined,
        items
      };
    }) || [];
    this.showMode = 'result';
    this._changeDetectorRef.markForCheck();
  }

  showSubmitOutfit(): void {
    this.showMode = 'submit';
  }

  showList(): void {
    this.showMode = 'list';
  }

  onSubmitUnderstood(): void {
    this.submitUnderstood = true;
  }

  onDiscordLinkChange(): void {
    const linkRegex = /^https:\/\/discord\.com\/(channels\/575762611111592007\/\d{1,32}\/\d{1,32})$/;
    const match = linkRegex.exec(this.sDiscordLink);
    this.discordLinkValid = !!match;
    this.pDiscordLink = match ? `discord://-/${match[1]}` : '';
  }

  submitOutfit(): void {
    if (this.isSubmitting) { return; }
    this.onDiscordLinkChange();
    if (!this.discordLinkValid) {
      alert('Please enter a valid Discord link. Only links to messages in the official Sky Discord are allowed.');
      return;
    }

    // Model
    const model: IApiOutfit = {
      link: this.sDiscordLink,
      outfitId: this.selection[ItemType.Outfit]?.id || 0,
      maskId: this.selection[ItemType.Mask]?.id || 0,
      hairId: this.selection[ItemType.Hair]?.id || 0,
      capeId: this.selection[ItemType.Cape]?.id || 0,
      shoesId: this.selection[ItemType.Shoes]?.id,
      faceAccessoryId: this.selection[ItemType.FaceAccessory]?.id,
      necklaceId: this.selection[ItemType.Necklace]?.id,
      hatId: this.selection[ItemType.Hat]?.id,
      propId: this.selection[ItemType.Prop]?.id,
      key: this.sKey || ''
    };

    // Remove empty selections.
    for (const key of Object.keys(model)) {
      const val = model[key as keyof IApiOutfit]!;
      if (typeof(val) === 'number' && this.nonItems[val]) {
        delete model[key as keyof IApiOutfit];
      }
    }

    if (!model.outfitId || !model.maskId || !model.hairId || !model.capeId) {
      alert('This outfit is incomplete. An outfit requires at least an outfit, mask, hairstyle and cape.');
      return;
    }

    // Save key for next time.
    localStorage.setItem('outfit-vault-key', this.sKey);

    this.isSubmitting = true;
    this._http.post('/api/outfit-vault', model, { responseType: 'json' }).subscribe({
      next: (e) => {
        console.log(e);
        this.sDiscordLink = '';
        this.pDiscordLink = '';
        this.discordLinkValid = false;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
          alert('Successfully submitted outfit! Thank you for the contribution.');
          this.showMode = 'list';
          this._changeDetectorRef.markForCheck();
        }, 50);
      },
      error: e => {
        alert(e.error || 'Something went wrong!');
        console.error(e);
      }
    }).add(() => {
      this.isSubmitting = false;
      this._changeDetectorRef.markForCheck();
    });
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
        this.itemMap[item.guid] = item;
        this.nonItems[item.id!]  = item;
      }
    }

    // Add items to closets.
    for (const item of this._dataService.itemConfig.items) {
      let type = item.type;
      if (!this.items[type as string]) { continue; }

      this.items[type as string].push(item);
      this.itemMap[item.guid] = item;
    }

    // Sort items by order.
    for (const type of this.itemTypes) {
      ItemHelper.sortItems(this.items[type as string]);
    }
  }

  private initializeSelection(): void {
    this.selection = {};
    this.selectionMap = {};

    const url = new URL(window.location.href);
    const load = (p: { [key in ItemType]?: string }) => {
      for (const type of Object.keys(p)) {
        const q = p[type as ItemType]!;
        const id = +url.searchParams.get(q)! || 0;
        if (!id) { continue; }
        let item = this._dataService.itemIdMap.get(id);
        item ??= this.nonItems[id];
        if (!item) { continue; }
        this.selection[type as ItemType] = item;
        this.selectionMap[item.guid] = item;
      }
    }

    load(this.requiredParams);
    load(this.optionalParams);
  }

  private updateUrl(): void {
    const url = new URL(window.location.href);

    // Clear previous selection.
    for (const p of Object.values(this.requiredParams)) { url.searchParams.delete(p); }
    for (const p of Object.values(this.optionalParams)) { url.searchParams.delete(p); }

    // Add selection.
    for (const type of Object.keys(this.selection)) {
      const item = this.selection[type as ItemType];
      const q = this.requiredParams[type as ItemType] ?? this.optionalParams[type as ItemType];

      // Skip wrong selections.
      if (!item || !q) { continue; }

      url.searchParams.set(q, `${item.id}`);
    }
    history.replaceState(history.state, '', url.pathname + url.search);
  }
}
