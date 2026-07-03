import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { ItemHelper } from '@app/helpers/item-helper';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ItemClickEvent } from '@app/components/items/items.component';

@Component({
  selector: 'app-atmos-item-unlock-calculator-favourites',
  templateUrl: './atmos-item-unlock-calculator-favourites.component.html',
  styleUrl: './atmos-item-unlock-calculator-sub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, MatIcon, ItemIconComponent]
})
export class AtmosItemUnlockCalculatorFavouritesComponent {
  readonly itemClicked = output<ItemClickEvent>();
  readonly itemsClicked = output<Array<ItemClickEvent>>();

  readonly items: ReadonlyArray<IItem>;

  constructor() {
    const dataService = inject(DataService);
    const storageService = inject(StorageService);
    const favourites = [...storageService.getFavourites()];
    const items = favourites
      .map(f => dataService.guidMap.get(f) as IItem)
      .filter((i: IItem) => !!i && !i.unlocked);
    ItemHelper.sortItems(items);
    this.items = items;
  }

  onItemSelected(event: MouseEvent, item: IItem): void {
    this.itemClicked.emit({ event, item });
  }

  addAll(event: MouseEvent): void {
    const events = this.items.map(item => ({ event, item }));
    this.itemsClicked.emit(events);
  }
}
