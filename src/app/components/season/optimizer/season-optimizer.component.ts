import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IItem, INode, ISpiritTree, ItemType } from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { SeasonHelper } from '@app/helpers/season-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CurrencyService } from '@app/services/currency.service';
import { DailyCheckinService } from '@app/services/daily-checkin.service';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { NodeService } from '@app/services/node.service';
import { SeasonPlan, SeasonPlanNode, SeasonPlanRenderService } from '@app/services/season-plan-render.service';
import { SpiritTreeRenderService } from '@app/services/spirit-tree-render.service';
import { StorageService } from '@app/services/storage.service';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';
import { SUBICONS_NO_SEASON } from '@app/components/item/icon/subicons/item-subicons.component';
import { NodeComponent } from '@app/components/spirit/node/node.component';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { DraftWarningComponent } from '@app/components/shared/shared-widgets';
import { DateTimePipe } from '@app/pipes/date-time.pipe';

const TIER_COST: ReadonlyArray<number> = [0, 40, 60, 80, 100];
const TIER_CUMULATIVE: ReadonlyArray<number> = [0, 40, 100, 180, 280];
const MAX_FRIENDSHIP = 280;
/** A spirit adventure (accompanying a spirit) always gives 10 friendship. */
const ACCOMPANY_POINTS = 10;

const WANT_KEY = 'migration.optimizer';
const ACCOMPANY_KEY = 'optimizer.accompany';
const ADVENTURE_KEY = 'optimizer.adventure';

/** `plan` cycles an item through unplanned, planned and owned. */
type NodeAction = 'plan' | 'navigate' | 'favourite';
type ExportMode = 'clipboard' | 'share' | 'download';
type RailKind = 'items' | 'accompany' | 'selected' | 'needed';
type StarState = 'reached' | 'selected' | 'short' | 'none';

interface FriendshipLayer { kind: RailKind; from: number; to: number; }
interface RailLayer { kind: RailKind; bottom: number; height: number; }
interface Star { points: number; state: StarState; short: number; days: number; }
interface TierView { index: number; rows: ReadonlyArray<ReadonlyArray<INode | undefined>>; }

interface TreeCalc {
  itemPoints: number;
  accompany: number;
  /** Lowest accompany points that still reach the highest tier with an unlocked item. */
  friendship: number;
  /** Friendship needed to reach the highest tier with a selected item. */
  required: number;
  /** Friendship once every planned item is bought and the shortfall is accompanied. */
  planned: number;
  missing: ReadonlyArray<number>;
  missingTotal: number;
  accompanyDays: number;
  /** Rail layers for each tier's own stretch, indexed by tier. */
  rails: ReadonlyArray<ReadonlyArray<RailLayer>>;
  /** Star above each tier, indexed by tier; the top tier has none. */
  stars: ReadonlyArray<Star | undefined>;
  candlesSelected: number;
  candlesSpent: number;
  candlesTotal: number;
  pools: ReadonlyArray<ReadonlyArray<INode>>;
}

interface Adventure { date: string; tree: string; }

@Component({
  selector: 'app-season-optimizer',
  templateUrl: './season-optimizer.component.html',
  styleUrl: './season-optimizer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, OverlayComponent, NodeComponent, DraftWarningComponent, TooltipDirective, ItemIconComponent, DateTimePipe]
})
export class SeasonOptimizerComponent {
  /** Every tree here belongs to the season being optimized, so the season badge is noise. */
  readonly SUBICONS_NO_SEASON = SUBICONS_NO_SEASON;
  readonly MAX_FRIENDSHIP = MAX_FRIENDSHIP;
  readonly TIER_CUMULATIVE = TIER_CUMULATIVE;

  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _router = inject(Router);
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _nodeService = inject(NodeService);
  private readonly _eventService = inject(EventService);
  private readonly _dailyCheckinService = inject(DailyCheckinService);
  private readonly _planRenderService = inject(SeasonPlanRenderService);
  private readonly _treeRenderService = inject(SpiritTreeRenderService);

  readonly today = DateHelper.todaySky();
  private readonly _todayKey = this.today.toFormat('yyyy-MM-dd');

