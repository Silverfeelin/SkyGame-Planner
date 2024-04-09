import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DateTime } from 'luxon';
import { ArrayHelper } from 'src/app/helpers/array-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SpiritHelper } from 'src/app/helpers/spirit-helper';
import { IItem } from 'src/app/interfaces/item.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

type ViewMode = 'grid' | 'cards';
type SortMode = 'default' | 'name-asc' | 'age-asc' | 'age-desc';

@Component({
  selector: 'app-spirits',
  templateUrl: './spirits.component.html',
  styleUrls: ['./spirits.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpiritsComponent {
  mode: ViewMode = 'cards';

  spirits: Array<ISpirit> = [];
  spiritTrees: {[guid: string]: Array<ISpiritTree>} = {};
  rows: Array<any> = [];
  unlockedItems = 0;
  totalItems = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute,
  ) {
    this.mode = localStorage.getItem('spirits.mode') as ViewMode || 'grid';
    _route.queryParamMap.subscribe(q => { this.onQueryChanged(q); });
  }

  changeMode(): void {
    this.mode = this.mode === 'grid' ? 'cards' : 'grid';
    localStorage.setItem('spirits.mode', this.mode);
  }

  onQueryChanged(q: ParamMap): void {
    this.spirits = [];
    this.spiritTrees = {};

    // Filter by type
    const type = q.get('type');
    const typeSet = type ? new Set<string>(type.split(',')) : undefined;

    const addSpirit = (s: ISpirit): boolean => {
      this.spirits.push(s);
      this.spiritTrees[s.guid] = SpiritHelper.getTrees(s);

      return true;
    };

    const searchArrays: Array<Array<ISpirit>> = [];

    // Load from realm.
    const realmGuid = q.get('realm');
    const realm = realmGuid ? this._dataService.guidMap.get(realmGuid) as IRealm : undefined;
    if (realm) {
      const spirits = new Set(realm.areas?.flatMap(a => a.spirits || []) || []);
      const ordered = this._dataService.spiritConfig.items.filter(s => spirits.has(s));
      searchArrays.push(ordered);
    }

    // Load from season.
    const seasonGuid = q.get('season');
    const season = seasonGuid ? this._dataService.guidMap.get(seasonGuid) as ISeason : undefined;
    if (season) {
      const spirits = season.spirits || [];
      searchArrays.push(spirits);
    }

    // Get intersection using all search parameters.
    let spirits = searchArrays.length
      ? ArrayHelper.intersection(...searchArrays)
      : this._dataService.spiritConfig.items;

    // Filter by type.
    spirits = typeSet ? spirits.filter(s => typeSet.has(s.type)) : spirits;

    // Add spirits to list.
    spirits.forEach(addSpirit);

    switch (q.get('sort') as SortMode) {
      case 'age-asc': this.sortAge(1); break;
      case 'age-desc': this.sortAge(-1); break;
      case 'name-asc': this.sortName(); break;
    }
    this.initTable();
  }

  initTable(): void {
    this.unlockedItems = 0;
    this.totalItems = 0;
    this.rows = this.spirits.map(s => {
      // Count items from all spirit trees.
      let unlockedItems = 0, totalItems = 0;
      const trees = this.spiritTrees[s.guid]!;
      const itemSet = new Set<IItem>();
      trees.forEach(tree => {
        // Get all nodes
        NodeHelper.getItems(tree!.node).forEach(item => {
          if (itemSet.has(item)) { return; }
          itemSet.add(item);
          if (item.unlocked) { unlockedItems++; }
          totalItems++;
        });
      });

      // Count items from last spirit tree.
      let unlockedLast = 0, totalLast = 0;
      let unlockedFree = 0, totalFree = 0;
      let unlockedPass = 0, totalPass = 0;
      const lastTree = trees.at(-1);
      if (lastTree) {
        // Count items from last tree.
        NodeHelper.getItems(lastTree!.node).forEach(item => {
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

      const unlockTooltip = unlockedItems === totalItems ? 'All items unlocked.'
        : unlockedLast && unlockedLast === totalLast ? 'All items unlocked in most recent visit.'
        : (unlockedFree || totalPass) && unlockedFree === totalFree ? 'All free items unlocked.'
        : undefined;

      this.unlockedItems += unlockedItems;
      this.totalItems += totalItems;

      return {
        ...s,
        areaGuid: s.area?.guid,
        unlockedItems, totalItems,
        unlockedFree, totalFree,
        unlockedPass, totalPass,
        unlockedLast, totalLast,
        unlockTooltip
      }
    });
  }

  sortDefault(): void {
    this.sortByDefault();
    this.updateSortUrl('default');
    this.initTable();
  }

  sortName(): void {
    this.sortByName();
    this.updateSortUrl('name-asc');
    this.initTable();
  }

  sortAge(direction: number): void {
    this.sortByAge(direction);
    this.updateSortUrl(direction > 0 ? 'age-asc' : 'age-desc');
    this.initTable();
  }

  private sortByDefault(): void {
    this.spirits.sort((a, b) => a._index - b._index);
  }

  private sortByName(): void {
    this.spirits.sort((a, b) => a.name.localeCompare(b.name));
  }

  private sortByAge(direction: number): void {
    const dateA = DateTime.fromFormat('2019-01-01', 'yyyy-MM-dd');
    const dateB = DateTime.fromFormat('2999-01-01', 'yyyy-MM-dd');
    const dates = this.spirits.reduce((acc, s) => {
      let date = s.season?.date || s.events?.at(-1)?.eventInstance?.date;
      switch (s.type) {
        case 'Regular':
        case 'Elder':
          date = dateA;
          break;
        case 'Guide':
        case 'Season':
          date = s.season?.date;
          break;
        case 'Event':
          date = s.events?.at(0)?.eventInstance?.date;
          break;
      }

      acc[s.guid] = date ?? dateB;
      return acc;
    }, {} as {[guid: string]: DateTime});

    this.spirits.sort((a, b) => {
      const dateA = dates[a.guid];
      const dateB = dates[b.guid];
      const diff = dateA.diff(dateB);
      return !diff.as('milliseconds') ? (a._index - b._index) * direction : diff.as('milliseconds') * direction;
    });
  }

  private updateSortUrl(type: SortMode): void {
    const url = new URL(location.href);
    url.searchParams.set('sort', type);
    history.replaceState(history.state, '', url.pathname + url.search);
  }
}
