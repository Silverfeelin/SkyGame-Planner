import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { INode, ISpiritTree, ItemType } from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CurrencyService } from '@app/services/currency.service';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';
import { CheckboxComponent } from '@app/components/shared/checkbox/checkbox.component';
import { SUBICONS_NO_SEASON } from '@app/components/item/icon/subicons/item-subicons.component';
import {
  DraftWarningComponent,
  SpiritTreeComponent,
  SpiritTreeNodeClickEvent
} from '@app/components/shared/shared-widgets';

@Component({
  selector: 'app-season-optimizer',
  templateUrl: './season-optimizer.component.html',
  styleUrl: './season-optimizer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, ReactiveFormsModule, MatIcon, DecimalPipe,
    OverlayComponent, CheckboxComponent, SpiritTreeComponent,
    DraftWarningComponent
  ]
})
export class SeasonOptimizerComponent {
  /** Every tree here belongs to the season being optimized, so the season badge is noise. */
  readonly SUBICONS_NO_SEASON = SUBICONS_NO_SEASON;

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

  readonly isDraft = !!this.season?.draft;

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
  readonly candlesFinalWithSuggestions = computed(() => this.candlesFinal() - this.knapsackTotalSc());

  readonly friendshipControls: ReadonlyArray<FormControl<number | null>> = this.trees.map(() => new FormControl(0));
  readonly friendshipValues = this.friendshipControls.map(c => toSignal(c.valueChanges, { initialValue: c.value }));
  /** Lowest friendship per tree that the unlocked items allow, rounded up. */
  readonly minimumFriendship: Array<number> = this.trees.map(() => 0);

  readonly missingFriendship = signal<ReadonlyArray<ReadonlyArray<number>>>([]);
  readonly missingFriendshipTotals = signal<ReadonlyArray<number>>([]);
  readonly missingFriendshipTotal = signal(0);
  readonly knapsackNodes = signal<ReadonlyArray<INode>>([]);
  readonly knapsackReachesTarget = signal(true);
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
        const tierNodes = tier.rows.flatMap(r => r).filter(n => n) as INode[];
        if (currentFriendship < this.tierUnlockCostCumulative[iTier] && tierNodes.some(n => n.unlocked)) {
          currentFriendship = this.tierUnlockCostCumulative[iTier];
        }
        if (iTier === tiers.length - 1) { return; }

