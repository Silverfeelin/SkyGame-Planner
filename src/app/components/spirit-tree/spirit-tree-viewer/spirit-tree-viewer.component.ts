import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SpiritTreeComponent } from '../spirit-tree.component';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-spirit-tree-viewer',
  standalone: true,
  imports: [SpiritTreeComponent],
  templateUrl: './spirit-tree-viewer.component.html',
  styleUrl: './spirit-tree-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpiritTreeViewerComponent {
  trees: Array<ISpiritTree> = [];

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute
  ) {
    (window as any).setTrees = this.setTrees.bind(this);

    const treeGuids = _route.snapshot.queryParamMap.get('trees');
    if (treeGuids) {
      const handledGuids = new Set<string>();
      const trees = (treeGuids.match(/.{10}/g) || [])
        .filter(t => !handledGuids.has(t) && handledGuids.add(t))
        .map(t => _dataService.guidMap.get(t))
        .filter(t => !!t) as ISpiritTree[];
      this.setTrees(trees);
    }
  }

  setTrees(trees?: Array<ISpiritTree>): void {
    this.trees = trees || [];
    this._changeDetectorRef.markForCheck();
  }
}
