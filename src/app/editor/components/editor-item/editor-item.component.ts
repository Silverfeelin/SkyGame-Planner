import { Component } from '@angular/core';
import { nanoid } from 'nanoid';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';

@Component({
  selector: 'app-editor-item',
  templateUrl: './editor-item.component.html',
  styleUrls: ['./editor-item.component.less']
})
export class EditorItemComponent {
  name: string = '';
  type: string = '';
  icon: string = '';

  typeOptions = [
    '',
    'Hat',
    'Hair',
    'Mask',
    'Necklace',
    'Outfit',
    'Cape',
    'Instrument',
    'Held',
    'Prop',
    'Emote',
    'Stance',
    'Call',
    'Spell',
    'Music',
    'Quest',
    'WingBuff',
    'Special'
  ];

  generate(): void {
    let icon = this.icon;
    const iRevision = icon.indexOf('/revision');
    if (iRevision >= 0) { icon = icon.substring(0, iRevision); }

    const item: IItem = {
      guid: nanoid(10),
      name: this.name,
      type: this.type as ItemType,
      icon
    }

    let json = JSON.stringify(item, null, 2);
    navigator.clipboard.writeText(json + ',');
  }
}
