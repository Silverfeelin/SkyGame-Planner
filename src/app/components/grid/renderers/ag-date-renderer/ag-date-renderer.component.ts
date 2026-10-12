import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { DateComponent } from "../../../util/date/date.component";

@Component({
  selector: 'app-ag-date-renderer',
  standalone: true,
  imports: [DateComponent],
  templateUrl: './ag-date-renderer.component.html',
  styleUrl: './ag-date-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgDateRendererComponent implements ICellRendererAngularComp {
  value?: string;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.value = params.value;
    return false;
  }
}
