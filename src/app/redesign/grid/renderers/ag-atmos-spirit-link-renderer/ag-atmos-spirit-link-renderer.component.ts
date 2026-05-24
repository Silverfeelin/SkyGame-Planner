import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ISpirit } from 'skygame-data';

@Component({
  selector: 'ag-atmos-spirit-link-renderer',
  template: `@if (spirit) { <a class="atmos-text-link" [routerLink]="['/spirit', spirit.guid]">{{ spirit.name }}</a> }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class AgAtmosSpiritLinkRendererComponent implements ICellRendererAngularComp {
  spirit?: ISpirit;

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.spirit = params.value as ISpirit;
    return true;
  }
}
