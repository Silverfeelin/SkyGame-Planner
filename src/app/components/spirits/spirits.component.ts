import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IEventInstance } from 'src/app/interfaces/event.interface';
import { IItem } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-spirits',
  templateUrl: './spirits.component.html',
  styleUrls: ['./spirits.component.less']
})
export class SpiritsComponent implements OnInit, OnDestroy {
  spirits: Array<ISpirit> = [];
  queryTree: {[spiritGuid: string]: ISpiritTree} = {};
  spiritTrees: {[guid: string]: Array<ISpiritTree>} = {};
  rows: Array<any> = [];

  // _itemSub?: Subscription;

  /**
   *
   */
  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(q => { this.onQueryChanged(q); });
  }

  ngOnInit(): void {
    // For updating real-time. Only needed if spirit trees are rendered on same page.
    // this._itemSub = this._eventService.itemToggled.subscribe(i => this.onItemToggled(i));
  }

  ngOnDestroy(): void {
    // this._itemSub?.unsubscribe();
  }

  onQueryChanged(q: ParamMap): void {
    this.spirits = [];
    this.spiritTrees = {};
    this.queryTree = {};

    // Filter by type
    const type = q.get('type');
    const typeSet = type ? new Set<string>(type.split(',')) : undefined;

    const addSpirit = (s: ISpirit, tree?: ISpiritTree): boolean => {
      // Don't add spirit if type is filtered out.
      if (typeSet && !typeSet.has(s.type)) { return false; }

      this.spirits.push(s);
      const trees: Array<ISpiritTree> = [];
      this.spiritTrees[s.guid] = trees;

      // Add all trees
      if (tree) { trees.push(tree); }
      if (s.tree) { trees.push(s.tree); }
      if (s.ts?.length) { s.ts.forEach(t => trees.push(t.tree)); }

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

    // Load from event instance.
    const eventInstanceGuid = q.get('eventInstance');
    const eventInstance = eventInstanceGuid ? this._dataService.guidMap.get(eventInstanceGuid) as IEventInstance : undefined;
    eventInstance?.spirits?.forEach(s => {
      addSpirit(s.spirit!, s.tree!)
      this.queryTree[s.spirit!.guid] = s.tree!;
    });

    this.initTable();
  }

  initTable(): void {
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

      return {
        ...s,
        areaGuid: s.area?.guid,
        tree: this.queryTree[s.guid]?.guid,
        unlockedItems, totalItems
      }
    });
  }

  onItemToggled(item: IItem): void {
    /**/
  }
}
