import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { INode, ISpiritTree, ItemType } from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CurrencyService } from '@app/services/currency.service';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';
import { CheckboxComponent } from '@app/components/layout/checkbox/checkbox.component';
import {
  AtmosSpiritTreeComponent,
  AtmosSpiritTreeNodeClickEvent
} from '@app/redesign/shared/atmos-shared-widgets';

@Component({
  selector: 'app-atmos-season-optimizer',
  templateUrl: './atmos-season-optimizer.component.html',
  styleUrl: './atmos-season-optimizer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, ReactiveFormsModule, MatIcon,
    OverlayComponent, CheckboxComponent, AtmosSpiritTreeComponent
  ]
})
export class AtmosSeasonOptimizerComponent {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _currencyService = inject(CurrencyService);

  readonly season = DateHelper.getActive(this._dataService.seasonConfig.items);
  readonly trees: ReadonlyArray<ISpiritTree> =
    (this.season?.spirits.filter(s => s.type === 'Season').map(s => s.tree).filter(t => t?.tier) ?? []) as ISpiritTree[];
  readonly nodes: ReadonlyArray<INode> = this.trees.flatMap(t => TreeHelper.getNodes(t)).filter(n => n) as INode[];
  readonly nodeGuids = new Set(this.nodes.map(n => n.guid));

  readonly hasSeasonPass = signal(!!this.season && this._storageService.hasSeasonPass(this.season.guid));
  readonly hasDoneDailiesToday = signal(false);

  readonly want = signal<{ [guid: string]: INode }>({});
  readonly wantNodeGuids = computed(() => Object.values(this.want()).map(n => n.guid));

  // Hardcoded tier costs (mirrors legacy).
  readonly tierUnlockCost: ReadonlyArray<number> = [0, 40, 60, 80, 100];
  readonly tierUnlockCostCumulative: ReadonlyArray<number> = [0, 40, 100, 180, 280];

  readonly today = DateHelper.todaySky();
  readonly daysLeftSeason = this.season ? DateHelper.daysBetween(this.today, this.season.endDate!) : 0;
  readonly daysLeft = signal(this.daysLeftSeason);
  readonly daysFriendshipLeft = computed(() => this.daysLeft() * 10);

  readonly candleControl = new FormControl(
    this._storageService.getCurrencies().seasonCurrencies[this.season?.guid ?? '']?.candles || 0
  );
  readonly candlesOwned = toSignal(this.candleControl.valueChanges, { initialValue: this.candleControl.value });
  readonly candlesLeft = computed(() => this.hasSeasonPass() ? this.daysLeft() * 6 : this.daysLeft() * 5);
  readonly candlesRequired = signal(0);
  readonly candlesFinal = computed(() => (this.candlesOwned() ?? 0) + this.candlesLeft() - this.candlesRequired());

  readonly friendshipControls: ReadonlyArray<FormControl<number | null>> = this.trees.map(() => new FormControl(0));
  readonly friendshipValues = this.friendshipControls.map(c => toSignal(c.valueChanges, { initialValue: c.value }));

  readonly missingFriendship = signal<ReadonlyArray<ReadonlyArray<number>>>([]);
  readonly missingFriendshipTotals = signal<ReadonlyArray<number>>([]);
  readonly missingFriendshipTotal = signal(0);
  readonly knapsackNodes = signal<ReadonlyArray<INode>>([]);
  readonly knapsackTotalSc = signal(0);
  readonly knapsackTotalPoints = signal(0);

  readonly nodeValues: { [guid: string]: number } = {};
  readonly showingFriendshipHelp = signal(false);

