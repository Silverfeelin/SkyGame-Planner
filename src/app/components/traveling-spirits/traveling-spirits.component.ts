import { Component } from '@angular/core';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { DataService } from 'src/app/services/data.service';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { CalendarLinkComponent } from "../util/calendar-link/calendar-link.component";
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowHeightParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { getAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgImageRendererComponent } from '../grid/renderers/ag-image-renderer/ag-image-renderer.component';
import { AgDateRendererComponent } from '../grid/renderers/ag-date-renderer/ag-date-renderer.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgRouteRendererComponent } from '../grid/renderers/ag-route-renderer/ag-route-renderer.component';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';

@Component({
    selector: 'app-traveling-spirits',
    templateUrl: './traveling-spirits.component.html',
    styleUrls: ['./traveling-spirits.component.less'],
    standalone: true,
    imports: [WikiLinkComponent, CalendarLinkComponent, AgGridAngular]
})
export class TravelingSpiritsComponent {
  theme = getAgTheme();
  rows: Array<any> = [];

  colDefs: ColDef[] = [
    { field: 'nr', headerName: '#', width: 100, filter: 'agNumberColumnFilter', initialSort: 'desc', sortingOrder: ['asc', 'desc'] },
    { field: 'img', headerName: '', sortable: false, cellRenderer: AgImageRendererComponent },
    {
      field: 'spirit', headerName: 'Spirit', filter: 'agTextColumnFilter',
      cellRenderer: AgRouteRendererComponent,
      valueFormatter: (p: any) => p.value.label,
      comparator: (a: any, b: any) => a.label.localeCompare(b.label),
      filterValueGetter: (p: ValueGetterParams) => p.data.spirit.label
    },
    {
      field: 'date', headerName: 'Date', width: 120,
      cellRenderer: AgDateRendererComponent,
      filter: 'agDateColumnFilter',
      filterValueGetter: (p: ValueGetterParams) => (p.data.date as DateTime).toLocal().startOf('day').toJSDate(),
      valueFormatter: (p: ValueFormatterParams) => p.value
    },
    { field: 'visit', headerName: 'Visit', width: 120, filter: 'agNumberColumnFilter' },
    {
      field: 'unlocked', headerName: 'Unlocked', width: 150,
      cellRenderer: (p: any) => `<span class="${p.data.unlocked === p.data.total ? 'c-completed fw-bold' : ''}">${p.value} / ${p.data.total}</span>`,
      filter: 'agNumberColumnFilter'
    }
  ];

  rowData: any[] = [];
  api?: GridApi;

  constructor(
    private readonly _dataService: DataService,
    private readonly _breakpointObserver: BreakpointObserver
  ) {
    this._breakpointObserver.observe(['(min-width: 720px)']).pipe(takeUntilDestroyed()).subscribe(s => {
      this.updateColumns(s.matches);
    });

    this.rowData = this._dataService.travelingSpiritConfig.items.map((ts, i) => {
      // Count items.
      let unlockedItems = 0, totalItems = 0;
      NodeHelper.getItems(ts.tree.node).forEach(item => {
        if (item.unlocked) { unlockedItems++; }
        totalItems++;
      });

      return {
        nr: i + 1,
        img: ts.spirit.imageUrl,
        spirit: { label: ts.spirit.name, route: ['/spirit', ts.spirit.guid], queryParams: { highlighTree: ts.tree.guid } },
        date: ts.date,
        visit: ts.visit,
        total: totalItems,
        unlocked: unlockedItems
      };
    });
  }

  onGridReady(evt: GridReadyEvent<any,any>) {
    this.api = evt.api;
    this.updateColumns(this._breakpointObserver.isMatched('(min-width: 720px)'));
  }

  getRowHeight = (params: RowHeightParams): number | undefined => {
    return this.api?.getColumn('img')?.isVisible() ? 128 : undefined;
  }

  private updateColumns(wide: boolean): void {
    if (!this.api) return;
    this.api.setColumnsVisible(['img'], wide);
    this.api.resetRowHeights();
  }
}
