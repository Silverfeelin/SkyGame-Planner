import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateTime } from 'luxon';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { ISpirit, ISpiritTree, IRealm, IArea, ISeason, IItem, SpiritType } from 'skygame-data';
import { ArrayHelper } from '@app/helpers/array-helper';
import { SpiritHelper } from '@app/helpers/spirit-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { DataService } from '@app/services/data.service';
import { getAtmosAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgImageRendererComponent } from '@app/components/grid/renderers/ag-image-renderer/ag-image-renderer.component';
import { AgRouteRendererComponent } from '@app/components/grid/renderers/ag-route-renderer/ag-route-renderer.component';
import { AgDateRendererComponent } from '@app/components/grid/renderers/ag-date-renderer/ag-date-renderer.component';
import { AgSpiritTypeRendererComponent } from '@app/components/grid/renderers/ag-spirit-type-renderer/ag-spirit-type-renderer.component';

/**
 * Atmospheric spirits list (AG-Grid). Port of legacy `SpiritsComponent`.
 */
@Component({
  selector: 'app-atmos-spirits',
  templateUrl: './atmos-spirits.component.html',
  styleUrl: './atmos-spirits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular]
})
export class AtmosSpiritsComponent {
  private readonly _dataService = inject(DataService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _breakpointObserver = inject(BreakpointObserver);

  readonly theme = getAtmosAgTheme();
  readonly rowData = signal<any[]>([]);
  readonly totalCount = signal<number>(0);

  private readonly WIDE_WIDTH = 992;
  private _api?: GridApi;
  private _wide = false;
  private _spiritOrderMap?: Map<string, number>;

  readonly colDefs: ColDef[] = [
    { field: 'nr', headerName: '#', width: 90, filter: 'agNumberColumnFilter', initialSort: 'asc', sortingOrder: ['asc', 'desc'] },
    { field: 'img', headerName: 'Image', width: 100, sortable: false, filter: false, cellRenderer: AgImageRendererComponent },
    {
      field: 'spirit', headerName: 'Spirit', filter: 'agTextColumnFilter',
      flex: 1, minWidth: 200,
      cellRenderer: AgRouteRendererComponent,
      valueFormatter: (p: ValueFormatterParams) => p.value.label,
      comparator: (a: any, b: any) => a.label.localeCompare(b.label),
      filterValueGetter: (p: ValueGetterParams) => p.data.spirit.label
    },
    {
      field: 'type', headerName: 'Type', width: 100,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['equals', 'notEqual', 'contains', 'notContains'],
        defaultOption: 'contains',
        maxNumConditions: 6,
        buttons: ['reset']
      },
      cellRenderer: AgSpiritTypeRendererComponent
    },
    {
      field: 'area', headerName: 'Location', filter: 'agTextColumnFilter',
      flex: 1, minWidth: 150,
      cellRenderer: AgRouteRendererComponent,
      valueFormatter: (p: ValueFormatterParams) => p.value?.label ?? '',
      comparator: (a: any, b: any) => (a?.label ?? '').localeCompare(b?.label ?? ''),
      filterValueGetter: (p: ValueGetterParams) => p.data.area?.label ?? ''
    },
    {
      field: 'date', headerName: 'Date', width: 120,
      cellRenderer: AgDateRendererComponent,
      filter: 'agDateColumnFilter',
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
      field: 'unlocked', headerName: 'Unlocked', width: 150,
      filter: 'agNumberColumnFilter',
      cellRenderer: (p: any) => {
        if (!p.data.total) { return ''; }
        const cls = p.data.completed ? 'completed' : p.data.partial ? 'partial' : '';
        return `<span class="${cls}">${p.value} / ${p.data.total}</span>`;
      },
      tooltipValueGetter: (p: any) => p.data.unlockTooltip
    }
  ];

  constructor() {
    this._breakpointObserver
      .observe([`(min-width: ${this.WIDE_WIDTH}px)`])
      .pipe(takeUntilDestroyed())
      .subscribe(s => this.updateColumns(s.matches));

    this._route.queryParamMap.subscribe(q => this.onQueryChanged(q));
  }

  onGridReady(evt: GridReadyEvent<any, any>): void {
    this._api = evt.api;
    this.updateColumns(this._breakpointObserver.isMatched(`(min-width: ${this.WIDE_WIDTH}px)`));
    this.updateDateColumnVisibility();
    this._api.autoSizeColumns(['type']);
    this.applyInitialTypeFilter();
  }

  getRowHeight = (): number | undefined => (this._wide ? 128 : 64);

  private applyInitialTypeFilter(): void {
    const type = this._route.snapshot.queryParamMap.get('type');
    if (!type || !this._api) { return; }
    const values = type.split(',').map(v => v.trim()).filter(v => v);
    if (!values.length) { return; }

    const condition = (v: string) => ({ filterType: 'text', type: 'equals', filter: v });
    const typeModel = values.length === 1
      ? condition(values[0])
      : { filterType: 'text', operator: 'OR', conditions: values.map(condition) };

    this._api.setColumnFilterModel('type', typeModel).then(() => this._api?.onFilterChanged());
  }

  private updateColumns(wide: boolean): void {
    this._wide = wide;
    if (!this._api) { return; }
    this._api.resetRowHeights();
    this._api.autoSizeColumns(['img']);
  }

  private onQueryChanged(q: ParamMap): void {
    let spirits = this.filterSpirits(q);
    const order = this.getSpiritOrderMap();
    spirits = spirits.slice().sort((a, b) =>
      (order.get(a.guid) ?? Infinity) - (order.get(b.guid) ?? Infinity)
    );
    const spiritTrees: { [guid: string]: Array<ISpiritTree> } = {};
    spirits.forEach(s => { spiritTrees[s.guid] = SpiritHelper.getTrees(s); });
    this.rowData.set(this.buildRows(spirits, spiritTrees));
    this.totalCount.set(spirits.length);
    this.updateDateColumnVisibility();
    this.applyInitialTypeFilter();
  }

