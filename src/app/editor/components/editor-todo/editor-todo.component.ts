import { Component } from '@angular/core';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { CardComponent } from '@app/components/layout/card/card.component';
import { ItemHelper } from '@app/helpers/item-helper';
import { DataService } from '@app/services/data.service';
import { IItem, ISpirit, ItemType } from 'skygame-data';

@Component({
    selector: 'app-editor-todo',
    templateUrl: './editor-todo.component.html',
    styleUrl: './editor-todo.component.scss',
    imports: [ItemIconComponent, CardComponent]
})
export class EditorTodoComponent {
  itemsWithoutPreview: Array<IItem> = [];
  itemsWithoutWiki: Array<IItem> = [];
  spiritsWithoutPreview: Array<ISpirit> = [];
  spiritsWithoutWiki: Array<ISpirit> = [];

  constructor(
    private readonly _dataService: DataService
  ) {
    const items = _dataService.itemConfig.items;
    const spirits = _dataService.spiritConfig.items;

    const previewItemTypes = new Set<ItemType>([
      ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes, ItemType.Mask, ItemType.FaceAccessory,
      ItemType.Necklace, ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Cape,
      ItemType.Held, ItemType.Furniture, ItemType.Prop
    ]);

    items.forEach(i => {
      if (previewItemTypes.has(i.type)) {
        if (!i.previewUrl) { this.itemsWithoutPreview.push(i); }
        if (!i._wiki?.href) { this.itemsWithoutWiki.push(i); }
      }
    });

    ItemHelper.sortItems(this.itemsWithoutPreview);
    ItemHelper.sortItems(this.itemsWithoutWiki);

    spirits.forEach(s => {
      if (!s.imageUrl) { this.spiritsWithoutPreview.push(s); }
      if (!s._wiki?.href) { this.spiritsWithoutWiki.push(s); }
    });
  }

  copy(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
