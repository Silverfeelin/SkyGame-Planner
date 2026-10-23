import { ChangeDetectionStrategy, Component, TemplateRef, input } from '@angular/core';
import { IShop } from 'skygame-data';
import { ItemListComponent } from '@app/components/item/item-list/item-list.component';

/** Item-list shops grouped per shop, each in its own titled card. */
@Component({
  selector: 'app-shop-item-lists',
  templateUrl: './shop-item-lists.component.html',
  styleUrl: './shop-item-lists.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemListComponent]
})
export class ShopItemListsComponent {
  readonly shops = input.required<ReadonlyArray<IShop>>();
  readonly highlightNode = input<string | undefined>(undefined);
  readonly opaqueNodes = input<boolean>(false);
  readonly nodeOverlayTemplate = input<TemplateRef<unknown> | undefined>(undefined);
}