  readonly season = SeasonHelper.getPlannedSeason(this._dataService.seasonConfig.items);
  /** Before the season starts, today's check-in and adventure don't count towards it. */
  readonly isUpcoming = !!this.season && this.season.date > this.today;
  readonly trees: ReadonlyArray<ISpiritTree> =
    (this.season?.spirits.filter(s => s.type === 'Season').map(s => s.tree).filter(t => t?.tier) ?? []) as ISpiritTree[];
  readonly nodes: ReadonlyArray<INode> = this.trees.flatMap(t => TreeHelper.getNodes(t)).filter(n => n) as INode[];
  readonly nodeGuids = new Set(this.nodes.map(n => n.guid));

  /** Tiers top to bottom with rows top to bottom, the order they are drawn in. */
  readonly treeTiers: ReadonlyArray<ReadonlyArray<TierView>> = this.trees.map(tree =>
    TreeHelper.getTiers(tree)
      .map((tier, index) => ({ index, rows: tier.rows.map(r => [r[0] ?? undefined, r[1] ?? undefined, r[2] ?? undefined]).reverse() }))
      .reverse()
  );
  private readonly _tierNodes: ReadonlyArray<ReadonlyArray<ReadonlyArray<INode>>> = this.trees.map(tree =>
    TreeHelper.getTiers(tree).map(tier => tier.rows.flat().filter(n => n) as INode[])
  );
  private readonly _nodeTier = new Map<string, number>();
  private readonly _nodeTree = new Map<string, number>();

  readonly isDraft = !!this.season?.draft;
  readonly daysLeftSeason = this.season
    ? DateHelper.daysBetween(this.isUpcoming ? this.season.date : this.today, this.season.endDate!)
    : 0;

  /** Bumped whenever unlocks or currencies change, since nodes are mutated in place. */
  private readonly _refresh = signal(0);

  readonly seasonPass = computed(() => {
    this._refresh();
    const guid = this.season?.guid ?? '';
    const gifted = this._storageService.hasGifted(guid);
    return { bought: !gifted && this._storageService.hasSeasonPass(guid), gifted };
  });
  readonly hasSeasonPass = computed(() => this.seasonPass().bought || this.seasonPass().gifted);
  readonly checkedIn = signal(this._dailyCheckinService.isCheckedIn());
  readonly adventure = signal<Adventure | undefined>(undefined);
  readonly accompanyStored = signal<{ [treeGuid: string]: number }>({});
  readonly want = signal<ReadonlySet<string>>(new Set());
  readonly wantNodeGuids = computed(() => [...this.want()]);

  readonly nodeAction = signal<NodeAction>('plan');
  readonly meterTree = signal<number | undefined>(undefined);
  readonly showingFriendshipHelp = signal(false);

  /** Copies of items from this season, so the explainer shows each state regardless of what the user owns. */
  readonly demoItems = this.createDemoItems();

  /** Friendship per node; nodes in a tier share the cost of the next tier. */
  readonly nodeValues: { [guid: string]: number } = {};

  readonly candles = computed(() => {
    this._refresh();
    return this._storageService.getCurrencies().seasonCurrencies[this.season?.guid ?? '']?.candles || 0;
  });

  /** Today's season candles and today's spirit adventure are logged separately, so each counts its own days. */
  readonly candleDaysLeft = computed(() => Math.max(0, this.daysLeftSeason - (!this.isUpcoming && this.checkedIn() ? 1 : 0)));
  readonly accompanyDaysLeft = computed(() => Math.max(0, this.daysLeftSeason - (this.adventure()?.date === this._todayKey ? 1 : 0)));
  readonly candlesPerDay = computed(() => this.hasSeasonPass() ? 6 : 5);
  readonly candlesToEarn = computed(() => this.candleDaysLeft() * this.candlesPerDay());

  readonly calcs = computed<ReadonlyArray<TreeCalc>>(() => {
    this._refresh();
    const want = this.want();
    const stored = this.accompanyStored();
    this.hasSeasonPass();
    return this.trees.map((tree, iTree) => this.calculateTree(iTree, want, stored[tree.guid] ?? 0));
  });

