import { Component } from '@angular/core';
import { DateHelper } from 'src/app/helpers/date-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-returning-spirits',
  templateUrl: './returning-spirits.component.html',
  styleUrls: ['./returning-spirits.component.less']
})
export class ReturningSpiritsComponent {
  rows: Array<any> = [];

  constructor(
    private readonly _dataService: DataService
  ) {
    this.rows = this._dataService.returningSpiritsConfig.items.map(rs => {
      // Count items.
      let unlockedItems = 0, totalItems = 0;
      rs.spirits.forEach(s => {
        NodeHelper.getItems(s.tree.node).forEach(item => {
          if (item.unlocked) { unlockedItems++; }
          totalItems++;
        });
      });

      return {
        ...rs,
        spiritGuids: rs.spirits.map(s => s.guid),
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
