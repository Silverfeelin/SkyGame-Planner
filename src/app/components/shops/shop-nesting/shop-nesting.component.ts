import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IShop } from '@app/interfaces/shop.interface';
import { ISpirit } from '@app/interfaces/spirit.interface';
import { DataService } from '@app/services/data.service';
import { CardComponent } from "../../layout/card/card.component";
import { SpiritTreeComponent } from "../../spirit-tree/spirit-tree.component";
import { WikiLinkComponent } from "../../util/wiki-link/wiki-link.component";
import { ItemListComponent } from "../../item-list/item-list/item-list.component";
import { ParamMap } from '@angular/router';
import { IItemList, IItemListNode } from '@app/interfaces/item-list.interface';
import { nanoid } from 'nanoid';
import { DateTime } from 'luxon';
import { CostHelper } from '@app/helpers/cost-helper';
import { ICost } from '@app/interfaces/cost.interface';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { EventService } from '@app/services/event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Hardcoded because I doubt this will need frequent changing.
const rotations = [
  [ 'pk88jDrFaq', 'm1jq0R3vip', 'g0FAk-lWFi', 'pJ_qec46o4' ],
  [ '9ZDdv0TG9w', 'ch-1pp8DuT', 'i1RW5NFFGc', 'EQwb6KLMv5' ],
  [ 'QLPTcl6MON', 'whT_cZQrv5', 'raTbmXIzTD', 'uOQmeCxRGG' ],
  [ 'kjqZOiZkv8', 'rMl2rj9Qgv', '9HXJ6pJTXa', 'y1UR_gd2PM' ],
  [ '2If2D4W1DF', 'wbzLOXS8C_', '2d5HB466-h', 'v1NMHHJO7Q' ],
  [ 'R7mNhWclrv', 'AZv6JDJqdb', 'dJD-OBSWgc', 'UhsOYAJONq' ],
  [ 'PABCJmm2HT', '3tQqaibcJk', '-YUvzkL_uS', 'RK22qlqiJ5' ],
  [ 'gbOCxa6g06', '0o0Nvnd4gf', '8wRmxxKS7h', '_xcJueC0Rj' ],
  [ 'dYVs7we_4Q', 'x7ZD_lIDh_', 'snZQpzP822', 'W0x496lay7' ],
  [ 'kjqZOiZkv8', 'nZmPXeJKoF', '7pVaQBiTSo', 'fjJHoEZUoq' ],
  [ 'oa5rIbuWkA', 'TaOpfMm1Z1', '_igBIcu6Pg' ],
  [ 'PRSX9s-tGz', 'rtZSEy-6Rz', 'srZq8IciYN' ],
  [ '-_R3fzw7MF', 't3D6CbSY-E', 'FpXfl3Dpff', 'cqPAxA0gAc' ]
];

@Component({
  selector: 'app-shop-nesting',
  standalone: true,
  imports: [CardComponent, SpiritTreeComponent, WikiLinkComponent, ItemListComponent, CostComponent],
  templateUrl: './shop-nesting.component.html',
  styleUrl: './shop-nesting.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopNestingComponent {
  challengeSpirits: Array<ISpirit>;
  nestingWorkshop: IShop;

  highlightIap?: string;
  highlightNode?: string;

  iRotation = 0;
  itemLists: Array<IItemList> = [];
  freeItemList!: IItemList;
  correctionItemList!: IItemList;
  cost!: ICost;
  remainingCost!: ICost;

  workshopNodeMap: { [guid: string]: IItemListNode } = {};
  workshopItemNodeMap: { [guid: string]: IItemListNode } = {};

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService
  ) {
    this.challengeSpirits = [ 'os6ryCdFZ5', 'Gp-hW_NCv_', 'IhAh5oTvF8' ].map(g => this._dataService.guidMap.get(g)!) as Array<ISpirit>;
    this.nestingWorkshop = _dataService.guidMap.get('he4MHA7_uC') as IShop;
    this.initializeRotations();
    this.updateCost();

    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(() => this.updateCost());
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightIap = p.get('highlightIap') || undefined;
    this.highlightNode = p.get('highlightNode') || undefined;
  }

  private initializeRotations(): void {
    this.workshopItemNodeMap = {};
    this.workshopNodeMap = {};
    for (const node of this.nestingWorkshop.itemList!.items) {
      this.workshopItemNodeMap[node.item.guid] = node;
      this.workshopNodeMap[node.guid] = node;
    }

    // Calculate rotation based on the week number since rotation 1.
    const start = DateTime.fromISO('2024-04-15');
    const today = DateTime.now().startOf('week');
    const weeksBetween = Math.ceil(today.diff(start, 'weeks').weeks);
    this.iRotation = weeksBetween % rotations.length;

    this.itemLists = rotations.map<IItemList>((r, i) => ({
      guid: nanoid(10),
      items:  r.map(guid => this.workshopItemNodeMap[guid]),
      title: `Rotation ${i + 1}`
    }));

    // Add a list for items that are or were temporarily free.
    const freeNodes = [ '_qe1M1aTek' ].map(g => this.workshopNodeMap[g]);
    this.freeItemList = {
      guid: nanoid(10),
      items: freeNodes
    };

    const correctionNodes = [ 'M-n46rmsiI', '521NL_oVIS' ].map(g => this.workshopNodeMap[g]);
    this.correctionItemList = {
      guid: nanoid(10),
      items: correctionNodes
    };
  }

  private updateCost(): void {
    this.cost = CostHelper.create();
    this.remainingCost = CostHelper.create();
    for (const node of Object.values(this.workshopItemNodeMap)) {
      CostHelper.add(this.cost, node);
      if (!node.item.unlocked) {
        CostHelper.add(this.remainingCost, node);
      }
    }
  }
}
