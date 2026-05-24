import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IItem } from 'skygame-data';
import { INavigationTarget } from '@app/helpers/navigation-helper';

@Component({
  selector: 'ag-atmos-hearts-renderer',
  template: `
    @for (heart of hearts; let ih = $index; track heart.guid) {
      <a [routerLink]="heartLinks[ih]?.route" [queryParams]="heartLinks[ih]?.extras?.queryParams">
        <mat-icon [class.c-new]="heart.unlocked" [class.c-accent]="!heart.unlocked">favorite</mat-icon>
      </a>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon]
})
export class AgAtmosHeartsRendererComponent implements ICellRendererAngularComp {
  hearts: IItem[] = [];
  heartLinks: (INavigationTarget | undefined)[] = [];

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.hearts = params.value?.hearts ?? [];
    this.heartLinks = params.value?.heartLinks ?? [];
    return true;
  }
}
