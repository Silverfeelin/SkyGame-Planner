import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-ag-image-renderer',
  standalone: true,
  imports: [],
  templateUrl: './ag-image-renderer.component.html',
  styleUrls: ['./ag-image-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgImageRendererComponent implements ICellRendererAngularComp {
  value?: string;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.value = params.value;
    return false;
  }
}
