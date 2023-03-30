import { Component, OnInit } from '@angular/core';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-traveling-spirits',
  templateUrl: './traveling-spirits.component.html',
  styleUrls: ['./traveling-spirits.component.less']
})
export class TravelingSpiritsComponent implements OnInit {
  rows: Array<any> = [];

  constructor(
    private readonly _dataService: DataService
  ) {

  }

  ngOnInit(): void {
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
  }
}
