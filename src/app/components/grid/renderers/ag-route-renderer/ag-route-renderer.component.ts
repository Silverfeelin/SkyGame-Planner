import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-ag-route-renderer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ag-route-renderer.component.html',
  styleUrl: './ag-route-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgRouteRendererComponent implements ICellRendererAngularComp {
  label?: any;
  route?: any;
  queryParams?: any;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    const { label, route, queryParams } = params.value;
    this.label = label
    this.route = route;
    this.queryParams = queryParams;
    return false;
  }
}
