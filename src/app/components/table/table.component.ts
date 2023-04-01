import { Component, ContentChildren, Input } from '@angular/core';
import { TableColumnDirective } from './table-column/table-column.directive';
import { TableHeaderDirective } from './table-column/table-header.directive';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less']
})
export class TableComponent {
  @Input() rows?: Array<IRow>;

  @ContentChildren(TableHeaderDirective)
  headers?: Array<TableHeaderDirective>;

  @ContentChildren(TableColumnDirective)
  columns?: Array<TableColumnDirective>;
}


export interface IRow {
  [key: string]: any;
}
