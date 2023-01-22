import { Component, Input } from '@angular/core';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less']
})
export class ItemComponent {
  @Input() item!: IItem;
  @Input() highlight?: boolean;

  ItemType = ItemType;

  constructor() {

  }
}
