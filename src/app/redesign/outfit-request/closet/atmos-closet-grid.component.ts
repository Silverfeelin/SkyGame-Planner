import { ChangeDetectionStrategy, Component, inject, output, input, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ClosetStateService } from './closet-state.service';
import { IItem, ItemType } from 'skygame-data';

@Component({
  selector: 'atmos-closet-grid',
  templateUrl: './atmos-closet-grid.component.html',
  styleUrl: './atmos-closet-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass, MatIcon, ItemIconComponent]
})
export class AtmosClosetGridComponent {
  readonly state = inject(ClosetStateService);

  readonly requesting = input(false);
  readonly itemToggled = output<IItem>();
  readonly dyeClicked = output<{ item: IItem; event: MouseEvent }>();

  readonly itemTypes: ItemType[] = [
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
    ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop
  ];

  readonly itemIcons: Record<string, string> = {
    'Outfit': 'outfit', 'Shoes': 'shoes', 'OutfitShoes': 'outfit-shoes',
    'Mask': 'mask', 'FaceAccessory': 'face-acc', 'Necklace': 'necklace',
    'Hair': 'hair', 'HairAccessory': 'hair-acc', 'HeadAccessory': 'head-acc',
    'Cape': 'cape', 'Held': 'held', 'Furniture': 'shelf', 'Prop': 'cup'
  };

  readonly gridSections: ItemType[][] = [
    [ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes],
    [ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace],
    [ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory],
    [ItemType.Cape],
    [ItemType.Held, ItemType.Furniture, ItemType.Prop]
  ];

  toggleSection(type: ItemType): void {
    this.state.typeFolded.update(map => {
      const next = { ...map };
      next[type] ? delete next[type] : (next[type] = true);
      return next;
    });
  }

  scrollToType(type: ItemType): void {
    const el = document.querySelector(`.atmos-closet-items[data-type="${type}"]`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  isItemHidden(item: IItem): boolean {
    const state = this.state;
    const req = this.requesting();
    if (req) { return false; }
    const modifying = state.modifyingCloset();
    if (modifying) { return false; }
    const folded = state.typeFolded()[item.type];
    if (folded) { return true; }
    if (state.hideUnselected() && !state.selectedAll()[item.guid]) { return true; }
    if (state.closetMode() === 'closet' && state.hidden()[item.guid]
        && !state.selectedAll()[item.guid]
        && !(state.showOngoing() && state.ongoingItems()[item.guid])) {
      return true;
    }
    return false;
  }

  isItemFaded(item: IItem): boolean {
    if (this.state.hidden()[item.guid]) { return true; }
    if (!this.requesting() && this.state.modifyingCloset()) { return false; }
    if (this.state.hideIap() && item.iaps?.length) { return true; }
    const avail = this.state.available();
    if (avail && !avail[item.guid]) { return true; }
    return false;
  }

  getItemsForType(type: ItemType): IItem[] {
    return this.state.items()[type as string] ?? [];
  }
}
