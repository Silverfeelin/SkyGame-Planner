import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IItem } from 'src/app/interfaces/item.interface';
import { ItemType } from 'src/app/interfaces/item.interface';
import { ISpirit, SpiritType } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-wing-buffs',
  templateUrl: './wing-buffs.component.html',
  styleUrls: ['./wing-buffs.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WingBuffsComponent implements OnInit {
  type?: SpiritType;
  allRows!: Array<any>;
  rows!: Array<any>;
  unlocked = 0;
  total = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) {

  }

  onQueryChanged(params: ParamMap): void {
    this.type = params.get('type') as SpiritType;
    this.filterRows();
  }

  ngOnInit(): void {
    // Get all wing buffs.
    const itemSet = new Set<IItem>();
    for (const item of this._dataService.itemConfig.items.filter(item => item.type === ItemType.WingBuff)) {
      itemSet.add(item);
    }

    // Go through items to find spirit.
    const regularSpiritSet = new Set<ISpirit>();
    const seasonSpiritSet = new Set<ISpirit>();

    const spiritCount = new Map<string, { unlocked: number, total: number}>();

    for (const item of itemSet) {
      if (!item.nodes?.length) { continue; }
      const rootNode = NodeHelper.getRoot(item.nodes[0]);
      const spiritTree = rootNode!.spiritTree;
      let spirit: ISpirit | undefined;
      let isSeasonal = false;
      if (spiritTree?.spirit) {
        spirit = spiritTree.spirit;
      } else if (spiritTree?.ts) {
        spirit = spiritTree.ts.spirit;
        isSeasonal = true;
      } else if (spiritTree?.visit) {
        spirit = spiritTree.visit.spirit;
        isSeasonal = true;
      }

      if (spirit) {
        if (!spiritCount.has(spirit.guid)) {
          spiritCount.set(spirit.guid, { unlocked: 0, total: 0 });
        }
        const count = spiritCount.get(spirit.guid)!;
        count.total++;
        if (item.unlocked) { count.unlocked++; }

        if (isSeasonal) {
          seasonSpiritSet.add(spirit);
        } else {
          regularSpiritSet.add(spirit);
        }
      }
    }

    // Combine regular and seasonal spirits.
    const spirits = Array.from(regularSpiritSet).concat(Array.from(seasonSpiritSet));

    this.allRows = spirits.map(spirit => {
      const count = spiritCount.get(spirit.guid)!;
      return {
        ...spirit,
        ...count
      };
    });

    this._route.queryParamMap.subscribe(params => { this.onQueryChanged(params); });
  }

  private filterRows(): void {
    this.rows = this.type ? this.allRows.filter(row => row.type === this.type) : this.allRows;
    this.unlocked = this.rows.reduce((sum, row) => sum + row.unlocked, 0);
    this.total = this.rows.reduce((sum, row) => sum + row.total, 0);
  }
}
