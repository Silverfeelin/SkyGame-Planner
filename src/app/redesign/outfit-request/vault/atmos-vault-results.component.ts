import {
  ChangeDetectionStrategy, Component, inject, input, output, signal
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { DataService } from '@app/services/data.service';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { IItem, ItemType } from 'skygame-data';
import { IApiOutfit, IApiOutfits } from './vault-api.service';
import { ItemSelection } from './atmos-vault-item-picker.component';

type Selection<T> = { [key in ItemType]?: T };

export interface IVaultResult {
  data: IApiOutfit;
  date?: DateTime;
  items: Selection<IItem>;
  canDelete?: boolean;
}

@Component({
  selector: 'atmos-vault-results',
  templateUrl: './atmos-vault-results.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent, ItemTypePipe]
})
export class AtmosVaultResultsComponent {
  private readonly _dataService = inject(DataService);

  readonly apiData = input<IApiOutfits | undefined>(undefined);
  readonly currentSelection = input<ItemSelection>({});
  readonly deleteResult = output<IVaultResult>();
  readonly reportResult = output<IVaultResult>();

  readonly paramTypes: { [key: string]: ItemType } = {
    outfitId: ItemType.Outfit, maskId: ItemType.Mask, hairId: ItemType.Hair, capeId: ItemType.Cape,
    shoesId: ItemType.Shoes, faceAccessoryId: ItemType.FaceAccessory, necklaceId: ItemType.Necklace,
    hairAccessoryId: ItemType.HairAccessory, headAccessoryId: ItemType.HeadAccessory, propId: ItemType.Prop
  };

  readonly sizes = ['Unknown size', 'Chibi', 'Tiny spell', 'Below average', 'Average', 'Above average', 'Tall', 'Huge spell'];
  readonly lightings = ['Unknown lighting', 'Day', 'Sunset', 'Night', 'Forest'];

  readonly selectionTypes: Array<ItemType> = [
    ItemType.Outfit, ItemType.Mask, ItemType.Hair, ItemType.Cape,
    ItemType.Shoes, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Prop
  ];

  readonly itemIcons: { [key: string]: string } = {
    ['Outfit']: 'outfit', ['Shoes']: 'shoes', ['OutfitShoes']: 'outfit-shoes',
    ['Mask']: 'mask', ['FaceAccessory']: 'face-acc', ['Necklace']: 'necklace',
    ['Hair']: 'hair', ['HairAccessory']: 'hair-acc', ['HeadAccessory']: 'head-acc',
    ['Cape']: 'cape', ['Held']: 'held', ['Furniture']: 'shelf', ['Prop']: 'cup'
  };

  nonItems: { [id: number]: IItem } = {};

  private readonly _linkRegex = /^https:\/\/discord\.com\/(channels\/575762611111592007\/\d{1,32}\/\d{1,32})$/;
  readonly isWindows = navigator.platform?.toLowerCase().includes('win') || navigator.userAgent?.includes('Windows');

  get results(): IVaultResult[] {
    const data = this.apiData();
    if (!data?.items) { return []; }
    return data.items.map(resItem => {
      const items = Object.keys(resItem).reduce((map, key) => {
        const type = this.paramTypes[key];
        if (!type) { return map; }
        const id = resItem[key as keyof IApiOutfit] as number;
        if (!id) { return map; }
        let item = this._dataService.itemIdMap.get(id);
        item = item ?? this.nonItems[id];
        if (!item) { return map; }
        map[type] = item;
        return map;
      }, {} as Selection<IItem>);

      if (this.isWindows) {
        const match = this._linkRegex.exec(resItem.link);
        resItem.protocolLink = match ? `discord://-/${match[1]}` : '';
      }

      return {
        data: resItem,
        date: resItem.date ? DateTime.fromISO(resItem.date) : undefined,
        items,
        canDelete: resItem.canDelete
      } as IVaultResult;
    });
  }

  copyLink(result: IVaultResult): void {
    const link = result.data.link;
    if (!link) { return; }
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied!');
    }).catch(e => {
      console.error(e);
      alert('Copying link failed.');
    });
  }

  onDelete(result: IVaultResult): void {
    this.deleteResult.emit(result);
  }

  onReport(result: IVaultResult): void {
    this.reportResult.emit(result);
  }
}
