import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SpiritTreeComponent, SpiritTreeNodeClickEvent } from '@app/components/spirit-tree/spirit-tree.component';
import { DateHelper } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { INode } from '@app/interfaces/node.interface';
import { ISeason } from '@app/interfaces/season.interface';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { DataService } from 'src/app/services/data.service';
import { MatIcon } from "@angular/material/icon";
import { StorageService } from '@app/services/storage.service';
import { ItemType } from '@app/interfaces/item.interface';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';
import { CheckboxComponent } from "@app/components/layout/checkbox/checkbox.component";
import { CurrencyService } from '@app/services/currency.service';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-migration-optimizer',
    templateUrl: './migration-optimizer.component.html',
    styleUrls: ['./migration-optimizer.component.less'],
    imports: [SpiritTreeComponent, OverlayComponent, ReactiveFormsModule, MatIcon, CheckboxComponent, RouterLink]
})
export class MigrationOptimizerComponent {
  dataService = inject(DataService);
  storageService = inject(StorageService);
  currencyService = inject(CurrencyService);

  trees = [
    "ko9lr8M4J5", "zK7AFf0rvZ", "nCGzsegB0l", "iFANrbgSY4", "nrvSEyff0h"
  ].map(id => this.dataService.guidMap.get(id) as ISpiritTree);
  season = this.dataService.guidMap.get('wslfxJ5HZJ') as ISeason;
  hasSeasonPass = signal(this.storageService.hasSeasonPass(this.season.guid));
  hasDoneDailiesToday = false;

  want = signal<{ [guid: string]: INode }>({});
  wantNodeGuids = computed(() => Object.values(this.want()).map(n => n.guid));

  tierUnlockCost = [ 0, 40, 60, 80, 100 ];
  tierUnlockCostCumulative = [ 0, 40, 100, 180, 280 ];

  today = DateHelper.todaySky();
  daysLeftSeason = DateHelper.daysBetween(this.today, this.season.endDate!);
  daysLeft = signal(this.daysLeftSeason);
  daysFriendshipLeft = computed(() => this.daysLeft() * 10);

  candleControl = new FormControl(this.storageService.getCurrencies().seasonCurrencies[this.season.guid]?.candles || 0);
  candlesOwned = toSignal(this.candleControl.valueChanges, { initialValue: this.candleControl.value });
  candlesLeft = computed(() => this.hasSeasonPass() ? this.daysLeft() * 6  : this.daysLeft() * 5);
  candlesRequired = signal(0);
  candlesFinal = computed(() => (this.candlesOwned() ?? 0) + this.candlesLeft() - this.candlesRequired());

  nodeValues: { [ guid: string]: number } = {};

  friendshipControls = this.trees.map(_ => new FormControl(0));
  friendshipValues = this.friendshipControls.map((c) => {
    return toSignal(c.valueChanges, { initialValue: c.value });
  });

  missingFriendship = [ [0], [0], [0], [0], [0] ];
  missingFriendshipTotals = [ 0, 0, 0, 0, 0];
  missingFriendshipTotal = 0;
  showingFriendshipHelp = false;

  knapsackNodes: Array<INode> = [];
  knapsackTotalSc = 0;
  knapsackTotalPoints = 0;

  constructor() {
    this.candleControl.valueChanges.subscribe(c => {
      if (typeof c !== 'number' || isNaN(c) || c < 0) { return; }
      this.currencyService.setSeasonCurrency(this.season.guid, c);
    });

    const savedWantNodes = JSON.parse(this.storageService.getKey('migration.optimizer') || '[]') as string[];
    if (savedWantNodes.length > 0) {
      const mapped = Object.fromEntries(
        savedWantNodes.map(guid => [guid, this.dataService.guidMap.get(guid) as INode])
      );
      this.want.set(mapped);
    }

    this.nodeValues = {};
    this.trees.forEach((tree, iTree) => {
      const tiers = TreeHelper.getTiers(tree);
      let currentFriendship = 0;
      tiers.forEach((tier, iTier) => {
        if (iTier === tiers.length - 1) { return; } // No need to check last tier.

        // Assign minimum points based on unlock within tier (#434)
        const tierNodes = tier.rows.flatMap(r => r).filter(n => n) as INode[];
        if (currentFriendship < this.tierUnlockCostCumulative[iTier] && tierNodes.some(n => n.unlocked)) {
          currentFriendship = this.tierUnlockCostCumulative[iTier];
        }

        // Add points from this tier.
        const tierFriendshipNodes = tier.rows.flat().filter((node, iNode) => iNode < 2 && node) as INode[];
        const friendshipPerNode = this.tierUnlockCost[iTier + 1] / tierFriendshipNodes.length;
        tierFriendshipNodes.forEach(node => {
          this.nodeValues[node.guid] = friendshipPerNode;
          if (node.unlocked) {
            currentFriendship += friendshipPerNode;
          }
        });
      });

      if (currentFriendship > 0) {
        this.friendshipControls[iTree].setValue(currentFriendship, { emitEvent: true });
      }
    });

    this.friendshipControls.forEach(control => {
      control.valueChanges.subscribe(() => this.calculate());
    });
    this.calculate();
  }

