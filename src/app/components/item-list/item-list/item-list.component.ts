import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { IItemList } from 'src/app/interfaces/item-list.interface';
import { ItemListNodeClickEvent, ItemListNodeComponent } from '../item-list-node/item-list-node.component';

@Component({
    selector: 'app-item-list',
    templateUrl: './item-list.component.html',
    styleUrl: './item-list.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ItemListNodeComponent]
})
export class ItemListComponent {
  @Input() itemList!: IItemList;
  @Input() highlightNode?: string;
  @Input() opaqueNodes?: boolean;
  @Input() nodeOverlayTemplate?: TemplateRef<unknown>;

  @Output() readonly beforeNodeToggle = new EventEmitter<ItemListNodeClickEvent>();

  onBeforeNodeToggle(event: ItemListNodeClickEvent): void {
    this.beforeNodeToggle.emit(event);
  }
}
