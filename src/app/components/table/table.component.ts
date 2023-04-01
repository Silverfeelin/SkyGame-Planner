import { AfterContentInit, Component, ContentChildren, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Params } from '@angular/router';
import { TableColumnDirective } from './table-column/table-column.directive';
import { TableHeaderDirective } from './table-column/table-header.directive';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less']
})
export class TableComponent implements OnChanges, AfterContentInit {
  @Input() rows?: Array<IRow>;

  @ContentChildren(TableHeaderDirective)
  headers?: Array<TableHeaderDirective>;

  @ContentChildren(TableColumnDirective)
  columns?: Array<TableColumnDirective>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows'] && this.columns?.length) {
      this.initializeLinks();
    }
  }

  ngAfterContentInit(): void {
    if (this.rows?.length) {
      this.initializeLinks();
    }
  }

  private initializeLinks(): void {
    this.rows?.forEach((row, ri) => {
      row['gridData'] = [];

      this.columns?.forEach((column, ci) => {
        row['gridData'][ci] = {};

        // Add TD routerLink.
        if (column.link) {
          const parts = [...column.link];
          let isValid = true;

          // Replace placeholders like :guid with row.guid.
          parts.forEach((part, i) => {
            if (typeof part !== 'string' || !part.startsWith(':')) { return; }
            parts[i] = row[part.substring(1)];
            if (parts[i] == null) { isValid = false; }
          });

          const params = { ...column.queryParams };
          Object.keys(params).forEach(k => {
            const v = params[k];
            if (typeof v !== 'string' || !v.startsWith(':')) { return; }
            params[k] = row[v.substring(1)];
            if (params[k] == null) { isValid = false; }
          });

          row['gridData'][ci].link = parts;
          row['gridData'][ci].queryParams = params;
        }
      });
    });
  }
}


export interface IRow {
  [key: string]: any;
}