  readonly candlesRequired = computed(() => this.calcs().reduce((sum, c) => sum + c.candlesSelected, 0));
  readonly candlesFinal = computed(() => this.candles() + this.candlesToEarn() - this.candlesRequired());
  readonly missingTotal = computed(() => this.calcs().reduce((sum, c) => sum + c.missingTotal, 0));
  readonly accompanyDays = computed(() => this.calcs().reduce((sum, c) => sum + c.accompanyDays, 0));
  readonly accompanyDaysFit = computed(() => this.accompanyDays() <= this.accompanyDaysLeft());
  readonly markedNeedingPass = computed(() => {
    this._refresh();
    return this.nodes.filter(n => this.isSelected(n) && this.needsPass(n)).length;
  });
  /** Season Pass items in tiers the plan reaches that are neither planned nor owned. */
  readonly unmarkedPassItems = computed(() => {
    if (!this.hasSeasonPass()) { return []; }
    const want = this.want();
    const calcs = this.calcs();
    return this.nodes.filter(n => {
      if (!isPassItem(n) || n.unlocked || want.has(n.guid)) { return false; }
      return calcs[this.treeOf(n)].planned >= TIER_CUMULATIVE[this._nodeTier.get(n.guid) ?? 0] - EPSILON;
    });
  });

  readonly knapsack = computed(() => {
    const calcs = this.calcs();
    const target = this.missingTotal() - this.accompanyDaysLeft() * ACCOMPANY_POINTS;
    const option = this.findKnapsack(calcs.map(c => c.pools), calcs.map(c => c.missing), target);
    const nodes = option?.nodes ?? [];
    return {
      nodes,
      reachesTarget: !option || option.points >= target - EPSILON,
      candles: nodes.reduce((sum, n) => sum + (n.sc ?? 0), 0),
      points: nodes.reduce((sum, n) => sum + this.nodeValues[n.guid], 0)
    };
  });

  constructor() {
    this.trees.forEach((tree, iTree) => {
      this._tierNodes[iTree].forEach((tierNodes, iTier) => {
        tierNodes.forEach(n => { this._nodeTier.set(n.guid, iTier); this._nodeTree.set(n.guid, iTree); });
        if (iTier >= TIER_COST.length - 1) { return; }
        // Free items give friendship too, except accompanying (counted separately) and the Season Pass gifts.
        const earning = tierNodes.filter(n => n.sc || (!this.isAccompanyNode(n) && !isPassItem(n)));
        earning.forEach(n => this.nodeValues[n.guid] = TIER_COST[iTier + 1] / earning.length);
      });
    });

    const savedWant = JSON.parse(this._storageService.getKey<string>(WANT_KEY) || '[]') as string[];
    this.want.set(new Set(savedWant.filter(guid => this.nodeGuids.has(guid))));
    this.accompanyStored.set({ ...(this._storageService.getKey<{ [guid: string]: number }>(ACCOMPANY_KEY) ?? {}) });
    const adventure = this._storageService.getKey<Adventure>(ADVENTURE_KEY);
    if (!this.isUpcoming && adventure?.date === this._todayKey) { this.adventure.set(adventure); }

    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(() => this._refresh.update(v => v + 1));
    this._storageService.events.pipe(takeUntilDestroyed()).subscribe(() => this._refresh.update(v => v + 1));
    this._eventService.storageChanged.pipe(takeUntilDestroyed()).subscribe(evt => {
      if (evt.key === DailyCheckinService.key) { this.checkedIn.set(this._dailyCheckinService.isCheckedIn()); }
    });
  }

  // #region Node state

  isAccompanyNode(node: INode): boolean {
    return node.item?.type === ItemType.Special && !!node.item.name?.startsWith('Accompany ');
  }

  needsPass(node: INode): boolean {
    return !this.hasSeasonPass() && isPassItem(node);
  }

  isSelected(node: INode): boolean {
    return this.want().has(node.guid) && !node.unlocked;
  }

  /** Selected, but the tree's friendship doesn't reach the node's tier yet. */
  isAwaitingTier(node: INode, iTree: number): boolean {
    const tier = this._nodeTier.get(node.guid) ?? 0;
    return this.isSelected(node) && tier > 0 && this.calcs()[iTree].stars[tier - 1]?.state !== 'reached';
  }

  // #endregion

  // #region Clicks

