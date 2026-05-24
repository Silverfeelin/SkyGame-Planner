import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IArea } from 'skygame-data';

@Component({
  selector: 'ag-atmos-area-link-renderer',
  template: `
    @if (area?.guid) {
      <a class="atmos-text-link" [routerLink]="['/area', area!.guid]">{{ area!.name }}</a>
    } @else {
      <span>{{ area?.name }}</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class AgAtmosAreaLinkRendererComponent implements ICellRendererAngularComp {
  area?: IArea;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.area = params.value as IArea;
    return true;
  }
}
