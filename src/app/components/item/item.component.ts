import { Component, Input } from '@angular/core';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DebugService } from 'src/app/services/debug.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less']
})
export class ItemComponent {
  @Input() item!: IItem;
  @Input() highlight?: boolean;

  ItemType = ItemType;

  constructor(
    private readonly _debug: DebugService
  ) {

  }

  iconClick(event: MouseEvent): void {
    if (!this._debug.copyItem) { return; }
    event.stopImmediatePropagation();
    event.preventDefault();
    navigator.clipboard.writeText(this.item.guid);
  }
}
