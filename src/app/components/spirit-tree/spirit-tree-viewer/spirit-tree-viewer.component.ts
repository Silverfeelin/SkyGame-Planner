import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SpiritTreeComponent } from '../spirit-tree.component';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';

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
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    (window as any).setTrees = this.setTrees.bind(this);
  }

  setTrees(trees?: Array<ISpiritTree>): void {
    this.trees = trees || [];
    this._changeDetectorRef.markForCheck();
  }
}
