import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ArrayHelper } from 'src/app/helpers/array-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SpiritHelper } from 'src/app/helpers/spirit-helper';
import { IItem } from 'src/app/interfaces/item.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { IReturningSpirit, IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

type ViewMode = 'grid' | 'cards';

@Component({
  selector: 'app-spirits',
  templateUrl: './spirits.component.html',
  styleUrls: ['./spirits.component.less']
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
    private readonly _route: ActivatedRoute
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
      const spirits = realm.areas?.flatMap(a => a.spirits || []) || [];
      searchArrays.push(spirits);
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
      const lastTree = trees.at(-1);
      if (lastTree) {
        // Count items from last tree.
        NodeHelper.getItems(lastTree!.node).forEach(item => {
          if (item.unlocked) { unlockedLast++; }
          totalLast++;
        });
      }

      const unlockTooltip = unlockedItems === totalItems ? 'All items unlocked.'
        : unlockedLast && unlockedLast === totalLast ? 'All items unlocked in most recent visit.'
        : undefined;

      this.unlockedItems += unlockedItems;
      this.totalItems += totalItems;

      return {
        ...s,
        areaGuid: s.area?.guid,
        unlockedItems, totalItems,
        unlockedLast, totalLast,
        unlockTooltip
      }
    });
  }

  onItemToggled(item: IItem): void {
    /**/
  }
}
