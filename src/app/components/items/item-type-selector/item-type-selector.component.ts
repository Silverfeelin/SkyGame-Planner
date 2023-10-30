import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ItemType } from 'src/app/interfaces/item.interface';

@Component({
  selector: 'app-item-type-selector',
  templateUrl: './item-type-selector.component.html',
  styleUrls: ['./item-type-selector.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemTypeSelectorComponent implements OnInit, OnChanges {
  @Input() type?: ItemType;
  @Input() showTypes?: Array<ItemType>;

  @Output() readonly typeChanged = new EventEmitter<ItemType>();

  _showTypes: { [key: string]: boolean } = {};

  ngOnInit(): void {
    !this.showTypes && this.setTypes(undefined);
  }

  ngOnChanges(changes: SimpleChanges): void {
    changes['showTypes'] && this.setTypes(changes['showTypes'].currentValue);  }

  changeType(type: string): void {
    const itemType = type as ItemType;
    if (this.type === itemType) { return; }
    this.typeChanged.emit(itemType);
  }

  private setTypes(types?: Array<string>): void {
    types ??= ['Outfit', 'Shoes', 'Mask', 'FaceAccessory', 'Necklace', 'Hair', 'Hat', 'Cape', 'Held', 'Prop', 'Emote', 'Stance', 'Call'];
    this._showTypes = {};
    for (const type of types) { this._showTypes[type] = true; }
  }
}
