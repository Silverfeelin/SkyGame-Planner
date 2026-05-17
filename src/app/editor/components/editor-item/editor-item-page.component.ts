import { Component, ChangeDetectionStrategy, output, input, effect, inject } from '@angular/core';
import { nanoid } from 'nanoid';
import { EditorItemComponent } from './editor-item.component';
import { DataService } from '@app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from "../../../components/layout/card/card.component";
import { IItem, ItemType } from 'skygame-data';

@Component({
  selector: 'app-editor-item-page',
  templateUrl: './editor-item-page.component.html',
  styleUrl: './editor-item-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditorItemComponent, CardComponent],
})
export class EditorItemPageComponent {
  item?: IItem;

  _dataService = inject(DataService);
  _route = inject(ActivatedRoute);

  constructor() {
    const guid = this._route.snapshot.paramMap.get('guid');
    if (guid === '0') {
      this.item = {
        id: 0,
        guid: nanoid(10),
        type: ItemType.Mask,
        name: ''
      };
    } else {
      this.item = guid ? this._dataService.guidMap.get(guid) as IItem : undefined;
    }

    if (!this.item) {
      alert('Invalid URL; item not found.');
      return;
    }
  }

  navigateBack(): void {
    history.back();
  }

  save(evt: IItem) {
    evt.id = this.item?.id;
    const json = JSON.stringify(evt, undefined, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Item_${evt.guid}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
