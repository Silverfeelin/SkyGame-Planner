import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { getAtmosAgTheme } from '@app/components/grid/ag-grid-theme';
import { AgAtmosSpiritLinkRendererComponent } from '@app/redesign/grid/renderers/ag-atmos-spirit-link-renderer/ag-atmos-spirit-link-renderer.component';
import { AgAtmosAreaLinkRendererComponent } from '@app/redesign/grid/renderers/ag-atmos-area-link-renderer/ag-atmos-area-link-renderer.component';
import { AgAtmosEventLinkRendererComponent } from '@app/redesign/grid/renderers/ag-atmos-event-link-renderer/ag-atmos-event-link-renderer.component';
import { AgAtmosHeartsRendererComponent } from '@app/redesign/grid/renderers/ag-atmos-hearts-renderer/ag-atmos-hearts-renderer.component';
import { AgSpiritTypeRendererComponent } from '@app/components/grid/renderers/ag-spirit-type-renderer/ag-spirit-type-renderer.component';
import { DateHelper } from '@app/helpers/date-helper';
import { INavigationTarget, NavigationHelper } from '@app/helpers/navigation-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { DataService } from '@app/services/data.service';
import { AtmosItemQuickActionsComponent } from '../quick-actions/atmos-item-quick-actions.component';
import { IItem, ISpiritTree } from 'skygame-data';

interface IRow {
  [key: string]: any;
}

@Component({
  selector: 'atmos-item-hearts',
  templateUrl: './atmos-item-hearts.component.html',
  styleUrl: './atmos-item-hearts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, AgGridAngular, AtmosItemQuickActionsComponent]
})
export class AtmosItemHeartsComponent {
  readonly theme = getAtmosAgTheme();
  readonly folded: { [key: string]: boolean } = {};

  readonly tables: {
    regular: Array<IRow>,
    regularCount: [number, number],
    guide: Array<IRow>,
    guideCount: [number, number],
    season: Array<IRow>,
    seasonCount: [number, number],
    recurringEvent: Array<IRow>,
    recurringEventCount: [number, number],
    otherEvent: Array<IRow>,
    otherEventCount: [number, number],
    other: Array<IRow>,
    otherCount: [number, number]
  };

  missingHearts: Set<IItem>;

  readonly spiritColDefs: ColDef[] = [
    { headerName: 'Spirit', valueGetter: (p: any) => p.data.spirit, cellRenderer: AgAtmosSpiritLinkRendererComponent, flex: 1, minWidth: 120 },
    { headerName: 'Type', valueGetter: (p: any) => p.data.spirit?.type, cellRenderer: AgSpiritTypeRendererComponent, width: 80, sortable: false },
    { headerName: 'Area', valueGetter: (p: any) => p.data.area, cellRenderer: AgAtmosAreaLinkRendererComponent, width: 180 },
    { headerName: 'Hearts', valueGetter: (p: any) => p.data, cellRenderer: AgAtmosHeartsRendererComponent, flex: 2, minWidth: 100, autoHeight: true, sortable: false },
  ];

  readonly eventColDefs: ColDef[] = [
    { headerName: 'Event', valueGetter: (p: any) => p.data.instance, cellRenderer: AgAtmosEventLinkRendererComponent, flex: 1, minWidth: 120 },
    { headerName: 'Hearts', valueGetter: (p: any) => p.data, cellRenderer: AgAtmosHeartsRendererComponent, flex: 2, minWidth: 100, autoHeight: true, sortable: false },
  ];

  readonly otherColDefs: ColDef[] = [
    { headerName: 'Name', field: 'name', flex: 1, minWidth: 120 },
    { headerName: 'Hearts', valueGetter: (p: any) => p.data, cellRenderer: AgAtmosHeartsRendererComponent, flex: 2, minWidth: 100, autoHeight: true, sortable: false },
  ];

  constructor(private readonly _dataService: DataService) {
    const url = new URL(location.href);
    ['r', 's', 'g', 'er', 'eo', 'o'].forEach(k => {
      this.folded[k] = url.searchParams.get(k) !== '1';
    });

    this.missingHearts = new Set(_dataService.itemConfig.items.filter(i => i.type === 'Special' && i.name === 'Heart'));

    this.tables = {
      regular: [], regularCount: [0, 0],
      guide: [], guideCount: [0, 0],
      season: [], seasonCount: [0, 0],
      recurringEvent: [], recurringEventCount: [0, 0],
      otherEvent: [], otherEventCount: [0, 0],
      other: [], otherCount: [0, 0]
    };

    this.initRegular();
    this.initSeasonSpirits();
    this.initSeasonGuides();
    this.initEvents();
    this.initOther();
  }

