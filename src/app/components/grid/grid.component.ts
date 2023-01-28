import { Component, ContentChildren, Input } from '@angular/core';
import { GridColumnirective as GridColumnDirective } from './grid-column/grid-column.directive';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.less']
})
export class GridComponent {
  @Input() rows?: Array<IRow>;

  @ContentChildren(GridColumnDirective)
  gridColumns?: Array<GridColumnDirective>;
}


export interface IRow {
  [key: string]: any;
}
