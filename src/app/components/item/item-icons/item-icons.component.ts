import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IItem } from 'src/app/interfaces/item.interface';

@Component({
  selector: 'app-item-icons',
  templateUrl: './item-icons.component.html',
  styleUrls: ['./item-icons.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemIconsComponent {
  @Input() item?: IItem;
}
