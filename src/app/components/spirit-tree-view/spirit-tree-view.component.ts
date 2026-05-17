import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { SpiritTreeComponent } from '../spirit-tree/spirit-tree.component';
import { ISpiritTree } from 'skygame-data';

@Component({
    selector: 'app-spirit-tree-view',
    templateUrl: './spirit-tree-view.component.html',
    styleUrl: './spirit-tree-view.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SpiritTreeComponent]
})
export class SpiritTreeViewComponent {
  tree?: ISpiritTree;
  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    _route.paramMap.subscribe(params => {
      const tree = _dataService.guidMap.get(params.get('guid')!) as ISpiritTree;
      this.tree = tree;
      _changeDetectorRef.markForCheck();
    });
  }
}
