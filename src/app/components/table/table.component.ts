import { Component, ContentChildren, Input } from '@angular/core';
import { TableColumnDirective } from './table-column/table-column.directive';
import { TableHeaderDirective } from './table-column/table-header.directive';
import { TableFooterDirective } from './table-column/table-footer.directive';
import { NgIf, NgFor, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.less'],
    standalone: true,
    imports: [NgIf, NgFor, NgTemplateOutlet]
})
export class TableComponent {
  @Input() rows?: Array<IRow>;

  @ContentChildren(TableHeaderDirective)
  headers?: Array<TableHeaderDirective>;

  @ContentChildren(TableColumnDirective)
  columns?: Array<TableColumnDirective>;

  @ContentChildren(TableFooterDirective)
  footers?: Array<TableFooterDirective>;
}

export interface IRow {
  [key: string]: any;
}
