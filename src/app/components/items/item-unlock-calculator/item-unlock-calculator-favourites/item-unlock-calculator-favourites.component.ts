import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { CardComponent, CardFoldEvent } from "../../../layout/card/card.component";
import { IItem } from 'skygame-data';
import { StorageService } from '@app/services/storage.service';
import { ItemClickEvent } from '../../items.component';
import { ItemIconComponent } from "../../item-icon/item-icon.component";
import { ItemHelper } from '@app/helpers/item-helper';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-item-unlock-calculator-favourites',
    imports: [CardComponent, ItemIconComponent, NgbTooltip],
    templateUrl: './item-unlock-calculator-favourites.component.html',
    styleUrl: './item-unlock-calculator-favourites.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemUnlockCalculatorFavouritesComponent {
  @Output() readonly itemClicked = new EventEmitter<ItemClickEvent>();
  @Output() readonly itemsClicked = new EventEmitter<Array<ItemClickEvent>>();
  @Output() readonly closed = new EventEmitter<void>();

  items: Array<IItem>;

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService,
  ) {
    const favourites = [..._storageService.getFavourites()];
    this.items = favourites
      .map(f => _dataService.guidMap.get(f) as IItem)
      .filter((i: IItem) => !!i && !i.unlocked);

    ItemHelper.sortItems(this.items);
  }

  onBeforeFold(evt: CardFoldEvent): void {
    if (!evt.fold) { return; }
    this.closed.emit();
  }

  onItemSelected(event: MouseEvent, item: IItem) {
    this.itemClicked.emit({ event, item });
  }

  addAll(event: MouseEvent) {
    const events = this.items.map(item => ({ event, item }));
    this.itemsClicked.emit(events);
  }
}
