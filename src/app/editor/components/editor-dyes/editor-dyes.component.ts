import { Component } from '@angular/core';
import { ItemHelper } from '@app/helpers/item-helper';
import { IItem } from '@app/interfaces/item.interface';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-editor-dyes',
  standalone: true,
  imports: [],
  templateUrl: './editor-dyes.component.html',
  styleUrl: './editor-dyes.component.scss'
})
export class EditorDyesComponent {
  items!: Array<IItem>;

  constructor(
    private readonly _dataService: DataService
  ) {
    this.items = [...this._dataService.itemConfig.items.filter(i => i.dye)];
    ItemHelper.sortItems(this.items);
  }
}
