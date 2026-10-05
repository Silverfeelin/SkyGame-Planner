import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { SpiritTreeComponent } from '@app/components/shared/shared-widgets';

/**
 * Spirit-tree page. A thin wrapper around the shared `SpiritTreeComponent`,
 * which now owns the control bar (action toggle, unlock-all, image export,
 * edit) and the page-wide `u` / `n` shortcuts.
 */
@Component({
  selector: 'app-spirit-tree-view',
  templateUrl: './spirit-tree-view.component.html',
  styleUrl: './spirit-tree-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpiritTreeComponent]
})
export class SpiritTreeViewComponent {
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
