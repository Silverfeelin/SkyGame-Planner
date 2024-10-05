import { Component } from '@angular/core';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { DataService } from 'src/app/services/data.service';
import { DateComponent } from '../util/date/date.component';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { NgIf } from '@angular/common';
import { TableColumnDirective } from '../table/table-column/table-column.directive';
import { TableHeaderDirective } from '../table/table-column/table-header.directive';
import { TableComponent } from '../table/table.component';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { CalendarLinkComponent } from "../util/calendar-link/calendar-link.component";

@Component({
    selector: 'app-traveling-spirits',
    templateUrl: './traveling-spirits.component.html',
    styleUrls: ['./traveling-spirits.component.less'],
    standalone: true,
    imports: [WikiLinkComponent, TableComponent, TableHeaderDirective, TableColumnDirective, NgIf, IconComponent, RouterLink, DateComponent, CalendarLinkComponent]
})
export class TravelingSpiritsComponent {
  rows: Array<any> = [];

  constructor(
    private readonly _dataService: DataService
  ) {
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