        const tierFriendshipNodes = tier.rows.flat().filter(node => node && node.sc) as INode[];
        const friendshipPerNode = this.tierUnlockCost[iTier + 1] / tierFriendshipNodes.length;
        tierFriendshipNodes.forEach(node => {
          this.nodeValues[node.guid] = friendshipPerNode;
          if (node.unlocked) { currentFriendship += friendshipPerNode; }
        });
      });

      this.minimumFriendship[iTree] = Math.ceil(currentFriendship - EPSILON);
      if (currentFriendship > 0) {
        this.friendshipControls[iTree].setValue(this.minimumFriendship[iTree], { emitEvent: true });
      }
    });

    this.friendshipControls.forEach(control => {
      control.valueChanges.subscribe(() => this.calculate());
    });
    this.calculate();
  }

  onNodeClicked(evt: SpiritTreeNodeClickEvent): void {
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
    const knapsackPools: INode[][][] = this.trees.map(() => []);
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

        const tierFriendshipNodes = tier.rows.flat().filter(node => node && node.sc) as INode[];
        const tierAvailableNodes = tierFriendshipNodes.filter(node => !node.unlocked);
        const friendshipPerNode = this.tierUnlockCost[iTier + 1] / tierFriendshipNodes.length;
        const friendshipNeeded = this.tierUnlockCostCumulative[iTier + 1];

        const tierPool: INode[] = [];
        tierAvailableNodes.forEach(node => {
          if (wantNodeGuids.includes(node.guid)) {
            currentFriendship += friendshipPerNode;
            candlesRequired += (node.sc ?? 0);
          } else {
            tierPool.push(node);
          }
        });
        knapsackPools[iTree].push(tierPool);

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
    const option = this.knapsack(knapsackPools, missing, knapsackFriendship);
    const ks = option?.nodes ?? [];
    this.knapsackNodes.set(ks);
    this.knapsackReachesTarget.set(!option || option.points >= knapsackFriendship - EPSILON);
    this.knapsackTotalSc.set(ks.reduce((sum, n) => sum + (n.sc ?? 0), 0));
    this.knapsackTotalPoints.set(ks.reduce((sum, n) => sum + this.nodeValues[n.guid], 0));
  }

  /**
   * Finds the cheapest set of unwanted nodes that covers at least `target` of the missing friendship,
   * or the cheapest set that covers the most when no set covers it.
   * Friendship only counts towards its own tree, so each tree contributes at most its own missing friendship.
   */
  private knapsack(
    pools: ReadonlyArray<ReadonlyArray<ReadonlyArray<INode>>>,
    missing: ReadonlyArray<ReadonlyArray<number>>,
    target: number
  ): KnapsackOption | undefined {
    if (target <= 0) { return undefined; }

    let combined: Array<KnapsackOption> = [{ points: 0, cost: 0, nodes: [] }];
    pools.forEach((tierPools, iTree) => {
      const treeOptions = this.treeKnapsackOptions(tierPools, missing[iTree]);
      combined = paretoFront(combined.flatMap(a => treeOptions.map(b => ({
        points: a.points + b.points,
        cost: a.cost + b.cost,
        nodes: [...a.nodes, ...b.nodes]
      }))));
    });

    return combined.find(o => o.points >= target - EPSILON) ?? combined[combined.length - 1];
  }

  /** Lists the cheapest ways to cover each amount of missing friendship within a single tree. */
  private treeKnapsackOptions(
    tierPools: ReadonlyArray<ReadonlyArray<INode>>,
    tierMissing: ReadonlyArray<number>
  ): Array<KnapsackOption> {
    // A node can only be bought once its tier is unlocked, so its friendship covers that tier or above.
    // `carry` holds friendship bought in lower tiers that hasn't been needed yet.
    let states = new Map<string, KnapsackState>();
    addState(states, { points: 0, carry: 0, cost: 0, nodes: [] });

    let remaining = tierMissing.reduce((a, b) => a + b, 0);
    for (let iTier = 0; iTier < tierPools.length && remaining > EPSILON; iTier++) {
      for (const node of tierPools[iTier]) {
        const next = new Map(states);
        states.forEach(s => addState(next, {
          points: s.points,
          carry: Math.min(remaining, s.carry + this.nodeValues[node.guid]),
          cost: s.cost + (node.sc ?? 0),
          nodes: [...s.nodes, node]
        }));
        states = next;
      }

      const served = new Map<string, KnapsackState>();
      states.forEach(s => {
        const used = Math.min(s.carry, tierMissing[iTier]);
        addState(served, { ...s, points: s.points + used, carry: s.carry - used });
      });
      states = served;
      remaining -= tierMissing[iTier];
    }

    return paretoFront([...states.values()]);
  }
}

type KnapsackOption = { points: number; cost: number; nodes: Array<INode> };
type KnapsackState = KnapsackOption & { carry: number };

/** Friendship per node is fractional (e.g. 40 / 3), so sums need a tolerance. */
const EPSILON = 0.01;

function addState(states: Map<string, KnapsackState>, state: KnapsackState): void {
  const key = `${state.points.toFixed(2)}|${state.carry.toFixed(2)}`;
  const existing = states.get(key);
  if (!existing || state.cost < existing.cost) { states.set(key, state); }
}

/** Keeps only options that aren't beaten on both cost and points, sorted by ascending cost and points. */
function paretoFront<T extends KnapsackOption>(options: Array<T>): Array<T> {
  const sorted = [...options].sort((a, b) => a.cost - b.cost || b.points - a.points);
  const front: Array<T> = [];
  for (const option of sorted) {
    if (!front.length || option.points > front[front.length - 1].points + EPSILON) { front.push(option); }
  }
  return front;
}
