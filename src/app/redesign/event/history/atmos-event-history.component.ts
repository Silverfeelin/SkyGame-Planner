import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DateTime } from 'luxon';
import { IEvent, IEventInstance } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { getAtmosAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgSetFilterComponent } from '@app/components/grid/filters/ag-set-filter/ag-set-filter.component';
import { AgAtmosEventLinkRendererComponent } from '@app/redesign/grid/renderers/ag-atmos-event-link-renderer/ag-atmos-event-link-renderer.component';
import { AtmosEventQuickActionsComponent } from '../quick-actions/atmos-event-quick-actions.component';

interface IRow {
  event: IEvent;
  instance: IEventInstance;
  number: number;
  recurring: 'Yes' | 'No' | 'Unknown';
  date: DateTime;
  endDate: DateTime;
  startDateLabel: string;
  endDateLabel: string;
  year: number;
  duration: number;
  active: boolean;
}

const textFilterParams = {
  filterOptions: ['equals', 'notEqual', 'contains', 'notContains', 'blank', 'notBlank'],
  maxNumConditions: 4,
  buttons: ['reset' as const]
};

const numFilterParams = {
  buttons: ['reset' as const]
};

@Component({
  selector: 'app-atmos-event-history',
  templateUrl: './atmos-event-history.component.html',
  styleUrl: './atmos-event-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, AtmosEventQuickActionsComponent]
})
export class AtmosEventHistoryComponent {
  private readonly _dataService = inject(DataService);

  readonly theme = getAtmosAgTheme();
  readonly rowData: IRow[];
  api?: GridApi;

  readonly colDefs: ColDef[] = [
    { field: 'number', headerName: '#', width: 80, filter: 'agNumberColumnFilter', filterParams: numFilterParams },
    {
      field: 'instance', headerName: 'Name', flex: 1, minWidth: 220,
      filter: 'agTextColumnFilter', filterParams: textFilterParams,
      filterValueGetter: p => (p.data.instance.name ?? p.data.event.name) + (p.data.active ? ' (ongoing)' : ''),
      cellRenderer: AgAtmosEventLinkRendererComponent
    },
    { field: 'recurring', headerName: 'Repeats', width: 120, filter: AgSetFilterComponent, filterParams: { values: ['Yes', 'No', 'Unknown'] } },
    {
      field: 'startDateLabel', headerName: 'Start', width: 140,
      filter: 'agTextColumnFilter', filterParams: textFilterParams,
      sort: 'desc', initialSort: 'desc',
      sortingOrder: ['desc', 'asc'],
      comparator: (a: string, b: string, nodeA: any, nodeB: any) => nodeA.data.date.toMillis() - nodeB.data.date.toMillis()
    },
    {
      field: 'endDateLabel', headerName: 'End', width: 140,
      filter: 'agTextColumnFilter', filterParams: textFilterParams,
      comparator: (a: string, b: string, nodeA: any, nodeB: any) => nodeA.data.endDate.toMillis() - nodeB.data.endDate.toMillis()
    },
    { field: 'year', headerName: 'Year', width: 110, filter: 'agNumberColumnFilter', filterParams: numFilterParams },
    { field: 'duration', headerName: 'Duration', width: 130, filter: 'agNumberColumnFilter', filterParams: numFilterParams }
  ];

  constructor() {
    const now = DateTime.now();
    const instances = this._dataService.eventConfig.items.flatMap(e => e.instances ?? []);
    instances.sort((a, b) => b.date.toMillis() - a.date.toMillis());

    this.rowData = instances.map((i, idx) => ({
      event: i.event,
      instance: i,
      number: i.number ?? idx + 1,
      recurring: i.event.recurring === true ? 'Yes' : i.event.recurring === false ? 'No' : 'Unknown',
      date: i.date,
      endDate: i.endDate,
      startDateLabel: i.date.toFormat('yyyy-MM-dd'),
      endDateLabel: i.endDate.toFormat('yyyy-MM-dd'),
      year: i.date.year,
      duration: Math.ceil(i.endDate.diff(i.date, 'days').days),
      active: i.date <= now && i.endDate >= now
    }));
  }

  onGridReady(evt: GridReadyEvent): void { this.api = evt.api; }

  getRowHeight = (): number => 44;
}
