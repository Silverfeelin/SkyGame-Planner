import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { getAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgSetFilterComponent } from '@app/components/grid/filters/ag-set-filter/ag-set-filter.component';
import { AgItemIconRendererComponent } from '@app/components/grid/renderers/ag-item-icon-renderer/ag-item-icon-renderer.component';
import { AgUnlockedRendererComponent } from '@app/components/grid/renderers/ag-unlocked-renderer/ag-unlocked-renderer.component';
import { ItemHelper } from '@app/helpers/item-helper';
import { DataService } from '@app/services/data.service';
import { IItem, ItemType } from 'skygame-data';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { ItemQuickActionsComponent } from './quick-actions/item-quick-actions.component';

const itemTypePipe = new ItemTypePipe();
const typeFilterValues = Object.values(ItemType).map(t => ({ value: t, label: itemTypePipe.transform(t) }));
const boolFilterValues = ['Yes', 'No'];
const groupLabels: { [group: string]: string } = { Elder: 'Elder', SeasonPass: 'Season Pass', Ultimate: 'Ultimate', Limited: 'Limited' };
const groupFilterValues = ['Elder', 'SeasonPass', 'Ultimate', 'Limited'].map(v => ({ value: v, label: groupLabels[v] }));

const textFilterParams = {
  filterOptions: ['equals', 'notEqual', 'contains', 'notContains', 'blank', 'notBlank'],
  maxNumConditions: 4,
  buttons: ['reset' as const]
};

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, ItemQuickActionsComponent]
})
export class ItemsComponent {
  theme = getAgTheme();
  readonly rowData = signal<any[]>([]);
  api?: GridApi;

  colDefs: ColDef[] = [
    { field: 'nr', headerName: '#', width: 90, filter: 'agNumberColumnFilter', initialSort: 'asc', sortingOrder: ['asc', 'desc'] },
    { field: 'item', headerName: 'Image', width: 80, sortable: false, filter: false, cellRenderer: AgItemIconRendererComponent },
    { field: 'name', headerName: 'Name', filter: 'agTextColumnFilter', filterParams: textFilterParams, flex: 1, minWidth: 200 },
    { field: 'type', headerName: 'Type', width: 160, filter: AgSetFilterComponent, filterParams: { values: typeFilterValues }, valueFormatter: p => itemTypePipe.transform(p.value) },
    { field: 'group', headerName: 'Group', width: 130, filter: AgSetFilterComponent, filterParams: { values: groupFilterValues, includeBlanks: true }, valueFormatter: p => groupLabels[p.value] ?? p.value },
    { field: 'unlocked', headerName: 'Unlocked', width: 130, filter: AgSetFilterComponent, filterParams: { values: boolFilterValues }, cellRenderer: AgUnlockedRendererComponent, filterValueGetter: p => p.data.unlocked ? 'Yes' : 'No' },
    { field: 'favourited', headerName: 'Favourited', width: 130, filter: AgSetFilterComponent, filterParams: { values: boolFilterValues }, cellRenderer: AgUnlockedRendererComponent, filterValueGetter: p => p.data.favourited ? 'Yes' : 'No' },
    { field: 'starter', headerName: 'Starter', width: 110, filter: AgSetFilterComponent, filterParams: { values: boolFilterValues }, cellRenderer: AgUnlockedRendererComponent, filterValueGetter: p => p.data.starter ? 'Yes' : 'No' },
    { field: 'dyeSlots', headerName: 'Dye slots', width: 120, filter: 'agNumberColumnFilter' },
    { field: 'returned', headerName: 'Returned', width: 120, filter: AgSetFilterComponent, filterParams: { values: boolFilterValues }, cellRenderer: AgUnlockedRendererComponent, filterValueGetter: p => p.data.returned ? 'Yes' : 'No' },
    { field: 'spirit', headerName: 'Spirit', width: 200, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'season', headerName: 'Season', width: 200, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'event', headerName: 'Event', width: 200, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'realm', headerName: 'Realm', width: 160, filter: AgSetFilterComponent, filterParams: { values: [] as string[], includeBlanks: true } },
    { field: 'iap', headerName: 'IAP', width: 130, filter: 'agTextColumnFilter', filterParams: textFilterParams }
  ];

  private readonly _dataService = inject(DataService);
  private readonly _route = inject(ActivatedRoute);

  private readonly _items: IItem[];

