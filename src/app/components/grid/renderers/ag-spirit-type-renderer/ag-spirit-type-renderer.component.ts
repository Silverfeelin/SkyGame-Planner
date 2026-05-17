import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SpiritType } from 'skygame-data';
import { SpiritTypeIconComponent } from '../../../spirit-type-icon/spirit-type-icon.component';

@Component({
  selector: 'app-ag-spirit-type-renderer',
  standalone: true,
  imports: [SpiritTypeIconComponent],
  template: `<app-spirit-type-icon [type]="value"></app-spirit-type-icon>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgSpiritTypeRendererComponent implements ICellRendererAngularComp {
  value?: SpiritType;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.value = params.value;
    return false;
  }
}
