import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpirit, ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { SpiritTreeComponent } from '@app/components/shared/shared-widgets';
import { ShopQuickActionsComponent } from '../quick-actions/shop-quick-actions.component';
import { QuickActionsComponent } from '@app/components/shared/quick-actions/quick-actions.component';

@Component({
  selector: 'app-shop-concert-hall',
  templateUrl: './shop-concert-hall.component.html',
  styleUrl: './shop-concert-hall.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, SpiritTreeComponent, ShopQuickActionsComponent, QuickActionsComponent]
})
export class ShopConcertHallComponent {
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