  onNodeClicked(node: INode, iTree: number): void {
    const item = node.item;
    if (!item) { return; }
    switch (this.nodeAction()) {
      case 'navigate':
        void this._router.navigate(['/item', item.guid]);
        return;
      case 'favourite':
        item.favourited = !item.favourited;
        item.favourited ? this._storageService.addFavourites(item.guid) : this._storageService.removeFavourites(item.guid);
        this._eventService.itemFavourited.next(item);
        return;
    }

    if (this.isAccompanyNode(node)) { this.meterTree.set(iTree); return; }
    if (node.unlocked || this.want().has(node.guid)) { this.toggleUnlock(node, iTree); return; }
    this.setWant(new Set([...this.want(), node.guid]));
  }

  /** Planned items become owned, owned items go back to unplanned. Costs are spent and refunded like on the season page. */
  private toggleUnlock(node: INode, iTree: number): void {
    const tree = this.trees[iTree];
    const wasWanted = this.want().has(node.guid);
    const unlock = !node.unlocked;
    unlock ? this._nodeService.unlock(node) : this._nodeService.lock(node);
    const cost = CostHelper.add(CostHelper.create(), node);
    if (unlock) { CostHelper.invert(cost); }
    this._currencyService.addTreeCost(cost, tree);

    if (wasWanted) { this.setWant(new Set([...this.want()].filter(g => g !== node.guid))); }
  }

  // #endregion

  // #region Friendship

  openMeter(iTree: number): void { this.meterTree.set(iTree); }
  closeMeter(): void { this.meterTree.set(undefined); }

  addAccompany(iTree: number, delta: number): void {
    const calc = this.calcs()[iTree];
    if (delta > 0 && calc.friendship >= MAX_FRIENDSHIP - EPSILON) { return; }
    this.setAccompany(iTree, calc.accompany + delta);
  }

  /** Accompanying always gives 10, so the meter snaps the accompany points rather than the total. */
  setFriendship(iTree: number, points: number): void {
    const calc = this.calcs()[iTree];
    const maxAccompany = Math.ceil((MAX_FRIENDSHIP - calc.itemPoints) / ACCOMPANY_POINTS - EPSILON) * ACCOMPANY_POINTS;
    const accompany = Math.round((points - calc.itemPoints) / ACCOMPANY_POINTS) * ACCOMPANY_POINTS;
    this.setAccompany(iTree, Math.min(maxAccompany, accompany));
  }

  private setAccompany(iTree: number, value: number): void {
    const guid = this.trees[iTree].guid;
    if (this.accompanyStored()[guid] === value) { return; }
    this.accompanyStored.update(v => ({ ...v, [guid]: Math.max(0, value) }));
    this._storageService.setKey(ACCOMPANY_KEY, this.accompanyStored());
  }

  onMeterPointer(event: PointerEvent, iTree: number): void {
    const el = event.currentTarget as HTMLElement;
    if (event.type === 'pointerdown') { el.setPointerCapture(event.pointerId); }
    else if (!el.hasPointerCapture(event.pointerId)) { return; }
    const rect = el.getBoundingClientRect();
    this.setFriendship(iTree, meterPoints((event.clientX - rect.left) / rect.width));
  }

