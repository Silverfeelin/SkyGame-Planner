import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { AtmosSpiritTreeComponent } from '@app/redesign/shared/atmos-shared-widgets';

/**
 * Atmospheric spirit-tree viewer — renders a list of trees specified in the
 * `?trees=` query parameter (concatenated 10-char GUIDs). Mirrors legacy
 * `SpiritTreeViewerComponent` (including its `window.setTrees` debug hook).
 */
@Component({
  selector: 'app-atmos-spirit-tree-viewer',
  templateUrl: './atmos-spirit-tree-viewer.component.html',
  styleUrl: './atmos-spirit-tree-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmosSpiritTreeComponent]
})
export class AtmosSpiritTreeViewerComponent {
  private readonly _dataService = inject(DataService);
  private readonly _route = inject(ActivatedRoute);

  readonly trees = signal<ReadonlyArray<ISpiritTree>>([]);

  constructor() {
    (window as any).setTrees = (trees?: Array<ISpiritTree>) => this.trees.set(trees ?? []);

    const treeGuids = this._route.snapshot.queryParamMap.get('trees');
    if (treeGuids) {
      const handled = new Set<string>();
      const trees = (treeGuids.match(/.{10}/g) || [])
        .filter(t => !handled.has(t) && handled.add(t))
        .map(t => this._dataService.guidMap.get(t))
        .filter((t): t is ISpiritTree => !!t);
      this.trees.set(trees);
    }
  }
}
