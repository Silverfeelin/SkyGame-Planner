import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-ag-unlocked-renderer',
  standalone: true,
  imports: [],
  template: `<span class="ag-unlocked-pill" [class.is-unlocked]="value">{{ value ? 'Yes' : 'No' }}</span>`,
  styleUrls: ['./ag-unlocked-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgUnlockedRendererComponent implements ICellRendererAngularComp {
  value = false;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.value = !!params.value;
    return true;
  }
}
