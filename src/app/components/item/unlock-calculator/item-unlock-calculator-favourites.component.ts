import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { ItemHelper } from '@app/helpers/item-helper';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { ItemClickEvent } from '@app/components/item/grid/item-grid-layout.component';
import { FoldableCardComponent } from '@app/components/shared/foldable-card/foldable-card.component';
import { SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';

@Component({
  selector: 'app-item-unlock-calculator-favourites',
  templateUrl: './item-unlock-calculator-favourites.component.html',
  styleUrl: './item-unlock-calculator-sub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, MatIcon, ItemIconComponent, FoldableCardComponent]
})
export class ItemUnlockCalculatorFavouritesComponent {
  readonly SUBICONS_ALL = SUBICONS_ALL;
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
