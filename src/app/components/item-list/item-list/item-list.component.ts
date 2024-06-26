import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { IItemList } from 'src/app/interfaces/item-list.interface';
import { ItemListNodeComponent } from '../item-list-node/item-list-node.component';

@Component({
    selector: 'app-item-list',
    templateUrl: './item-list.component.html',
    styleUrl: './item-list.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ItemListNodeComponent]
})
export class ItemListComponent {
  @Input() itemList!: IItemList;
  @Input() highlightNode?: string;
  @Input() opaqueNodes?: boolean;
  @Input() nodeOverlayTemplate?: TemplateRef<unknown>;
}
