import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IEventInstance } from 'skygame-data';

@Component({
  selector: 'ag-atmos-event-link-renderer',
  template: `@if (instance) { <a [routerLink]="['/event-instance', instance.guid]">{{ instance.name ?? instance.event.name }}</a> }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class AgAtmosEventLinkRendererComponent implements ICellRendererAngularComp {
  instance?: IEventInstance;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.instance = params.value as IEventInstance;
    return true;
  }
}
