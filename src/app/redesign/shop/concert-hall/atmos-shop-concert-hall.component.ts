import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpirit, ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { AtmosSpiritTreeComponent } from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosShopQuickActionsComponent } from '../quick-actions/atmos-shop-quick-actions.component';

@Component({
  selector: 'app-atmos-shop-concert-hall',
  templateUrl: './atmos-shop-concert-hall.component.html',
  styleUrl: './atmos-shop-concert-hall.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, AtmosSpiritTreeComponent, AtmosShopQuickActionsComponent]
})
export class AtmosShopConcertHallComponent {
  readonly tree: ISpiritTree;
  readonly highlightNode = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    const spirit = dataService.guidMap.get('kavln3oyNl') as ISpirit;
    this.tree = spirit.treeRevisions?.at(-1) ?? spirit.tree!;

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightNode.set(p.get('highlightNode') || undefined);
  }
}
