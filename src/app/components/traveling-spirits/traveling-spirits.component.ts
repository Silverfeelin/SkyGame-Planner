import { Component } from '@angular/core';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-traveling-spirits',
  templateUrl: './traveling-spirits.component.html',
  styleUrls: ['./traveling-spirits.component.less']
})
export class TravelingSpiritsComponent {
  rows: Array<any> = [];
  dateFormat: string;

  constructor(
    private readonly _dataService: DataService
  ) {
    this.dateFormat = localStorage.getItem('date.format') || 'dd-MM-yyyy';
    this.rows = this._dataService.travelingSpiritConfig.items.map(ts => {
      // Count items.
      let unlockedItems = 0, totalItems = 0;
      NodeHelper.getItems(ts.tree.node).forEach(item => {
        if (item.unlocked) { unlockedItems++; }
        totalItems++;
      });

      return {
        ...ts,
        spiritGuid: ts.spirit.guid,
        treeGuid: ts.tree.guid,
        unlockedItems,
        totalItems
      };
    }).reverse();

    // const tsSet = new Set<string>();
    // const reverseTs = this._dataService.travelingSpiritConfig.items.slice().reverse();
    // const cost: ICost = {};
    // for (const ts of reverseTs) {
    //   if (tsSet.has(ts.spirit.guid)) continue;
    //   tsSet.add(ts.spirit.guid);
    //   const nodes = NodeHelper.all(ts.tree.node);
    //   nodes.forEach(n => CostHelper.add(cost, n));
    // }

    // console.log('cost', cost, 'spirits', tsSet.size);
  }
}
