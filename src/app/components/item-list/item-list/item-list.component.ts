import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { ItemListNodeClickEvent, ItemListNodeComponent } from '../item-list-node/item-list-node.component';
import { IItemList } from 'skygame-data';

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
