import { Pipe, PipeTransform } from '@angular/core';
import { ItemType } from '../interfaces/item.interface';

@Pipe({
  name: 'itemType'
})
export class ItemTypePipe implements PipeTransform {
  transform(type: ItemType): string {
    switch (type) {
      case ItemType.Hat: return 'Hat';
      case ItemType.Hair: return 'Hair';
      case ItemType.Mask: return 'Mask';
      case ItemType.FaceAccessory: return 'Face accessory';
      case ItemType.Necklace: return 'Necklace';
      case ItemType.Outfit: return 'Outfit';
      case ItemType.Shoes: return 'Shoes';
      case ItemType.Cape: return 'Cape';
      case ItemType.Instrument: return 'Instrument';
      case ItemType.Held: return 'Held prop';
      case ItemType.Prop: return 'Placeable prop';
      case ItemType.Emote: return 'Emote';
      case ItemType.Stance: return 'Stance';
      case ItemType.Call: return 'Call';
      case ItemType.Spell: return 'Spell';
      case ItemType.Music: return 'Music sheet';
      case ItemType.Quest: return 'Quest';
      case ItemType.WingBuff: return 'Wing buff';
      case ItemType.Special: return 'Special';
      default: return 'Unknown';
    }
  }
}
