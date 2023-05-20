import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SpiritHelper } from 'src/app/helpers/spirit-helper';
import { IItem } from 'src/app/interfaces/item.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
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
  queryTree: {[spiritGuid: string]: ISpiritTree} = {};
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
    this.queryTree = {};

    // Filter by type
    const type = q.get('type');
    const typeSet = type ? new Set<string>(type.split(',')) : undefined;

    const addSpirit = (s: ISpirit): boolean => {
      // Don't add spirit if type is filtered out.
      if (typeSet && !typeSet.has(s.type)) { return false; }

      this.spirits.push(s);
      this.spiritTrees[s.guid] = SpiritHelper.getTrees(s);

      return true;
    };

    // Load from realm.
    const realmGuid = q.get('realm');
    const realm = realmGuid ? this._dataService.guidMap.get(realmGuid) as IRealm : undefined;
    realm?.areas?.forEach(a => a.spirits?.forEach(s => addSpirit(s)));

    // Load from season.
    const seasonGuid = q.get('season');
    const season = seasonGuid ? this._dataService.guidMap.get(seasonGuid) as ISeason : undefined;
    season?.spirits?.forEach(s => addSpirit(s));

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
        tree: this.queryTree[s.guid]?.guid,
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
