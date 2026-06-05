import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateTime } from 'luxon';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { DataService } from '@app/services/data.service';
import { TreeHelper } from '@app/helpers/tree-helper';
import { getAtmosAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgImageRendererComponent } from '@app/components/grid/renderers/ag-image-renderer/ag-image-renderer.component';
import { AgRouteRendererComponent } from '@app/components/grid/renderers/ag-route-renderer/ag-route-renderer.component';
import { AgDateRendererComponent } from '@app/components/grid/renderers/ag-date-renderer/ag-date-renderer.component';
import { AtmosSpiritQuickActionsComponent } from '@app/redesign/spirit/quick-actions/atmos-spirit-quick-actions.component';

/**
 * Atmospheric traveling spirits list. Port of legacy `TravelingSpiritsComponent`.
 */
@Component({
  selector: 'app-atmos-traveling-spirits',
  templateUrl: './atmos-traveling-spirits.component.html',
  styleUrl: './atmos-traveling-spirits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, AtmosSpiritQuickActionsComponent]
})
export class AtmosTravelingSpiritsComponent {
  private readonly _dataService = inject(DataService);
  private readonly _breakpointObserver = inject(BreakpointObserver);

  readonly theme = getAtmosAgTheme();
  readonly rowData: any[];

  private readonly WIDE_WIDTH = 992;
  private _api?: GridApi;
  private _wide = false;

  readonly colDefs: ColDef[] = [
    { field: 'nr', headerName: '#', width: 100, filter: 'agNumberColumnFilter', initialSort: 'desc', sortingOrder: ['asc', 'desc'] },
    { field: 'img', headerName: 'Image', sortable: false, cellRenderer: AgImageRendererComponent },
    {
      field: 'spirit', headerName: 'Spirit', filter: 'agTextColumnFilter',
      flex: 1, minWidth: 200,
      cellRenderer: AgRouteRendererComponent,
      valueFormatter: (p: ValueFormatterParams) => p.value.label,
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
      cellRenderer: (p: any) => {
        if (!p.data.total) { return ''; }
        return `<span class="${p.value === p.data.total ? 'c-completed fw-bold' : ''}">${p.value} / ${p.data.total}</span>`;
      },
      filter: 'agNumberColumnFilter'
    }
  ];

  constructor() {
    this._breakpointObserver
      .observe([`(min-width: ${this.WIDE_WIDTH}px)`])
      .pipe(takeUntilDestroyed())
      .subscribe(s => this.updateColumns(s.matches));

    this.rowData = this._dataService.travelingSpiritConfig.items.map((ts, i) => {
      let unlockedItems = 0, totalItems = 0;
      TreeHelper.getItems(ts.tree).forEach(item => {
        if (item.unlocked) { unlockedItems++; }
        totalItems++;
      });

      return {
        nr: i + 1,
        img: ts.spirit.imageUrl,
        spirit: { label: ts.spirit.name, route: ['/r/spirit', ts.spirit.guid], queryParams: { highlightTree: ts.tree.guid } },
        date: ts.date,
        visit: ts.visit,
        total: totalItems,
        unlocked: unlockedItems
      };
    });
  }

  onGridReady(evt: GridReadyEvent<any, any>): void {
    this._api = evt.api;
    this.updateColumns(this._breakpointObserver.isMatched(`(min-width: ${this.WIDE_WIDTH}px)`));
  }

  getRowHeight = (): number | undefined => (this._wide ? 128 : 64);

  private updateColumns(wide: boolean): void {
    this._wide = wide;
    if (!this._api) { return; }
    this._api.resetRowHeights();
    this._api.autoSizeColumns(['img']);
  }
}
