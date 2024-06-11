import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-spirit-tree-view',
  templateUrl: './spirit-tree-view.component.html',
  styleUrl: './spirit-tree-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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
