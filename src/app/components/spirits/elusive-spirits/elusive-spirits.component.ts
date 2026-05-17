import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';
import { DataService } from 'src/app/services/data.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { getAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgImageRendererComponent } from '../../grid/renderers/ag-image-renderer/ag-image-renderer.component';
import { AgRouteRendererComponent } from '../../grid/renderers/ag-route-renderer/ag-route-renderer.component';
import { AgDateRendererComponent } from '../../grid/renderers/ag-date-renderer/ag-date-renderer.component';
import { ISpirit } from 'skygame-data';

interface ILastVisit {
  spirit: ISpirit;
  type: 'Season' | 'Traveling Spirit' | 'Special Visit';
  date: DateTime;
  endDate: DateTime;
  days: number;
}

@Component({
    selector: 'app-elusive-spirits',
    templateUrl: './elusive-spirits.component.html',
    styleUrl: './elusive-spirits.component.scss',
    imports: [AgGridAngular, RouterLink]
})
export class ElusiveSpiritsComponent {
  theme = getAgTheme();
  rowData: any[] = [];
  api?: GridApi;

  readonly WIDE_WIDTH = 992;

  colDefs: ColDef[] = [
    { field: 'img', headerName: 'Image', width: 100, sortable: false, filter: false, cellRenderer: AgImageRendererComponent },
    {
      field: 'spirit', headerName: 'Spirit', filter: 'agTextColumnFilter',
      flex: 1,
      minWidth: 180,
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
    { field: 'type', headerName: 'Last visit', width: 150, filter: 'agTextColumnFilter' },

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
      flex: 1,
      minWidth: 160,
      cellRenderer: AgRouteRendererComponent,
      valueFormatter: (p: ValueFormatterParams) => p.value?.label ?? '',
      comparator: (a: any, b: any) => (a?.label ?? '').localeCompare(b?.label ?? ''),
      filterValueGetter: (p: ValueGetterParams) => p.data.season?.label ?? ''
    },
  ];

  constructor(
    private readonly _dataService: DataService,
    private readonly _breakpointObserver: BreakpointObserver
  ) {
    this._breakpointObserver.observe([`(min-width: ${this.WIDE_WIDTH}px)`]).pipe(takeUntilDestroyed()).subscribe(s => {
      this.updateColumns(s.matches);
    });

    const lastVisits = this._dataService.spiritConfig.items
      .filter(s => s.type === 'Season')
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

  onGridReady(evt: GridReadyEvent<any, any>) {
    this.api = evt.api;
    this.updateColumns(this._breakpointObserver.isMatched(`(min-width: ${this.WIDE_WIDTH}px)`));
  }

  getRowHeight = (): number | undefined => {
    return this.wide ? 128 : 64;
  }

  private wide = false;
  private updateColumns(wide: boolean): void {
    this.wide = wide;
    if (!this.api) return;
    this.api.resetRowHeights();
    this.api.autoSizeColumns(['img']);
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
