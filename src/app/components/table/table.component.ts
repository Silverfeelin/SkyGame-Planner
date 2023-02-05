import { Component, ContentChildren, Input } from '@angular/core';
import { TableColumnDirective } from './table-column/table-column.directive';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less']
})
export class TableComponent {
  @Input() rows?: Array<IRow>;

  @ContentChildren(TableColumnDirective)
  columns?: Array<TableColumnDirective>;
}


export interface IRow {
  [key: string]: any;
}