  readonly totalCount: ReturnType<typeof signal<number>>;
  readonly unlockedCount: ReturnType<typeof computed<number>>;

  constructor() {
    const realmColDef = this.colDefs.find(c => c.field === 'realm')!;
    realmColDef.filterParams.values = this._dataService.realmConfig.items.map(r => r.name);

    this._items = ItemHelper.sortItems(this._dataService.itemConfig.items.slice());
    this.rowData.set(this._items.map((item, i) => this.buildRow(item, i)));
    this.totalCount = signal(this._items.length);
    this.unlockedCount = computed(() => this._items.filter(i => i.unlocked).length);

    this._route.queryParamMap.subscribe(() => this.applyQueryFilters());
  }

  onGridReady(evt: GridReadyEvent<any, any>): void {
    this.api = evt.api;
    this.applyQueryFilters();
  }

  getRowHeight = (): number => 48;

  /** Replaces the column filters with the ones described by the query params. */
  private applyQueryFilters(): void {
    if (!this.api) { return; }
    const q = this._route.snapshot.queryParamMap;
    const model: { [field: string]: unknown } = {};

    // The item guid is resolved to a name filter so the filter stays visible and editable in the grid.
    const guid = q.get('item')?.trim();
    const name = guid ? (this._dataService.guidMap.get(guid) as IItem | undefined)?.name : undefined;
    if (name) {
      model['name'] = { filterType: 'text', type: 'equals', filter: name };
    }

    const favourite = this.parseBool(q.get('favourite'));
    if (favourite !== undefined) {
      model['favourited'] = { values: [favourite ? 'Yes' : 'No'] };
    }

    this.api.setFilterModel(Object.keys(model).length ? model : null);
  }

  private parseBool(value: string | null): boolean | undefined {
    switch (value?.toLowerCase()) {
      case '1': case 'true': case 'yes': return true;
      case '0': case 'false': case 'no': return false;
      default: return undefined;
    }
  }

  private buildRow(item: IItem, index: number): any {
    const firstSource = ItemHelper.getItemSource(item);
    const lastSource = ItemHelper.getItemSource(item, true);

    // Season: from origin (first source) when origin type is season; TS fallback; direct item.season
    let season = '';
    const originFirst = ItemHelper.geSourceOrigin(firstSource);
    if (originFirst?.type === 'season') {
      season = originFirst.source.name;
    } else if (firstSource?.type === 'node') {
      const tsSeason = firstSource.source.root?.tree?.travelingSpirit?.spirit.season;
      if (tsSeason) { season = tsSeason.name; }
    }
    if (!season && item.season?.name) { season = item.season.name; }

    // Event: from last source's origin when type is event (last instance wins for recurring events)
    let event = '';
    const originLast = ItemHelper.geSourceOrigin(lastSource);
    if (originLast?.type === 'event') {
      event = originLast.source.event.name;
    }

    // Spirit: from the last node source's tree
    let spirit = '';
    if (lastSource?.type === 'node') {
      const tree = lastSource.source.root?.tree;
      spirit = tree?.spirit?.name
        ?? tree?.travelingSpirit?.spirit.name
        ?? tree?.eventInstanceSpirit?.spirit.name
        ?? tree?.specialVisitSpirit?.spirit.name
        ?? '';
    }

    // Realm: only from Regular/Elder spirits in the last node source
    let realm = '';
    if (lastSource?.type === 'node') {
      const tree = lastSource.source.root?.tree;
      const sp = tree?.spirit;
      if (sp && (sp.type === 'Regular' || sp.type === 'Elder')) {
        realm = sp.area?.realm.name ?? '';
      }
    }

    // IAP: name of the last IAP, or 'Yes' if unnamed, or empty
    const iap = item.iaps?.length ? (item.iaps.at(-1)!.name ?? 'Yes') : '';

    // Returned: auto-unlocked items are always available; otherwise item appears from multiple sources
    const returned = !!(item.autoUnlocked || (firstSource && lastSource && firstSource.source !== lastSource.source));

    return {
      nr: index + 1,
      item,
      name: item.name,
      type: item.type,
      group: item.group ?? '',
      unlocked: !!item.unlocked,
      favourited: !!item.favourited,
      starter: !!item.autoUnlocked,
      dyeSlots: item.dye?.secondary ? 2 : item.dye?.primary ? 1 : 0,
      returned,
      spirit,
      season,
      event,
      realm,
      iap
    };
  }
}