  constructor() {
    this.candleControl.valueChanges.subscribe(c => {
      if (!this.season || typeof c !== 'number' || isNaN(c) || c < 0) { return; }
      this._currencyService.setSeasonCurrency(this.season.guid, c);
    });

    const savedWantNodes = JSON.parse(this._storageService.getKey('migration.optimizer') || '[]') as string[];
    if (savedWantNodes.length > 0) {
      const guids = savedWantNodes.filter(guid => this.nodeGuids.has(guid));
      const mapped = Object.fromEntries(
        guids.map(guid => [guid, this._dataService.guidMap.get(guid) as INode])
      );
      this.want.set(mapped);
    }

    this.trees.forEach((tree, iTree) => {
      const tiers = TreeHelper.getTiers(tree);
      let currentFriendship = 0;
      tiers.forEach((tier, iTier) => {
        if (iTier === tiers.length - 1) { return; }

        const tierNodes = tier.rows.flatMap(r => r).filter(n => n) as INode[];
        if (currentFriendship < this.tierUnlockCostCumulative[iTier] && tierNodes.some(n => n.unlocked)) {
          currentFriendship = this.tierUnlockCostCumulative[iTier];
        }

        const tierFriendshipNodes = tier.rows.flat().filter((node, iNode) => iNode < 2 && node) as INode[];
        const friendshipPerNode = this.tierUnlockCost[iTier + 1] / tierFriendshipNodes.length;
        tierFriendshipNodes.forEach(node => {
          this.nodeValues[node.guid] = friendshipPerNode;
          if (node.unlocked) { currentFriendship += friendshipPerNode; }
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

  onNodeClicked(evt: AtmosSpiritTreeNodeClickEvent): void {
    this.want.update(v => {
      const next = { ...v };
      if (next[evt.node.guid]) { delete next[evt.node.guid]; }
      else { next[evt.node.guid] = evt.node; }
      return next;
    });
    this._storageService.setKey('migration.optimizer', JSON.stringify(Object.keys(this.want())));
    this.calculate();
  }

  highlightEverything(): void { this.highlightFunc(n => !!n.item); }
  highlightCosmetics(): void {
    const itemTypeSet = new Set<ItemType>([
      ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes, ItemType.Mask,
      ItemType.FaceAccessory, ItemType.Necklace, ItemType.Hair,
      ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Cape,
      ItemType.Held, ItemType.Furniture, ItemType.Prop
    ]);
    this.highlightFunc(n => n.item ? itemTypeSet.has(n.item.type) : false);
  }
  highlightEmotes(): void { this.highlightFunc(n => n.item?.type === ItemType.Emote); }
  highlightMusic(): void { this.highlightFunc(n => n.item?.type === ItemType.Music); }
  highlightSeasonHearts(): void { this.highlightFunc(n => n.item?.name === 'Season Heart'); }
  highlightSeasonPass(): void { this.highlightFunc(n => n.item?.group === 'SeasonPass'); }

  highlightKnapsack(): void {
    let changed = false;
    const want = { ...this.want() };
    this.knapsackNodes().forEach(node => {
      if (!node?.item) { return; }
      want[node.guid] = node;
      changed = true;
    });
    if (changed) {
      this.want.set(want);
      this._storageService.setKey('migration.optimizer', JSON.stringify(Object.keys(this.want())));
      this.calculate();
    }
  }

  private highlightFunc(predicate: (n: INode) => boolean): void {
    let changed = false;
    const want = { ...this.want() };
    this.trees.forEach(tree => {
      const ns = TreeHelper.getNodes(tree);
      ns.forEach(node => {
        if (!node?.item) { return; }
        if (predicate(node)) { want[node.guid] = node; changed = true; }
      });
    });
    if (changed) {
      this.want.set(want);
      this._storageService.setKey('migration.optimizer', JSON.stringify(Object.keys(this.want())));
      this.calculate();
    }
  }

  promptResetHighlight(): void {
    if (!confirm('Are you sure you want to reset all highlighted items?')) { return; }
    this.want.set({});
    this._storageService.setKey('migration.optimizer', JSON.stringify([]));
    this.calculate();
  }

  toggleHaveSeasonPass(): void {
    if (!this.season) { return; }
    this.hasSeasonPass.update(v => !v);
    this.hasSeasonPass()
      ? this._storageService.addSeasonPasses(this.season.guid)
      : this._storageService.removeSeasonPasses(this.season.guid);
    this._storageService.removeGifted(this.season.guid);
    this.calculate();
  }

  toggleToday(): void {
    this.hasDoneDailiesToday.update(v => !v);
    this.daysLeft.set(this.hasDoneDailiesToday() ? this.daysLeftSeason - 1 : this.daysLeftSeason);
    this.calculate();
  }

  calculate(): void {
    const wantNodeGuids = this.wantNodeGuids();
    const knapsackPool: Array<INode> = [];
    const totals: number[] = Array(this.trees.length).fill(0);
    const missing: number[][] = Array(this.trees.length).fill([]).map(() => []);

    let candlesRequired = 0;
    this.trees.forEach((tree, iTree) => {
      const tiers = TreeHelper.getTiers(tree);

      let requiredFriendship = 0;
      tiers.forEach((tier, iTier) => {
        if (tier.rows.some(row => row.some(node => node && wantNodeGuids.includes(node.guid) && !node.unlocked))) {
          requiredFriendship = this.tierUnlockCostCumulative[iTier];
        }
      });

      let currentFriendship = this.friendshipValues[iTree]() ?? 0;
      tiers.forEach((tier, iTier) => {
        if (iTier === tiers.length - 1) {
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

        tierAvailableNodes.forEach(node => {
          if (wantNodeGuids.includes(node.guid)) {
            currentFriendship += friendshipPerNode;
            candlesRequired += (node.sc ?? 0);
          } else {
            knapsackPool.push(node);
          }
        });

        if (currentFriendship >= requiredFriendship) {
          missing[iTree].push(0);
        } else {
          missing[iTree].push(Math.max(0, friendshipNeeded - currentFriendship));
          if (friendshipNeeded > currentFriendship) { currentFriendship = friendshipNeeded; }
        }
      });

      totals[iTree] = missing[iTree].reduce((a, b) => a + b, 0);
    });

    this.candlesRequired.set(candlesRequired);
    this.missingFriendship.set(missing);
    this.missingFriendshipTotals.set(totals);
    const total = totals.reduce((a, b) => a + b, 0);
    this.missingFriendshipTotal.set(total);

    const knapsackFriendship = total - this.daysFriendshipLeft();
    const ks = this.knapsack(knapsackPool, knapsackFriendship) ?? [];
    this.knapsackNodes.set(ks);
    this.knapsackTotalSc.set(ks.reduce((sum, n) => sum + (n.sc ?? 0), 0));
    this.knapsackTotalPoints.set(ks.reduce((sum, n) => sum + this.nodeValues[n.guid], 0));
  }

  private knapsack(nodes: Array<INode>, target: number): Array<INode> | undefined {
    if (target <= 0 || nodes.length === 0) { return undefined; }
    const max = nodes.reduce((sum, n) => sum + this.nodeValues[n.guid], 0);
    const dp = Array(max + 1).fill(null) as Array<INode>[] | null[];
    dp[0] = [];

    for (const node of nodes) {
      for (let p = max; p >= this.nodeValues[node.guid]; p--) {
        const prev = dp[p - this.nodeValues[node.guid]];
        if (prev !== null) {
          const newSet = [...prev, node];
          const newCost = newSet.reduce((sum, n) => sum + (n.sc ?? 0), 0);
          const oldCost = dp[p]?.reduce((sum, n) => sum + (n.sc ?? 0), 0) ?? Infinity;
          if (newCost < oldCost) { dp[p] = newSet; }
        }
      }
    }

    let best: Array<INode> | undefined;
    let bestCost = Infinity;
    for (let p = target; p <= max; p++) {
      const set = dp[p];
      if (set) {
        const cost = set.reduce((sum, n) => sum + (n.sc ?? 0), 0);
        if (cost < bestCost) { best = set; bestCost = cost; }
      }
    }
    return best;
  }
}
