import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DateTime } from 'luxon';
import { ArrayHelper } from 'src/app/helpers/array-helper';
import { SpiritHelper } from 'src/app/helpers/spirit-helper';
import { DataService } from 'src/app/services/data.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgImageRendererComponent } from '../grid/renderers/ag-image-renderer/ag-image-renderer.component';
import { AgRouteRendererComponent } from '../grid/renderers/ag-route-renderer/ag-route-renderer.component';
import { AgDateRendererComponent } from '../grid/renderers/ag-date-renderer/ag-date-renderer.component';
import { AgSpiritTypeRendererComponent } from '../grid/renderers/ag-spirit-type-renderer/ag-spirit-type-renderer.component';
import { TreeHelper } from '@app/helpers/tree-helper';
import { ISpirit, ISpiritTree, IRealm, IArea, ISeason, IItem, SpiritType } from 'skygame-data';

@Component({
    selector: 'app-spirits',
    templateUrl: './spirits.component.html',
    styleUrls: ['./spirits.component.less'],
    imports: [AgGridAngular]
})
export class SpiritsComponent {
  theme = getAgTheme();
  rowData: any[] = [];
  api?: GridApi;

  readonly WIDE_WIDTH = 992;

  colDefs: ColDef[] = [
    { field: 'nr', headerName: '#', width: 90, filter: 'agNumberColumnFilter', initialSort: 'asc', sortingOrder: ['asc', 'desc'] },
    { field: 'img', headerName: 'Image', width: 100, sortable: false, filter: false, cellRenderer: AgImageRendererComponent },
    {
      field: 'spirit', headerName: 'Spirit', filter: 'agTextColumnFilter',
      flex: 1,
      minWidth: 200,
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
      flex: 1,
      minWidth: 150,
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

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute,
    private readonly _breakpointObserver: BreakpointObserver
  ) {
    this._breakpointObserver.observe([`(min-width: ${this.WIDE_WIDTH}px)`]).pipe(takeUntilDestroyed()).subscribe(s => {
      this.updateColumns(s.matches);
    });

    _route.queryParamMap.subscribe(q => { this.onQueryChanged(q); });
  }

  onGridReady(evt: GridReadyEvent<any, any>) {
    this.api = evt.api;
    this.updateColumns(this._breakpointObserver.isMatched(`(min-width: ${this.WIDE_WIDTH}px)`));
    this.updateDateColumnVisibility();
    this.api.autoSizeColumns(['type']);
    this.applyInitialTypeFilter();
  }

  private applyInitialTypeFilter(): void {
    const type = this._route.snapshot.queryParamMap.get('type');
    if (!type || !this.api) { return; }
    const values = type.split(',').map(v => v.trim()).filter(v => v);
    if (!values.length) { return; }

    const condition = (v: string) => ({ filterType: 'text', type: 'equals', filter: v });
    const typeModel = values.length === 1
      ? condition(values[0])
      : { filterType: 'text', operator: 'OR', conditions: values.map(condition) };

    this.api.setColumnFilterModel('type', typeModel).then(() => this.api?.onFilterChanged());
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

  private onQueryChanged(q: ParamMap): void {
    let spirits = this.filterSpirits(q);
    const order = this.getSpiritOrderMap();
    spirits = spirits.slice().sort((a, b) =>
      (order.get(a.guid) ?? Infinity) - (order.get(b.guid) ?? Infinity)
    );
    const spiritTrees: {[guid: string]: Array<ISpiritTree>} = {};
    spirits.forEach(s => { spiritTrees[s.guid] = SpiritHelper.getTrees(s); });
    this.rowData = this.buildRows(spirits, spiritTrees);
    this.updateDateColumnVisibility();
    this.applyInitialTypeFilter();
  }

  private _spiritOrderMap?: Map<string, number>;
  private getSpiritOrderMap(): Map<string, number> {
    if (this._spiritOrderMap) { return this._spiritOrderMap; }
    const order = new Map<string, number>();
    let n = 0;

    // 1: Regular and Elder by realm -> area -> spirit.
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

    // 2: Season spirits (Season and Guide) by season order.
    for (const season of this._dataService.seasonConfig.items) {
      for (const spirit of season.spirits || []) {
        if (order.has(spirit.guid)) { continue; }
        if (spirit.type === 'Season' || spirit.type === 'Guide') {
          order.set(spirit.guid, n++);
        }
      }
    }

    // 3: Event spirits by first event instance date.
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

    // 4: Special.
    for (const spirit of this._dataService.spiritConfig.items) {
      if (order.has(spirit.guid)) { continue; }
      if (spirit.type === 'Special') { order.set(spirit.guid, n++); }
    }

    // Catch-all for any spirit not matched above.
    for (const spirit of this._dataService.spiritConfig.items) {
      if (!order.has(spirit.guid)) { order.set(spirit.guid, n++); }
    }

    this._spiritOrderMap = order;
    return order;
  }

  private updateDateColumnVisibility(): void {
    const hasDate = this.rowData.some(r => !!r.date);
    this.api?.setColumnsVisible(['date'], hasDate);
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

  private buildRows(spirits: Array<ISpirit>, spiritTrees: {[guid: string]: Array<ISpiritTree>}): any[] {
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
      let unlockedPass = 0, totalPass = 0;
      const lastTree = trees.at(-1);
      if (lastTree) {
        TreeHelper.getItems(lastTree).forEach(item => {
          if (item.unlocked) { unlockedLast++; }
          totalLast++;
          if (item.group === 'Ultimate') {
            item.unlocked && unlockedPass++;
            totalPass++;
          } else {
            item.unlocked && unlockedFree++;
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
        spirit: { label: s.name, route: ['/spirit', s.guid] },
        type: s.type,
        area: s.area ? { label: s.area.name, route: ['/area', s.area.guid] } : undefined,
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
