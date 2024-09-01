import { Pipe, PipeTransform } from '@angular/core';
import { ItemType } from '../interfaces/item.interface';

@Pipe({
    name: 'itemType',
    standalone: true
})
export class ItemTypePipe implements PipeTransform {
  transform(type: ItemType | string, plural?: boolean): string {
    switch (type) {
      case ItemType.Hat: return plural ? 'Hats' : 'Hat';
      case ItemType.Hair: return 'Hair';
      case ItemType.Mask: return plural ? 'Masks' : 'Mask';
      case ItemType.FaceAccessory: return plural ? 'Face accessories' : 'Face accessory';
      case ItemType.Necklace: return plural ? 'Necklaces' : 'Necklace';
      case ItemType.Outfit: return plural ? 'Outfits' : 'Outfit';
      case ItemType.Shoes: return 'Shoes';
      case ItemType.Cape: return plural ? 'Capes' : 'Cape';
      case ItemType.Held: return plural ? 'Held props' : 'Held prop';
      case ItemType.Furniture: return 'Furniture';
      case ItemType.Prop: return plural ? 'Placeable props' : 'Placeable prop';
      case ItemType.Emote: return plural ? 'Emotes' : 'Emote';
      case ItemType.Stance: return plural ? 'Stances' : 'Stance';
      case ItemType.Call: return plural ? 'Calls' : 'Call';
      case ItemType.Spell: return plural ? 'Spells' : 'Spell';
      case ItemType.Music: return plural ? 'Music sheets' : 'Music sheet';
      case ItemType.Quest: return plural ? 'Quests' : 'Quest';
      case ItemType.WingBuff: return plural ? 'Wing buffs' : 'Wing buff';
      case ItemType.Special: return 'Special';
      default: return 'Unknown';
    }
  }
}
