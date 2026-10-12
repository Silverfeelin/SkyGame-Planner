import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { TooltipDirective } from '@app/directives/tooltip.directive';

interface SpiritLink {
  label?: string;
  imageUrl?: string;
  route?: any;
  queryParams?: any;
}

@Component({
  selector: 'app-ag-spirits-renderer',
  standalone: true,
  imports: [TooltipDirective, RouterLink],
  templateUrl: './ag-spirits-renderer.component.html',
  styleUrl: './ag-spirits-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgSpiritsRendererComponent implements ICellRendererAngularComp {
  items: Array<SpiritLink> = [];

  agInit(params: any): void { this.refresh(params); }

  refresh(params: any): boolean {
    this.items = params.value ?? [];
    return false;
  }
}
