import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateTime } from 'luxon';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { ISpirit } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { DateHelper } from '@app/helpers/date-helper';
import { getAtmosAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgSetFilterComponent } from '@app/components/grid/filters/ag-set-filter/ag-set-filter.component';
import { AgImageRendererComponent } from '@app/components/grid/renderers/ag-image-renderer/ag-image-renderer.component';
import { AgRouteRendererComponent } from '@app/components/grid/renderers/ag-route-renderer/ag-route-renderer.component';
import { AgDateRendererComponent } from '@app/components/grid/renderers/ag-date-renderer/ag-date-renderer.component';
import { AtmosSpiritQuickActionsComponent } from '../quick-actions/atmos-spirit-quick-actions.component';

interface ILastVisit {
  spirit: ISpirit;
  type: 'Season' | 'Traveling Spirit' | 'Special Visit';
  date: DateTime;
  endDate: DateTime;
  days: number;
}

/**
 * Atmospheric elusive spirits list. Port of legacy `ElusiveSpiritsComponent`.
 */
@Component({
  selector: 'app-atmos-elusive-spirits',
  templateUrl: './atmos-elusive-spirits.component.html',
  styleUrl: './atmos-elusive-spirits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, RouterLink, AtmosSpiritQuickActionsComponent]
})
export class AtmosElusiveSpiritsComponent {
  private readonly _dataService = inject(DataService);
  private readonly _breakpointObserver = inject(BreakpointObserver);

  readonly theme = getAtmosAgTheme();
  readonly rowData: any[];

  private readonly WIDE_WIDTH = 992;
  private _api?: GridApi;
  private _wide = false;

  readonly colDefs: ColDef[] = [
    { field: 'img', headerName: 'Image', width: 100, sortable: false, filter: false, cellRenderer: AgImageRendererComponent },
    {
      field: 'spirit', headerName: 'Spirit', filter: 'agTextColumnFilter',
      flex: 1, minWidth: 180,
      cellRenderer: AgRouteRendererComponent,
      valueFormatter: (p: ValueFormatterParams) => p.value?.label ?? '',
      comparator: (a: any, b: any) => (a?.label ?? '').localeCompare(b?.label ?? ''),
      filterValueGetter: (p: ValueGetterParams) => p.data.spirit?.label ?? ''
    },
    {
      field: 'days', headerName: 'Days ago', width: 140, filter: 'agNumberColumnFilter',
      initialSort: 'desc', sortingOrder: ['desc', 'asc'],
      cellRenderer: (p: any) => `<span class="c-old fw-bold">${p.value}</span>`
    },
    { field: 'type', headerName: 'Last visit', width: 150, filter: AgSetFilterComponent, filterParams: { values: ['Season', 'Traveling Spirit', 'Special Visit'] } },
    {
      field: 'date', headerName: 'Start', width: 120,
      cellRenderer: AgDateRendererComponent,
      filter: 'agDateColumnFilter',
      filterValueGetter: (p: ValueGetterParams) => (p.data.date as DateTime).toLocal().startOf('day').toJSDate(),
      valueFormatter: (p: ValueFormatterParams) => p.value,
      comparator: (a: DateTime, b: DateTime) => a.diff(b).as('milliseconds')
    },
    {
      field: 'endDate', headerName: 'End', width: 120,
      cellRenderer: AgDateRendererComponent,
      filter: 'agDateColumnFilter',
      filterValueGetter: (p: ValueGetterParams) => (p.data.endDate as DateTime).toLocal().startOf('day').toJSDate(),
      valueFormatter: (p: ValueFormatterParams) => p.value,
      comparator: (a: DateTime, b: DateTime) => a.diff(b).as('milliseconds')
    },
    {
      field: 'season', headerName: 'Season', filter: 'agTextColumnFilter',
      flex: 1, minWidth: 160,
      cellRenderer: AgRouteRendererComponent,
      valueFormatter: (p: ValueFormatterParams) => p.value?.label ?? '',
      comparator: (a: any, b: any) => (a?.label ?? '').localeCompare(b?.label ?? ''),
      filterValueGetter: (p: ValueGetterParams) => p.data.season?.label ?? ''
    }
  ];

  constructor() {
    this._breakpointObserver
      .observe([`(min-width: ${this.WIDE_WIDTH}px)`])
      .pipe(takeUntilDestroyed())
      .subscribe(s => this.updateColumns(s.matches));

    const lastVisits = this._dataService.spiritConfig.items
      .filter(s => s.type === 'Season' && !!s.season)
      .map(s => this.getLastVisitBySpirit(s));

    this.rowData = lastVisits.map(v => ({
      img: v.spirit.imageUrl,
      spirit: { label: v.spirit.name, route: ['/spirit', v.spirit.guid] },
      season: v.spirit.season ? { label: v.spirit.season.name, route: ['/season', v.spirit.season.guid] } : undefined,
      type: v.type,
      date: v.date,
      endDate: v.endDate,
      days: v.days
    }));
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

  private getLastVisitBySpirit(spirit: ISpirit): ILastVisit {
    const lastVisit: ILastVisit = {
      spirit,
      date: spirit.season!.date,
      endDate: spirit.season!.endDate,
      type: 'Season',
      days: 0
    };

    const ts = spirit.travelingSpirits?.at(-1);
    if (ts && ts.date > lastVisit.date) {
      lastVisit.date = ts.date;
      lastVisit.endDate = ts.endDate;
      lastVisit.type = 'Traveling Spirit';
    }

    const rs = spirit.specialVisitSpirits?.at(-1);
    if (rs && rs.visit.date > lastVisit.date) {
      lastVisit.date = rs.visit.date;
      lastVisit.endDate = rs.visit.endDate;
      lastVisit.type = 'Special Visit';
    }

    lastVisit.days = DateHelper.daysBetween(DateTime.now(), lastVisit.endDate);

    return lastVisit;
  }
}
