import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IItem } from 'skygame-data';
import { IconComponent } from '@app/components/icon/icon.component';

@Component({
  selector: 'app-ag-item-icon-renderer',
  templateUrl: './ag-item-icon-renderer.component.html',
  styleUrl: './ag-item-icon-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent]
})
export class AgItemIconRendererComponent implements ICellRendererAngularComp {
  item?: IItem;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.item = params.value as IItem;
    return true;
  }
}