  onMeterKey(event: KeyboardEvent, iTree: number): void {
    const delta = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 } as { [key: string]: number })[event.key];
    if (!delta) { return; }
    event.preventDefault();
    this.addAccompany(iTree, delta * ACCOMPANY_POINTS);
  }

  meterPosition(points: number): number { return meterPosition(points); }

  meterLayers(iTree: number): Array<{ kind: RailKind; left: number; width: number }> {
    return this.calcs()[iTree].rails.flatMap((rail, iTier) => rail.map(l => {
      const from = TIER_CUMULATIVE[iTier] + l.bottom / 100 * TIER_COST[iTier + 1];
      const left = meterPosition(from);
      return { kind: l.kind, left, width: meterPosition(from + l.height / 100 * TIER_COST[iTier + 1]) - left };
    }));
  }

  // #endregion

  // #region Today

  toggleCheckin(event: MouseEvent): void {
    this.checkedIn.set(this._dailyCheckinService.toggle(event, this.season));
    this._refresh.update(v => v + 1);
  }

  /** One spirit adventure a day: picking another spirit moves today's +10 to it. */
  toggleAdventure(iTree: number): void {
    const current = this.adventure();
    const guid = this.trees[iTree].guid;
    if (current?.date === this._todayKey) {
      const prev = this.trees.findIndex(t => t.guid === current.tree);
      if (prev >= 0) { this.addAccompany(prev, -ACCOMPANY_POINTS); }
    }

    if (current?.date === this._todayKey && current.tree === guid) {
      this.saveAdventure(undefined);
      return;
    }
    if (this.calcs()[iTree].friendship >= MAX_FRIENDSHIP - EPSILON) {
      this.saveAdventure(undefined);
      return;
    }
    this.addAccompany(iTree, ACCOMPANY_POINTS);
    this.saveAdventure({ date: this._todayKey, tree: guid });
  }

  isAdventure(iTree: number): boolean {
    return this.adventure()?.tree === this.trees[iTree].guid;
  }

  private saveAdventure(adventure: Adventure | undefined): void {
    this.adventure.set(adventure);
    this._storageService.setKey(ADVENTURE_KEY, adventure ?? null);
  }

  // #endregion

  // #region Settings

  toggleSeasonPass(gifted: boolean): void {
    if (!this.season) { return; }
    const pass = this.seasonPass();
    const newValue = gifted ? !pass.gifted : !pass.bought;
    newValue && gifted ? this._storageService.addGifted(this.season.guid) : this._storageService.removeGifted(this.season.guid);
    newValue ? this._storageService.addSeasonPasses(this.season.guid) : this._storageService.removeSeasonPasses(this.season.guid);
  }

  setCandles(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!this.season || isNaN(value) || value < 0) { return; }
    this._currencyService.setSeasonCurrency(this.season.guid, value);
    this._refresh.update(v => v + 1);
  }

  // #endregion

  // #region Selection

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

  highlightKnapsack(): void {
    this.setWant(new Set([...this.want(), ...this.knapsack().nodes.map(n => n.guid)]));
  }

  highlightPassItems(): void {
    this.setWant(new Set([...this.want(), ...this.unmarkedPassItems().map(n => n.guid)]));
  }

  resetHighlight(): void {
    if (!confirm('Clear your plan? Items you own stay unlocked.')) { return; }
    this.setWant(new Set());
  }

  private highlightFunc(predicate: (n: INode) => boolean): void {
    const want = new Set(this.want());
    this.nodes.forEach(node => {
      if (node.item && !node.unlocked && !this.isAccompanyNode(node) && !this.needsPass(node) && predicate(node)) { want.add(node.guid); }
    });
    this.setWant(want);
  }

  private setWant(want: ReadonlySet<string>): void {
    this.want.set(want);
    this._storageService.setKey(WANT_KEY, JSON.stringify([...want]));
  }

  // #endregion

  // #region Export

  readonly exporting = signal(false);
  readonly canShare = typeof navigator.share === 'function';

  async exportPlan(mode: ExportMode, tooltip?: TooltipDirective): Promise<void> {
    if (!this.season || this.exporting()) { return; }
    if (mode === 'clipboard' && typeof ClipboardItem === 'undefined') {
      alert('Copying to clipboard is not supported by this browser.');
      return;
    }

    this.exporting.set(true);
    try {
      const canvas = await this._planRenderService.render(this.createPlan(), this._elementRef.nativeElement);
      const fileName = `${this.season.shortName}-plan.png`.replace(/\s+/g, '-').toLowerCase();
      switch (mode) {
        case 'clipboard':
          await this._treeRenderService.copyCanvas(canvas);
          tooltip?.open();
          break;
        case 'share':
          this._treeRenderService.shareCanvas(canvas, fileName);
          break;
        case 'download':
          this._planRenderService.downloadCanvas(canvas, fileName);
          break;
      }
    } catch (e: any) {
      alert(`Failed to export your plan: ${e?.message ?? e}`);
    } finally {
      this.exporting.set(false);
    }
  }

  private createPlan(): SeasonPlan {
    const calcs = this.calcs();
    const trees = this.trees.map((_, iTree) => {
      const calc = calcs[iTree];
      return {
        name: this.spiritName(iTree),
        friendship: this.roundPoints(calc.friendship),
        candlesMarked: calc.candlesSelected,
        accompanyDays: calc.accompanyDays,
        tiers: this.treeTiers[iTree].map(tier => ({
          rows: tier.rows.map(row => row.map(node => node && this.createPlanNode(node, iTree))),
          rail: calc.rails[tier.index],
          star: calc.stars[tier.index]
        }))
      };
    });

    return {
      season: this.season!.name,
      seasonIcon: this.season!.iconUrl,
      daysLeft: this.daysLeftSeason,
      upcoming: this.isUpcoming,
      seasonPass: this.hasSeasonPass(),
      trees,
      candlesSpent: calcs.reduce((sum, c) => sum + c.candlesSpent, 0),
      candlesRequired: this.candlesRequired(),
      candlesFinal: this.candlesFinal(),
      accompanyDays: this.accompanyDays(),
      accompanyDaysLeft: this.accompanyDaysLeft()
    };
  }

  private createPlanNode(node: INode, iTree: number): SeasonPlanNode {
    if (this.isAccompanyNode(node)) { return { node, state: 'none', accompany: this.calcs()[iTree].accompany }; }
    const state = node.unlocked ? 'owned' : this.isAwaitingTier(node, iTree) ? 'awaiting' : this.isSelected(node) ? 'marked' : 'none';
    const value = !node.unlocked && this.nodeValues[node.guid] ? this.roundPoints(this.nodeValues[node.guid]) : undefined;
    return { node, state, value, valueMarked: this.want().has(node.guid) };
  }

  // #endregion

  /** Friendship per node can be a third of a tier's cost, e.g. 26⅔. */
  formatPoints(points: number): string {
    const whole = Math.floor(points + EPSILON);
    const fraction = points - whole;
    if (fraction < EPSILON) { return `${whole}`; }
    if (Math.abs(fraction - 1 / 3) < EPSILON) { return `${whole}⅓`; }
    if (Math.abs(fraction - 2 / 3) < EPSILON) { return `${whole}⅔`; }
    if (Math.abs(fraction - 1 / 2) < EPSILON) { return `${whole}½`; }
    return points.toFixed(1);
  }

  /** Whole points for the trees; a remainder below one still shows as 1 so it never reads as 0. */
  roundPoints(points: number): number {
    const rounded = Math.round(points);
    return rounded === 0 && points > EPSILON ? 1 : rounded;
  }

  isReached(friendship: number, points: number): boolean {
    return friendship >= points - EPSILON;
  }

  spiritName(iTree: number): string {
    return this.trees[iTree].spirit?.name ?? '';
  }

  treeOf(node: INode): number {
    return this._nodeTree.get(node.guid) ?? 0;
  }

  private createDemoItems() {
    const demo = (item?: IItem, unlocked = false): IItem | undefined => item && { ...item, unlocked, favourited: false };
    const items = this.nodes.map(n => n.item).filter(i => i) as IItem[];
    const isPass = (i: IItem) => i.group === 'SeasonPass' || i.group === 'Ultimate';
    const regular = this.nodes.find(n => n.sc && n.item && !isPass(n.item))?.item;
    return {
      regular: demo(regular),
      owned: demo(regular, true),
      pass: demo(items.find(i => i.group === 'SeasonPass') ?? items.find(isPass)),
      accompany: demo(this.nodes.find(n => this.isAccompanyNode(n))?.item)
    };
  }

  // #region Calculation

  private calculateTree(iTree: number, want: ReadonlySet<string>, storedAccompany: number): TreeCalc {
    const tiers = this._tierNodes[iTree];
    const lastTier = tiers.length - 1;
    const wanted = (n: INode) => want.has(n.guid) && !n.unlocked;

    let itemPoints = 0;
    let required = 0;
    tiers.forEach((tierNodes, iTier) => {
      tierNodes.forEach(n => {
        if (n.unlocked) { itemPoints += this.nodeValues[n.guid] ?? 0; }
        if (wanted(n)) { required = TIER_CUMULATIVE[iTier]; }
      });
    });

    const accompany = storedAccompany;
    const friendship = itemPoints + accompany;

    // Friendship the user has fills from the bottom. Planned items can't count below their own tier,
    // so each tier's planned points start where the line is once that tier opens.
    const layers: Array<FriendshipLayer> = [
      { kind: 'items', from: 0, to: itemPoints },
      { kind: 'accompany', from: itemPoints, to: friendship }
    ];
    const missing: number[] = [];
    const pools: INode[][] = [];
    const stars: Array<Star | undefined> = [];
    let current = friendship;
    let shortBy = 0;
    let candlesSelected = 0;
    let candlesSpent = 0;
    let candlesTotal = 0;

    tiers.forEach((tierNodes, iTier) => {
      tierNodes.forEach(n => {
        if (wanted(n)) { candlesSelected += n.sc ?? 0; }
        if (n.unlocked) { candlesSpent += n.sc ?? 0; }
        candlesTotal += n.sc ?? 0;
      });
      if (iTier === lastTier) { stars.push(undefined); return; }

      const before = current;
      const pool: INode[] = [];
      tierNodes.filter(n => this.nodeValues[n.guid] && !n.unlocked).forEach(n => {
        if (wanted(n)) { current += this.nodeValues[n.guid]; }
        else if (!this.needsPass(n)) { pool.push(n); }
      });
      layers.push({ kind: 'selected', from: before, to: current });
      pools.push(pool);

      const next = TIER_CUMULATIVE[iTier + 1];
      const short = current >= required - EPSILON ? 0 : Math.max(0, next - current);
      missing.push(short);
      if (short) {
        layers.push({ kind: 'needed', from: current, to: next });
        current = next;
      }
      // Days come from the running total, since a day's surplus carries into the next tier's shortfall.
      const days = daysFor(shortBy + short) - daysFor(shortBy);
      shortBy += short;

      let state: StarState;
      if (friendship >= next - EPSILON) { state = 'reached'; }
      else if (next > required) { state = current >= next - EPSILON ? 'selected' : 'none'; }
      // Shortfalls below are treated as accompanied, so each star only shows what its own tier still needs.
      else { state = days > 0 ? 'short' : 'selected'; }
      stars.push({ points: next, state, short, days });
    });

    const rails = tiers.map((_, iTier) => {
      if (iTier === lastTier) { return []; }
      const lo = TIER_CUMULATIVE[iTier], hi = TIER_CUMULATIVE[iTier + 1];
      return layers.flatMap(l => {
        const a = Math.max(l.from, lo), b = Math.min(l.to, hi);
        return b - a > EPSILON ? [{ kind: l.kind, bottom: (a - lo) / (hi - lo) * 100, height: (b - a) / (hi - lo) * 100 }] : [];
      });
    });

    const missingTotal = shortBy;

    return {
      itemPoints, accompany, friendship, required, planned: current, missing, missingTotal,
      accompanyDays: daysFor(missingTotal), rails, stars, candlesSelected, candlesSpent, candlesTotal, pools
    };
  }

  /**
   * Finds the cheapest set of unwanted nodes that covers at least `target` of the missing friendship,
   * or the cheapest set that covers the most when no set covers it.
   * Friendship only counts towards its own tree, so each tree contributes at most its own missing friendship.
   */
  private findKnapsack(
    pools: ReadonlyArray<ReadonlyArray<ReadonlyArray<INode>>>,
    missing: ReadonlyArray<ReadonlyArray<number>>,
    target: number
  ): KnapsackOption | undefined {
    if (target <= EPSILON) { return undefined; }

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

  // #endregion
}