  private getSpiritOrderMap(): Map<string, number> {
    if (this._spiritOrderMap) { return this._spiritOrderMap; }
    const order = new Map<string, number>();
    let n = 0;

    for (const realm of this._dataService.realmConfig.items) {
      for (const area of realm.areas || []) {
        for (const spirit of area.spirits || []) {
          if (order.has(spirit.guid)) { continue; }
          if (spirit.type === 'Regular' || spirit.type === 'Elder') {
            order.set(spirit.guid, n++);
          }
        }
      }
    }

    for (const season of this._dataService.seasonConfig.items) {
      for (const spirit of season.spirits || []) {
        if (order.has(spirit.guid)) { continue; }
        if (spirit.type === 'Season' || spirit.type === 'Guide') {
          order.set(spirit.guid, n++);
        }
      }
    }

    const eventSpirits = this._dataService.spiritConfig.items
      .filter(s => s.type === 'Event' && !order.has(s.guid))
      .sort((a, b) => {
        const da = a.eventInstanceSpirits?.at(0)?.eventInstance?.date;
        const db = b.eventInstanceSpirits?.at(0)?.eventInstance?.date;
        if (!da && !db) { return 0; }
        if (!da) { return 1; }
        if (!db) { return -1; }
        return da.diff(db).as('milliseconds');
      });
    for (const spirit of eventSpirits) { order.set(spirit.guid, n++); }

    for (const spirit of this._dataService.spiritConfig.items) {
      if (order.has(spirit.guid)) { continue; }
      if (spirit.type === 'Special') { order.set(spirit.guid, n++); }
    }

    for (const spirit of this._dataService.spiritConfig.items) {
      if (!order.has(spirit.guid)) { order.set(spirit.guid, n++); }
    }

    this._spiritOrderMap = order;
    return order;
  }

  private updateDateColumnVisibility(): void {
    const hasDate = this.rowData().some(r => !!r.date);
    this._api?.setColumnsVisible(['date'], hasDate);
  }

  private getSpiritDate(s: ISpirit): DateTime | undefined {
    switch (s.type as SpiritType) {
      case 'Regular':
      case 'Elder':
        return undefined;
      case 'Guide':
      case 'Season':
        return s.season?.date;
      case 'Event':
        return s.eventInstanceSpirits?.at(0)?.eventInstance?.date;
      default:
        return s.season?.date || s.eventInstanceSpirits?.at(-1)?.eventInstance?.date;
    }
  }

  private filterSpirits(q: ParamMap): Array<ISpirit> {
    const searchArrays: Array<Array<ISpirit>> = [];

    const realmGuid = q.get('realm');
    const realm = realmGuid ? this._dataService.guidMap.get(realmGuid) as IRealm : undefined;
    if (realm) {
      const set = new Set(realm.areas?.flatMap(a => a.spirits || []) || []);
      searchArrays.push(this._dataService.spiritConfig.items.filter(s => set.has(s)));
    }

    const areaGuid = q.get('area');
    const area = areaGuid ? this._dataService.guidMap.get(areaGuid) as IArea : undefined;
    if (area) { searchArrays.push(area.spirits || []); }

    const seasonGuid = q.get('season');
    const season = seasonGuid ? this._dataService.guidMap.get(seasonGuid) as ISeason : undefined;
    if (season) { searchArrays.push(season.spirits || []); }

    return searchArrays.length
      ? ArrayHelper.intersection(...searchArrays)
      : this._dataService.spiritConfig.items;
  }

  private buildRows(spirits: Array<ISpirit>, spiritTrees: { [guid: string]: Array<ISpiritTree> }): any[] {
    return spirits.map((s, i) => {
      let unlockedItems = 0, totalItems = 0;
      const trees = spiritTrees[s.guid]!;
      const itemSet = new Set<IItem>();
      trees.forEach(tree => {
        TreeHelper.getItems(tree).forEach(item => {
          if (itemSet.has(item)) { return; }
          itemSet.add(item);
          if (item.unlocked) { unlockedItems++; }
          totalItems++;
        });
      });

      let unlockedLast = 0, totalLast = 0;
      let unlockedFree = 0, totalFree = 0;
      let totalPass = 0;
      const lastTree = trees.at(-1);
      if (lastTree) {
        TreeHelper.getItems(lastTree).forEach(item => {
          if (item.unlocked) { unlockedLast++; }
          totalLast++;
          if (item.group === 'Ultimate') {
            totalPass++;
          } else {
            if (item.unlocked) { unlockedFree++; }
            totalFree++;
          }
        });
      }

      const completed = totalItems > 0 && unlockedItems === totalItems;
      const partial = !completed && (
        (!!unlockedLast && unlockedLast === totalLast)
        || ((!!unlockedFree || !!totalPass) && unlockedFree === totalFree)
      );
      const unlockTooltip = completed ? 'All items unlocked.'
        : unlockedLast && unlockedLast === totalLast ? 'All items unlocked in most recent visit.'
        : (unlockedFree || totalPass) && unlockedFree === totalFree ? 'All free items unlocked.'
        : undefined;

      return {
        nr: i + 1,
        guid: s.guid,
        img: s.imageUrl,
        spirit: { label: s.name, route: ['/r/spirit', s.guid] },
        type: s.type,
        area: s.area ? { label: s.area.name, route: ['/r/area', s.area.guid] } : undefined,
        date: this.getSpiritDate(s),
        unlocked: unlockedItems,
        total: totalItems,
        completed,
        partial,
        unlockTooltip
      };
    });
  }
}