  onNodeClicked(evt: SpiritTreeNodeClickEvent): void {
    this.want.update(v => {
      v[evt.node.guid] ? delete v[evt.node.guid] : v[evt.node.guid] = evt.node;
      return { ...v };
    });
    this.storageService.setKey('migration.optimizer', JSON.stringify(Object.keys(this.want())));
    this.calculate();
  }

  highlightEverything(): void {
    this.highlightFunc(node => !!node.item);
  }

  highlightCosmetics(): void {
    const itemTypeSet = new Set<ItemType>([
      ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes, ItemType.Mask,
      ItemType.FaceAccessory, ItemType.Necklace, ItemType.Hair,
      ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Cape,
      ItemType.Held, ItemType.Furniture, ItemType.Prop
    ]);

    this.highlightFunc(node => node.item ? itemTypeSet.has(node.item.type) : false);
  }

  highlightEmotes(): void {
    this.highlightFunc(node => node.item?.type === ItemType.Emote);
  }

  highlightMusic(): void {
    this.highlightFunc(node => node.item?.type === ItemType.Music);
  }

  highlightSeasonHearts(): void {
    this.highlightFunc(node => node.item?.name === 'Season Heart');
  }

  highlightSeasonPass(): void {
    this.highlightFunc(node => node.item?.group === 'SeasonPass');
  }

  highlightKnapsack(): void {
    let changed = false;
    const want = { ...this.want() };
    this.knapsackNodes?.forEach(node => {
      if (!node?.item) { return; }
      want[node.guid] = node;
      changed = true;
    });

    if (changed) {
      this.want.set(want);
      this.storageService.setKey('migration.optimizer', JSON.stringify(Object.keys(this.want())));
      this.calculate();
    }
  }

  private highlightFunc(predicate: (node: INode) => boolean): void {
    let changed = false;
    const want = { ...this.want() };
    this.trees.forEach(tree => {
      const nodes = TreeHelper.getNodes(tree);
      nodes.forEach(node => {
        if (!node?.item) { return; }
        if (predicate(node)) {
          want[node.guid] = node;
          changed = true;
        }
      });
    });
    if (changed) {
      this.want.set(want);
      this.storageService.setKey('migration.optimizer', JSON.stringify(Object.keys(this.want())));
      this.calculate();
    }
  }

  promptResetHighlight(): void {
    if (!confirm('Are you sure you want to reset all highlighted items?')) { return; }
    this.want.set({});
    this.storageService.setKey('migration.optimizer', JSON.stringify([]));
    this.calculate();
  }

  toggleHaveSeasonPass(): void {
    this.hasSeasonPass.set(!this.hasSeasonPass());
    this.hasSeasonPass()
      ? this.storageService.addSeasonPasses(this.season.guid)
      : this.storageService.removeSeasonPasses(this.season.guid);
    this.storageService.removeGifted(this.season.guid);
    this.calculate();
  }

  toggleToday(): void {
    this.hasDoneDailiesToday = !this.hasDoneDailiesToday;
    this.daysLeft.set(this.hasDoneDailiesToday ? this.daysLeftSeason - 1 : this.daysLeftSeason);
    this.calculate();
  }

