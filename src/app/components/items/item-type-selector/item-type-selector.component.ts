import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ItemType } from 'src/app/interfaces/item.interface';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-item-type-selector',
    templateUrl: './item-type-selector.component.html',
    styleUrls: ['./item-type-selector.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgbTooltip, MatIcon]
})
export class ItemTypeSelectorComponent implements OnInit, OnChanges {
  @Input() type?: ItemType;
  @Input() showTypes?: Array<ItemType>;
  @Input() allowDeselect = false;

  @Output() readonly typeChanged = new EventEmitter<ItemType>();

  _showTypes: { [key: string]: boolean } = {};

  ngOnInit(): void {
    !this.showTypes && this.setTypes(undefined);
  }

  ngOnChanges(changes: SimpleChanges): void {
    changes['showTypes'] && this.setTypes(changes['showTypes'].currentValue);  }

  changeType(type: string): void {
    const itemType = type as ItemType;
    if (!this.allowDeselect && this.type === itemType) { return; }
    this.typeChanged.emit(itemType);
  }

  private setTypes(types?: Array<string>): void {
    types ??= ['Outfit', 'Shoes', 'Mask', 'FaceAccessory', 'Necklace', 'Hair', 'HairAccessory', 'HeadAccessory', 'Cape', 'Held', 'Furniture', 'Prop', 'Emote', 'Stance', 'Call', 'Music'];
    this._showTypes = {};
    for (const type of types) { this._showTypes[type] = true; }
  }
}
