import { Component } from '@angular/core';
import { nanoid } from 'nanoid';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-editor-item',
    templateUrl: './editor-item.component.html',
    styleUrls: ['./editor-item.component.less'],
    standalone: true,
    imports: [FormsModule, NgFor]
})
export class EditorItemComponent {
  name: string = '';
  type: string = '';
  icon: string = '';

  typeOptions = [
    '',,
    'Hair',
    'HairAccessory',
    'HeadAccessory',
    'Mask',
    'FaceAccessory',
    'Necklace',
    'Outfit',
    'Shoes',
    'Cape',
    'Held',
    'Furniture',
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

  constructor(
    private readonly _dataService: DataService
  ) {

  }

  generate(): void {
    let icon = this.icon;
    const iRevision = icon.indexOf('/revision');
    if (iRevision >= 0) { icon = icon.substring(0, iRevision); }

    const lastId = this._dataService.itemConfig.items.reduce((prev, curr) => {
      return prev.id! > curr.id! ? prev : curr;
    }).id;

    const item: IItem = {
      id: lastId! + 1,
      guid: nanoid(10),
      name: this.name,
      type: this.type as ItemType,
      icon
    }

    let json = JSON.stringify(item, null, 2);
    navigator.clipboard.writeText(json + ',');
  }
}