  onToggle(evt: Event, key: string): void {
    const open = (evt.currentTarget as HTMLDetailsElement).open;
    const url = new URL(location.href);
    url.searchParams.set(key, open ? '1' : '0');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  private initRegular(): void {
    this._dataService.spiritConfig.items.forEach(spirit => {
      if (spirit.type !== 'Regular') { return; }
      const tree = spirit.tree;
      if (!tree) { return; }
      const items = TreeHelper.getItems(tree);
      const hearts = items.filter(i => i.type === 'Special' && i.name === 'Heart');

      this.tables.regular.push({
        spirit, type: spirit.type,
        tree, area: spirit.area,
        hearts,
        heartLinks: hearts.map(h => NavigationHelper.getItemSource(h) ?? ({ route: ['/r/item', h.guid] } as INavigationTarget))
      });

      this.tables.regularCount[0] += hearts.length;
      hearts.forEach(heart => {
        if (heart.unlocked) { this.tables.regularCount[1]++; }
        this.missingHearts.delete(heart);
      });
    });
  }

  private initSeasonSpirits(): void {
    this._dataService.seasonConfig.items.forEach(season => {
      season.spirits?.forEach(spirit => {
        if (spirit.type !== 'Season') { return; }
        let rs = spirit.specialVisitSpirits?.at(-1);
        let ts = spirit.travelingSpirits?.at(-1);
        if (rs && ts) {
          if (rs.visit.date > ts.date) {
            ts = undefined;
          } else {
            rs = undefined;
          }
        }

        const tree = rs?.tree ?? ts?.tree ?? spirit.tree;
        if (!tree) { return; }
        const items = TreeHelper.getItems(tree);
        const hearts = items.filter(i => i.type === 'Special' && i.name === 'Heart');

        this.tables.season.push({
          spirit, type: spirit.type,
          tree, area: spirit.area,
          hearts,
          heartLinks: hearts.map(h => NavigationHelper.getItemSource(h) ?? ({ route: ['/r/item', h.guid] } as INavigationTarget))
        });

        this.tables.seasonCount[0] += hearts.length;
        hearts.forEach(heart => {
          if (heart.unlocked) { this.tables.seasonCount[1]++; }
          this.missingHearts.delete(heart);
        });
      });
    });
  }

  private initSeasonGuides(): void {
    this._dataService.seasonConfig.items.forEach(season => {
      const spirit = season.spirits?.find(s => s.type === 'Guide');
      if (!spirit) { return; }

      const isActive = DateHelper.isActive(season.date, season.endDate);
      let tree: ISpiritTree | undefined = isActive
        ? spirit.treeRevisions?.find(t => t.revisionType === 'DuringSeason')
        : spirit.treeRevisions?.find(t => t.revisionType === 'AfterSeason');
      tree ??= spirit.tree;

      if (!tree) { return; }
      const items = TreeHelper.getItems(tree);
      const hearts = items.filter(i => i.type === 'Special' && i.name === 'Heart');

      this.tables.guide.push({
        spirit, type: spirit.type,
        tree, area: spirit.area,
        hearts,
        heartLinks: hearts.map(h => NavigationHelper.getItemSource(h) ?? ({ route: ['/r/item', h.guid] } as INavigationTarget))
      });

      this.tables.guideCount[0] += hearts.length;
      hearts.forEach(heart => {
        if (heart.unlocked) { this.tables.guideCount[1]++; }
        this.missingHearts.delete(heart);
      });
    });
  }

  private initEvents(): void {
    this._dataService.eventConfig.items.forEach(event => {
      const instance = event.instances?.at(-1);
      if (!instance) { return; }

      const table = event.recurring !== false ? this.tables.recurringEvent : this.tables.otherEvent;
      const tableCount = event.recurring !== false ? this.tables.recurringEventCount : this.tables.otherEventCount;

      const hearts: Array<IItem> = [];
      const spirits = instance.spirits || [];
      spirits.forEach(eventSpirit => {
        const tree = eventSpirit.tree;
        if (!tree) { return; }
        const items = TreeHelper.getItems(tree);
        const treeHearts = items.filter(i => i.type === 'Special' && i.name === 'Heart' && this.missingHearts.has(i));

        tableCount[0] += treeHearts.length;
        treeHearts.forEach(heart => {
          if (heart.unlocked) { tableCount[1]++; }
          this.missingHearts.delete(heart);
        });
        hearts.push(...treeHearts);
      });

      if (!hearts.length) { return; }

      table.push({
        instance,
        hearts,
        heartLinks: hearts.map(h => NavigationHelper.getItemSource(h) ?? ({ route: ['/r/item', h.guid] } as INavigationTarget)),
        total: hearts.length,
        unlocked: hearts.filter(h => h.unlocked).length
      });
    });
  }

  private initOther(): void {
    const treeRows = new Map<ISpiritTree, IRow>();
    const handled = new Set<IItem>();
    for (const [heart] of this.missingHearts.entries()) {
      const source = ItemHelper.getItemSource(heart);
      if (source?.type !== 'node') { continue; }

      const tree = source.source.root?.tree;
      if (!tree) { continue; }

      let row = treeRows.get(tree);
      if (!row) {
        row = {
          tree,
          name: tree.name
            ?? tree.spirit?.name
            ?? tree.eventInstanceSpirit?.name ?? tree.eventInstanceSpirit?.spirit?.name
            ?? tree.travelingSpirit?.spirit?.name
            ?? tree.specialVisitSpirit?.spirit?.name,
          hearts: [],
          heartLinks: [],
          total: 0,
          unlocked: 0
        };
        treeRows.set(tree, row);
        this.tables.other.push(row);
      }

      row['hearts'].push(heart);
      row['heartLinks'].push(NavigationHelper.getItemSource(heart) ?? ({ route: ['/r/item', heart.guid] } as INavigationTarget));
      handled.add(heart);

      this.tables.otherCount[0]++;
      if (heart.unlocked) { this.tables.otherCount[1]++; }
    }

    handled.forEach(h => this.missingHearts.delete(h));
  }
}
