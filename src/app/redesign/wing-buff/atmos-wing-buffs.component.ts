import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueGetterParams } from 'ag-grid-community';
import { getAtmosAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgSetFilterComponent } from '@app/components/grid/filters/ag-set-filter/ag-set-filter.component';
import { AgSpiritTypeRendererComponent } from '@app/components/grid/renderers/ag-spirit-type-renderer/ag-spirit-type-renderer.component';
import { AgAtmosSpiritLinkRendererComponent } from '@app/redesign/grid/renderers/ag-atmos-spirit-link-renderer/ag-atmos-spirit-link-renderer.component';
import { DataService } from '@app/services/data.service';
import { IItem, ISpirit, ItemType, SpiritType } from 'skygame-data';
import { AtmosWingedLightQuickActionsComponent } from '../winged-light/quick-actions/atmos-winged-light-quick-actions.component';

interface IOriginLink { name: string; route: Array<string>; }

interface IRow {
  spirit: ISpirit;
  type: SpiritType;
  origin: IOriginLink | undefined;
  unlocked: number;
  total: number;
}

@Component({
  selector: 'ag-atmos-wing-buff-origin-renderer',
  template: `@if (origin) { <a class="atmos-text-link" [routerLink]="origin.route">{{ origin.name }}</a> }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
class AgAtmosWingBuffOriginRendererComponent implements ICellRendererAngularComp {
  origin?: IOriginLink;
  agInit(params: any): void { this.refresh(params); }
  refresh(params: any): boolean { this.origin = params.value as IOriginLink | undefined; return true; }
}

@Component({
  selector: 'app-atmos-wing-buffs',
  templateUrl: './atmos-wing-buffs.component.html',
  styleUrl: './atmos-wing-buffs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, AtmosWingedLightQuickActionsComponent]
})
export class AtmosWingBuffsComponent {
  readonly theme = getAtmosAgTheme();
  unlocked = 0;
  total = 0;

  api?: GridApi;

  readonly colDefs: ColDef[] = [
    {
      headerName: 'Spirit',
      flex: 1,
      minWidth: 180,
      filter: 'agTextColumnFilter',
      valueGetter: (p: ValueGetterParams) => p.data.spirit,
      filterValueGetter: (p: ValueGetterParams) => p.data.spirit?.name ?? '',
      cellRenderer: AgAtmosSpiritLinkRendererComponent
    },
    {
      headerName: 'Type',
      width: 100,
      filter: AgSetFilterComponent,
      filterParams: { values: ['Regular', 'Elder', 'Season', 'Guide', 'Event', 'Special'] },
      valueGetter: (p: ValueGetterParams) => p.data.type,
      filterValueGetter: (p: ValueGetterParams) => p.data.type ?? '',
      cellRenderer: AgSpiritTypeRendererComponent
    },
    {
      headerName: 'Origin',
      flex: 1,
      minWidth: 160,
      filter: 'agTextColumnFilter',
      valueGetter: (p: ValueGetterParams) => p.data.origin,
      filterValueGetter: (p: ValueGetterParams) => p.data.origin?.name ?? '',
      cellRenderer: AgAtmosWingBuffOriginRendererComponent
    },
    {
      headerName: 'Unlocked',
      width: 140,
      filter: 'agNumberColumnFilter',
      valueGetter: (p: ValueGetterParams) => p.data.unlocked,
      cellRenderer: (p: any) => {
        const row = p.data as IRow;
        const cls = row.unlocked === row.total && row.total > 0 ? 'atmos-wing-buffs__cell-complete' : '';
        return `<span class="${cls}">${row.unlocked} / ${row.total}</span>`;
      }
    }
  ];

  rowData: IRow[] = [];

  constructor(dataService: DataService) {
    const wingBuffs = dataService.itemConfig.items.filter(item => item.type === ItemType.WingBuff);

    const regularSpirits = new Set<ISpirit>();
    const seasonSpirits = new Set<ISpirit>();
    const spiritCount = new Map<string, { unlocked: number; total: number }>();

    for (const item of wingBuffs as IItem[]) {
      if (!item.nodes?.length) { continue; }
      const root = item.nodes[0].root;
      const tree = root?.tree;
      let spirit: ISpirit | undefined;
      let isSeasonal = false;
      if (tree?.spirit) {
        spirit = tree.spirit;
      } else if (tree?.travelingSpirit) {
        spirit = tree.travelingSpirit.spirit;
        isSeasonal = true;
      } else if (tree?.specialVisitSpirit) {
        spirit = tree.specialVisitSpirit.spirit;
        isSeasonal = true;
      }
      if (!spirit) { continue; }

      let count = spiritCount.get(spirit.guid);
      if (!count) {
        count = { unlocked: 0, total: 0 };
        spiritCount.set(spirit.guid, count);
      }
      count.total++;
      if (item.unlocked) { count.unlocked++; }

      if (isSeasonal) { seasonSpirits.add(spirit); }
      else { regularSpirits.add(spirit); }
    }

    const spirits = [...regularSpirits, ...seasonSpirits];
    const rows: IRow[] = spirits.map(spirit => {
      const count = spiritCount.get(spirit.guid)!;
      let origin: IRow['origin'];
      if (spirit.season) {
        origin = { name: spirit.season.name, route: ['/r/season', spirit.season.guid] };
      } else if (spirit.type === 'Regular' && spirit.area?.realm) {
        origin = { name: spirit.area.realm.name, route: ['/r/realm', spirit.area.realm.guid] };
      }
      return {
        spirit,
        type: spirit.type,
        origin,
        unlocked: count.unlocked,
        total: count.total
      };
    });

    this.rowData = rows;
    this.unlocked = rows.reduce((sum, r) => sum + r.unlocked, 0);
    this.total = rows.reduce((sum, r) => sum + r.total, 0);
  }

  onGridReady(evt: GridReadyEvent): void {
    this.api = evt.api;
  }
}