  calculate(): void {
    const wantNodeGuids = this.wantNodeGuids();
    const knapsackNodes: Array<INode> = [];
    this.missingFriendshipTotals = [ 0, 0, 0, 0, 0 ];
    this.missingFriendship = [ [], [], [], [], [] ];

    let candlesRequired = 0;
    this.trees.forEach((tree, iTree) => {
      const tiers = TreeHelper.getTiers(tree);

      // Check how many total points are needed.
      let requiredFriendship = 0;
      tiers.forEach((tier, iTier) => {
        if (tier.rows.some(row => row.some(node => node && wantNodeGuids.includes(node.guid) && !node.unlocked))) {
          requiredFriendship = this.tierUnlockCostCumulative[iTier];
        }
      });

      // Check how many points are guaranteed through desired nodes.
      let currentFriendship = this.friendshipValues[iTree]() ?? 0;
      tiers.forEach((tier, iTier) => {
        // Last tier
        if (iTier === tiers.length - 1) {
          // Add SP cost nodes (#434)
          tier.rows
            .flatMap(r => r)
            .filter(n => n && !n.unlocked && wantNodeGuids.includes(n.guid))
            .forEach(n => { candlesRequired += (n!.sc ?? 0); });
          return;
        }

        const tierFriendshipNodes = tier.rows.flat().filter((node, iNode) => iNode < 2 && node) as INode[];
        const tierAvailableNodes = tierFriendshipNodes.filter(node => !node.unlocked);
        const friendshipPerNode = this.tierUnlockCost[iTier + 1] / tierFriendshipNodes.length;
        const friendshipNeeded = this.tierUnlockCostCumulative[iTier + 1];

        // Add guaranteed nodes. Undesired nodes go into knapsack algorithm.
        tierAvailableNodes.forEach(node => {
          if (wantNodeGuids.includes(node.guid)) {
            currentFriendship += friendshipPerNode;
            candlesRequired += (node.sc ?? 0);
          } else {
            knapsackNodes.push(node);
          }
        });

        if (currentFriendship >= requiredFriendship) {
          this.missingFriendship[iTree].push(0);
        } else {
          this.missingFriendship[iTree].push(Math.max(0, friendshipNeeded - currentFriendship));
          if (friendshipNeeded > currentFriendship) {
            currentFriendship = friendshipNeeded;
          }
        }
      });

      this.missingFriendshipTotals[iTree] = this.missingFriendship[iTree].reduce((a, b) => a + b, 0);
    });

    this.candlesRequired.set(candlesRequired);
    this.missingFriendshipTotal = this.missingFriendshipTotals.reduce((a, b) => a + b, 0);
    const knapsackFriendship = this.missingFriendshipTotal - this.daysFriendshipLeft();
    this.knapsackNodes = this.knapsack(knapsackNodes, knapsackFriendship) ?? [];
    this.knapsackTotalSc = this.knapsackNodes.reduce((sum, n) => sum + (n.sc ?? 0), 0);
    this.knapsackTotalPoints = this.knapsackNodes.reduce((sum, n) => sum + this.nodeValues[n.guid], 0);
  }

  knapsack(nodes: Array<INode>, target: number): Array<INode> | undefined {
    if (target <= 0 || nodes.length === 0) { return undefined; }
    const max = nodes.reduce((sum, node) => sum + this.nodeValues[node.guid], 0);
    const dp = Array(max + 1).fill(null) as Array<INode>[] | null[];
    dp[0] = [];

    for (const node of nodes) {
      for (let p = max; p >= this.nodeValues[node.guid]; p--) {
        const prev = dp[p - this.nodeValues[node.guid]];
        if (prev !== null) {
          const newSet = [...prev, node];
          const newCost = newSet.reduce((sum, n) => sum + (n.sc ?? 0), 0);
          const oldCost = dp[p]?.reduce((sum, n) => sum + (n.sc ?? 0), 0) ?? Infinity;

          if (newCost < oldCost) {
            dp[p] = newSet;
          }
        }
      }
    }

    let best: Array<INode> | undefined = undefined;
    let bestCost = Infinity;

    for (let p = target; p <= max; p++) {
      const set = dp[p];
      if (set) {
        const cost = set.reduce((sum, n) => sum + (n.sc ?? 0), 0);
        if (cost < bestCost) {
          best = set;
          bestCost = cost;
        }
      }
    }

    return best;
  }
}
