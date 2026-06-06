import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DateTime } from 'luxon';
import { IEvent, IEventInstance } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { TitleService } from '@app/services/title.service';
import { TreeHelper } from '@app/helpers/tree-helper';
import { getAtmosAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgAtmosEventLinkRendererComponent } from '@app/redesign/grid/renderers/ag-atmos-event-link-renderer/ag-atmos-event-link-renderer.component';
import { AtmosEventQuickActionsComponent } from '../quick-actions/atmos-event-quick-actions.component';

interface IRow {
  event: IEvent;
  instance: IEventInstance;
  number: number;
  name: string;
  year: number;
  date: DateTime;
  endDate: DateTime;
  startDateLabel: string;
  endDateLabel: string;
  iaps: number;
  returningIaps: number;
  spirits: number;
  unlockedItems: number;
  totalItems: number;
  unlockedLabel: string;
  completed: boolean;
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
  selector: 'app-atmos-event',
  templateUrl: './atmos-event.component.html',
  styleUrl: './atmos-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AgGridAngular, AtmosEventQuickActionsComponent]
})
export class AtmosEventComponent {
  private readonly _dataService = inject(DataService);
  private readonly _titleService = inject(TitleService);
  private readonly _route = inject(ActivatedRoute);

  readonly event = signal<IEvent | undefined>(undefined);
  readonly rowData = signal<IRow[]>([]);
  readonly theme = getAtmosAgTheme();
  api?: GridApi;

  readonly colDefs: ColDef[] = [
    { field: 'number', headerName: '#', width: 80, filter: 'agNumberColumnFilter', filterParams: numFilterParams,
      initialSort: 'desc', sort: 'desc', sortingOrder: ['desc', 'asc'] },
    {
      field: 'instance', headerName: 'Name', flex: 1, minWidth: 220,
      filter: 'agTextColumnFilter', filterParams: textFilterParams,
      filterValueGetter: p => p.data.name,
      cellRenderer: AgAtmosEventLinkRendererComponent
    },
    { field: 'year', headerName: 'Year', width: 110, filter: 'agNumberColumnFilter', filterParams: numFilterParams },
    {
      field: 'startDateLabel', headerName: 'Start', width: 140,
      filter: 'agTextColumnFilter', filterParams: textFilterParams,
      comparator: (a: string, b: string, nA: any, nB: any) => nA.data.date.toMillis() - nB.data.date.toMillis()
    },
    {
      field: 'endDateLabel', headerName: 'End', width: 140,
      filter: 'agTextColumnFilter', filterParams: textFilterParams,
      comparator: (a: string, b: string, nA: any, nB: any) => nA.data.endDate.toMillis() - nB.data.endDate.toMillis()
    },
    { field: 'spirits', headerName: 'Spirits', width: 120, filter: 'agNumberColumnFilter', filterParams: numFilterParams },
    {
      field: 'iaps', headerName: 'IAPs', width: 140, filter: 'agNumberColumnFilter', filterParams: numFilterParams,
      valueGetter: p => p.data.iaps,
      valueFormatter: p => p.data.returningIaps ? `${p.data.iaps} (${p.data.returningIaps} returning)` : `${p.data.iaps}`
    },
    {
      field: 'unlockedLabel', headerName: 'Unlocked', width: 140,
      filter: 'agTextColumnFilter', filterParams: textFilterParams
    }
  ];

  constructor() {
    this._route.paramMap.subscribe(p => this._onParams(p));
  }

  onGridReady(evt: GridReadyEvent): void { this.api = evt.api; }
  getRowHeight = (): number => 44;

  private _onParams(params: ParamMap): void {
    const guid = params.get('guid');
    const event = this._dataService.guidMap.get(guid!) as IEvent | undefined;
    if (!event) { return; }
    this.event.set(event);
    this._titleService.setTitle(event.name);

    const instances = event.instances ?? [];
    const rows: IRow[] = instances.map((instance, i) => {
      let iaps = 0; let returningIaps = 0;
      instance.shops?.forEach(shop => {
        iaps += shop.iaps?.length ?? 0;
        returningIaps += shop.iaps?.filter(v => v.returning).length ?? 0;
      });

      let unlockedItems = 0; let totalItems = 0;
      instance.spirits?.forEach(spirit => {
        const items = TreeHelper.getItems(spirit.tree);
        items.forEach(item => {
          if (item.unlocked) { unlockedItems++; }
          totalItems++;
        });
      });

      return {
        event,
        instance,
        number: i + 1,
        name: instance.name ?? event.name,
        year: instance.date.year,
        date: instance.date,
        endDate: instance.endDate,
        startDateLabel: instance.date.toFormat('yyyy-MM-dd'),
        endDateLabel: instance.endDate.toFormat('yyyy-MM-dd'),
        iaps,
        returningIaps,
        spirits: instance.spirits?.length ?? 0,
        unlockedItems,
        totalItems,
        unlockedLabel: totalItems ? `${unlockedItems} / ${totalItems}` : '',
        completed: totalItems > 0 && unlockedItems === totalItems
      };
    });
    this.rowData.set(rows);
  }
}