type KnapsackOption = { points: number; cost: number; nodes: Array<INode> };
type KnapsackState = KnapsackOption & { carry: number };

/** Friendship per node is fractional (e.g. 40 / 3), so sums need a tolerance. */
const EPSILON = 0.01;

function isPassItem(node: INode): boolean {
  return node.item?.group === 'SeasonPass' || node.item?.group === 'Ultimate';
}

function daysFor(points: number): number {
  return Math.max(0, Math.ceil(points / ACCOMPANY_POINTS - EPSILON));
}

/** Stars sit at equal distances on the in-game line, regardless of how many points each level needs. */
function meterPosition(points: number): number {
  const p = Math.max(0, Math.min(MAX_FRIENDSHIP, points));
  let i = 0;
  while (i < TIER_COST.length - 2 && p > TIER_CUMULATIVE[i + 1]) { i++; }
  return (i + (p - TIER_CUMULATIVE[i]) / TIER_COST[i + 1]) / (TIER_COST.length - 1) * 100;
}

function meterPoints(fraction: number): number {
  const tiers = TIER_COST.length - 1;
  const f = Math.max(0, Math.min(1, fraction)) * tiers;
  const i = Math.min(tiers - 1, Math.floor(f));
  return TIER_CUMULATIVE[i] + (f - i) * TIER_COST[i + 1];
}

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
