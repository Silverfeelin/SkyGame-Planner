import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { getAtmosAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgAtmosItemIconRendererComponent } from '@app/redesign/grid/renderers/ag-atmos-item-icon-renderer/ag-atmos-item-icon-renderer.component';
import { AgUnlockedRendererComponent } from '@app/components/grid/renderers/ag-unlocked-renderer/ag-unlocked-renderer.component';
import { ItemHelper } from '@app/helpers/item-helper';
import { DataService } from '@app/services/data.service';
import { IItem } from 'skygame-data';
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from '@angular/router';

const boolFilterParams = {
  filterOptions: ['equals', 'notEqual', 'blank', 'notBlank'],
  maxNumConditions: 2,
  buttons: ['reset' as const]
};

const textFilterParams = {
  filterOptions: ['equals', 'notEqual', 'contains', 'notContains', 'blank', 'notBlank'],
  maxNumConditions: 4,
  buttons: ['reset' as const]
};

@Component({
  selector: 'atmos-items',
  templateUrl: './atmos-items.component.html',
  styleUrl: './atmos-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, MatIcon, RouterLink]
})
export class AtmosItemsComponent {
  theme = getAtmosAgTheme();
  rowData: any[] = [];
  api?: GridApi;

  colDefs: ColDef[] = [
    { field: 'nr', headerName: '#', width: 90, filter: 'agNumberColumnFilter', initialSort: 'asc', sortingOrder: ['asc', 'desc'] },
    { field: 'item', headerName: 'Image', width: 80, sortable: false, filter: false, cellRenderer: AgAtmosItemIconRendererComponent },
    { field: 'name', headerName: 'Name', filter: 'agTextColumnFilter', filterParams: textFilterParams, flex: 1, minWidth: 200 },
    { field: 'type', headerName: 'Type', width: 160, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'group', headerName: 'Group', width: 130, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'unlocked', headerName: 'Unlocked', width: 130, filter: 'agTextColumnFilter', filterParams: boolFilterParams, cellRenderer: AgUnlockedRendererComponent, filterValueGetter: p => p.data.unlocked ? 'Yes' : 'No' },
    { field: 'favourited', headerName: 'Favourited', width: 130, hide: true, filter: 'agTextColumnFilter', filterParams: boolFilterParams, cellRenderer: AgUnlockedRendererComponent, filterValueGetter: p => p.data.favourited ? 'Yes' : 'No' },
    { field: 'starter', headerName: 'Starter', width: 110, hide: true, filter: 'agTextColumnFilter', filterParams: boolFilterParams, cellRenderer: AgUnlockedRendererComponent, filterValueGetter: p => p.data.starter ? 'Yes' : 'No' },
    { field: 'dyeSlots', headerName: 'Dye slots', width: 120, hide: true, filter: 'agNumberColumnFilter' },
    { field: 'returned', headerName: 'Returned', width: 120, hide: true, filter: 'agTextColumnFilter', filterParams: boolFilterParams, cellRenderer: AgUnlockedRendererComponent, filterValueGetter: p => p.data.returned ? 'Yes' : 'No' },
    { field: 'spirit', headerName: 'Spirit', width: 200, hide: true, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'season', headerName: 'Season', width: 200, hide: true, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'event', headerName: 'Event', width: 200, hide: true, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'realm', headerName: 'Realm', width: 160, hide: true, filter: 'agTextColumnFilter', filterParams: textFilterParams },
    { field: 'iap', headerName: 'IAP', width: 130, hide: true, filter: 'agTextColumnFilter', filterParams: textFilterParams }
  ];

  private readonly _items: IItem[];

  readonly totalCount: ReturnType<typeof signal<number>>;
  readonly unlockedCount: ReturnType<typeof computed<number>>;

  constructor(private readonly _dataService: DataService) {
    this._items = ItemHelper.sortItems(this._dataService.itemConfig.items.slice());
    this.rowData = this._items.map((item, i) => this.buildRow(item, i));
    this.totalCount = signal(this._items.length);
    this.unlockedCount = computed(() => this._items.filter(i => i.unlocked).length);
  }

  onGridReady(evt: GridReadyEvent<any, any>): void {
    this.api = evt.api;
  }

  getRowHeight = (): number => 48;

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
