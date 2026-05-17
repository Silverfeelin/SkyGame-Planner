import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { CalendarLinkComponent } from '../util/calendar-link/calendar-link.component';
import { TreeHelper } from '@app/helpers/tree-helper';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { DateTime } from 'luxon';
import { getAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgRouteRendererComponent } from '../grid/renderers/ag-route-renderer/ag-route-renderer.component';
import { AgDateRendererComponent } from '../grid/renderers/ag-date-renderer/ag-date-renderer.component';
import { AgSpiritsRendererComponent } from '../grid/renderers/ag-spirits-renderer/ag-spirits-renderer.component';

@Component({
    selector: 'app-returning-spirits',
    templateUrl: './returning-spirits.component.html',
    styleUrls: ['./returning-spirits.component.less'],
    imports: [WikiLinkComponent, CalendarLinkComponent, AgGridAngular]
})
export class ReturningSpiritsComponent {
  theme = getAgTheme();
  rowData: any[] = [];
  api?: GridApi;

  colDefs: ColDef[] = [
    {
      field: 'name', headerName: 'Name', filter: 'agTextColumnFilter',
      flex: 1, minWidth: 200,
      cellRenderer: AgRouteRendererComponent,
      valueFormatter: (p: ValueFormatterParams) => p.value?.label ?? '',
      comparator: (a: any, b: any) => (a?.label ?? '').localeCompare(b?.label ?? ''),
      filterValueGetter: (p: ValueGetterParams) => p.data.name?.label ?? ''
    },
    {
      field: 'spirits', headerName: 'Spirits',
      flex: 1, minWidth: 200,
      sortable: false, filter: false,
      cellRenderer: AgSpiritsRendererComponent
    },
    {
      field: 'date', headerName: 'Start', width: 140,
      cellRenderer: AgDateRendererComponent,
      filter: 'agDateColumnFilter',
      initialSort: 'desc',
      sortingOrder: ['desc', 'asc'],
      filterValueGetter: (p: ValueGetterParams) => p.data.date ? (p.data.date as DateTime).toLocal().startOf('day').toJSDate() : null,
      valueFormatter: (p: ValueFormatterParams) => p.value ?? '',
      comparator: (a: DateTime | undefined, b: DateTime | undefined) => {
        if (!a && !b) { return 0; }
        if (!a) { return 1; }
        if (!b) { return -1; }
        return a.diff(b).as('milliseconds');
      }
    },
    {
      field: 'endDate', headerName: 'End', width: 140,
      cellRenderer: AgDateRendererComponent,
      filter: 'agDateColumnFilter',
      filterValueGetter: (p: ValueGetterParams) => p.data.endDate ? (p.data.endDate as DateTime).toLocal().startOf('day').toJSDate() : null,
      valueFormatter: (p: ValueFormatterParams) => p.value ?? '',
      comparator: (a: DateTime | undefined, b: DateTime | undefined) => {
        if (!a && !b) { return 0; }
        if (!a) { return 1; }
        if (!b) { return -1; }
        return a.diff(b).as('milliseconds');
      }
    },
    {
      field: 'unlocked', headerName: 'Unlocked', width: 150,
      filter: 'agNumberColumnFilter',
      cellRenderer: (p: any) => {
        if (!p.data.total) { return ''; }
        const cls = p.data.completed ? 'completed' : '';
        return `<span class="${cls}">${p.value} / ${p.data.total}</span>`;
      }
    }
  ];

  constructor(
    private readonly _dataService: DataService
  ) {
    this.rowData = this._dataService.returningSpiritsConfig.items.map(rs => {
      let unlockedItems = 0, totalItems = 0;
      rs.spirits.forEach(s => {
        TreeHelper.getNodes(s.tree).forEach(node => {
          if (node.unlocked || node.item?.unlocked) { unlockedItems++; }
          totalItems++;
        });
      });

      return {
        guid: rs.guid,
        name: { label: rs.name, route: ['/rs', rs.guid] },
        spirits: rs.spirits.map(s => ({
          label: s.spirit.name,
          imageUrl: s.spirit.imageUrl,
          route: ['/spirit', s.spirit.guid],
          queryParams: { highlightTree: s.tree.guid }
        })),
        date: rs.date,
        endDate: rs.endDate,
        unlocked: unlockedItems,
        total: totalItems,
        completed: totalItems > 0 && unlockedItems === totalItems
      };
    });
  }

  onGridReady(evt: GridReadyEvent<any, any>) {
    this.api = evt.api;
  }

  getRowHeight = (): number | undefined => 96;
}
