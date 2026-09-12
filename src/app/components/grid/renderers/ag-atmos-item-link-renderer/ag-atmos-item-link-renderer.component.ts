import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IItem } from 'skygame-data';

@Component({
  selector: 'ag-atmos-item-link-renderer',
  template: `@if (item) { <a class="atmos-text-link" [routerLink]="['/item', item.guid]">{{ item.name }}</a> }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class AgAtmosItemLinkRendererComponent implements ICellRendererAngularComp {
  item?: IItem;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.item = params.data?.item as IItem;
    return true;
  }
}
