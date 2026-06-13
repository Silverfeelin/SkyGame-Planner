import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { AtmosSpiritTreeComponent } from '@app/redesign/shared/atmos-shared-widgets';

/**
 * Atmospheric spirit-tree page. A thin wrapper around the shared
 * `AtmosSpiritTreeComponent`, which now owns the control bar (action toggle,
 * unlock-all, image export, edit) and the page-wide `u` / `n` shortcuts.
 */
@Component({
  selector: 'app-atmos-spirit-tree-view',
  templateUrl: './atmos-spirit-tree-view.component.html',
  styleUrl: './atmos-spirit-tree-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmosSpiritTreeComponent]
})
export class AtmosSpiritTreeViewComponent {
  private readonly _dataService = inject(DataService);
  private readonly _route = inject(ActivatedRoute);

  readonly tree = signal<ISpiritTree | undefined>(undefined);

  readonly title = computed<string | undefined>(() => {
    const t = this.tree();
    if (!t) { return undefined; }
    return t.spirit?.name
      ?? t.eventInstanceSpirit?.spirit?.name
      ?? t.travelingSpirit?.spirit?.name
      ?? t.specialVisitSpirit?.spirit?.name
      ?? t.name;
  });

  constructor() {
    this._route.paramMap.subscribe(params => {
      const t = this._dataService.guidMap.get(params.get('guid')!) as ISpiritTree | undefined;
      this.tree.set(t);
    });
  }
}
