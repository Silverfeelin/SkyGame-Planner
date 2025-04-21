import { Component, HostListener, inject } from '@angular/core';
import { nanoid } from 'nanoid';
import { IItem, ItemSubtype, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from "../../../components/layout/card/card.component";
import { ItemTypePipe } from "../../../pipes/item-type.pipe";
import { JsonPipe } from '@angular/common';
import { OverlayComponent } from "../../../components/layout/overlay/overlay.component";

@Component({
  selector: 'app-editor-item',
  templateUrl: './editor-item.component.html',
  styleUrls: ['./editor-item.component.less'],
  imports: [ReactiveFormsModule, CardComponent, ItemTypePipe, JsonPipe, OverlayComponent]
})
export class EditorItemComponent {

  name: string = '';
  type: string = '';
  icon: string = '';

  typeEmote = ItemType.Emote;
  typeOptions = ['', ...Object.values(ItemType)];
  subtypeOptions = ['', ...Object.values(ItemSubtype)];
  groupOptions = ['', 'Elder', 'SeasonPass', 'Ultimate', 'Limited'];

  form = new FormGroup({
    name: new FormControl(''),
    type: new FormControl<ItemType|''>(''),
    subtype: new FormControl<ItemSubtype|''>(''),
    group: new FormControl(''),
    icon: new FormControl(''),
    previewUrl: new FormControl(''),
    dyes: new FormControl('0'),
    levels: new FormControl('1'),
  });

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    event.preventDefault();
  }

  private readonly _dataService = inject(DataService);

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
