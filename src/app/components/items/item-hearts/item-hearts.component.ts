import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpiritTypeIconComponent } from '@app/components/spirit-type-icon/spirit-type-icon.component';
import { TableColumnDirective } from '@app/components/table/table-column/table-column.directive';
import { TableHeaderDirective } from '@app/components/table/table-column/table-header.directive';
import { IRow, TableComponent } from '@app/components/table/table.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { DateHelper } from '@app/helpers/date-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { NavigationHelper } from '@app/helpers/navigation-helper';
import { IItem } from '@app/interfaces/item.interface';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { DataService } from '@app/services/data.service';
import { CardComponent, CardFoldEvent } from "../../layout/card/card.component";
import { MatIcon } from '@angular/material/icon';
import { TableFooterDirective } from '@app/components/table/table-column/table-footer.directive';
import { NodeHelper } from '@app/helpers/node-helper';
import { TreeHelper } from '@app/helpers/tree-helper';

@Component({
    selector: 'app-item-hearts',
    imports: [WikiLinkComponent, TableComponent, TableHeaderDirective, TableColumnDirective, RouterLink, SpiritTypeIconComponent, NgTemplateOutlet, CardComponent, MatIcon, TableFooterDirective],
    templateUrl: './item-hearts.component.html',
    styleUrl: './item-hearts.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemHeartsComponent {
  folded: { [key: string]: boolean } = {};
  tables: {
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

  constructor(
    private readonly _dataService: DataService
  ) {
    // Get folded cards.
    const url = new URL(location.href);
    ['r', 's', 'g', 'er', 'eo', 'o'].forEach(k => {
      this.folded[k] = url.searchParams.get(k) !== '1';
    });

    this.missingHearts = new Set(_dataService.itemConfig.items.filter(i => i.type === 'Special' && i.name === 'Heart'));

    this.tables = {
      regular: [], regularCount: [0,0],
      guide: [], guideCount: [0,0],
      season: [], seasonCount: [0,0],
      recurringEvent: [], recurringEventCount: [0,0],
      otherEvent: [], otherEventCount: [0,0],
      other: [], otherCount: [0,0]
    };

    this.initRegular();
    this.initSeasonSpirits();
    this.initSeasonGuides();
    this.initEvents();
    this.initOther();

    if (this.missingHearts.size > 0) {
      console.error('There are some unknown hearts!', this.missingHearts);
    }
  }

  onAfterFold(evt: CardFoldEvent, type: string) {
    const url = new URL(location.href);
    url.searchParams.set(type, evt.fold ? '0' : '1');
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
        hearts: hearts,
        heartLinks: hearts.map(h => NavigationHelper.getItemSource(h) ?? NavigationHelper.getItemLink(h))
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
        let rs = spirit.returns?.at(-1);
        let ts = spirit.ts?.at(-1);
        if (rs && ts) {
          if (rs.return.date > ts.date) {
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
          hearts: hearts,
          heartLinks: hearts.map(h => NavigationHelper.getItemSource(h) ?? NavigationHelper.getItemLink(h))
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
        hearts: hearts,
        heartLinks: hearts.map(h => NavigationHelper.getItemSource(h) ?? NavigationHelper.getItemLink(h))
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
        hearts: hearts,
        heartLinks: hearts.map(h => NavigationHelper.getItemSource(h) ?? NavigationHelper.getItemLink(h)),
        total: hearts.length,
        unlocked: hearts.filter(h => h.unlocked).length
      });
    })
  }

  private initOther(): void {
    const treeRows = new Map<ISpiritTree, IRow>();
    const handled = new Set<IItem>();
    for (const [heart] of this.missingHearts.entries()) {
      const source = ItemHelper.getItemSource(heart);
      if (source?.type !== 'node') { continue; }

      const tree = source.source.root?.spiritTree;
      if (!tree) { continue; }

      let row = treeRows.get(tree);
      if (!row) {
        row = {
          tree,
          name: tree.name
            ?? tree.spirit?.name
            ?? tree.eventInstanceSpirit?.name ?? tree.eventInstanceSpirit?.spirit?.name
            ?? tree.ts?.spirit?.name
            ?? tree.visit?.spirit?.name,
          hearts: [],
          heartLinks: [],
          total: 0,
          unlocked: 0
        };
        treeRows.set(tree, row);
        this.tables.other.push(row);
      }

      row['hearts'].push(heart);
      row['heartLinks'].push(NavigationHelper.getItemSource(heart) ?? NavigationHelper.getItemLink(heart));
      handled.add(heart);

      this.tables.otherCount[0]++;
      if (heart.unlocked) { this.tables.otherCount[1]++; }
    }

    handled.forEach(h => this.missingHearts.delete(h));
  }
}
