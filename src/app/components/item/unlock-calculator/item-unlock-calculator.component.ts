import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject, isDevMode, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { nanoid } from 'nanoid';
import {
  IItem, ICost, IIAP, IEventInstance, ITravelingSpirit, INode, ISpiritTree,
  ISpirit, IRevisedSpiritTree, ISeason, IEvent, ISpiritTreeTier, ItemType,
  IItemSource, IItemSourceNode, IItemSourceListNode, IItemSourceIap,
  IItemListNode, ISpecialVisitSpirit, IShop
} from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { GoalService } from '@app/services/goal.service';
import { NodeHelper } from '@app/helpers/node-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { CostHelper } from '@app/helpers/cost-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { SeasonHelper } from '@app/helpers/season-helper';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { ItemGridLayoutComponent, ItemClickEvent, ITEM_GRID_TYPES } from '@app/components/item/grid/item-grid-layout.component';
import { SpiritTreeComponent } from '@app/components/shared/shared-widgets';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { TabsComponent } from '@app/components/shared/tabs/tabs.component';
import { TabDirective } from '@app/components/shared/tabs/tab.directive';
import { ItemUnlockCalculatorFavouritesComponent } from './item-unlock-calculator-favourites.component';
import { ItemUnlockCalculatorSpiritsComponent } from './item-unlock-calculator-spirits.component';
import { ItemUnlockCalculatorSeasonsComponent } from './item-unlock-calculator-seasons.component';
import { ItemUnlockCalculatorEventsComponent } from './item-unlock-calculator-events.component';
import { SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';

type CostKey = 'c' | 'h' | 'ac' | 'sc' | 'sh' | 'ec' | 'lp';

interface ICurrency {
  key: CostKey;
  label: string;
  icon: string;
  iconClass: string;
}

const CURRENCIES: ReadonlyArray<ICurrency> = [
  { key: 'c', label: 'Candles', icon: 'candle', iconClass: 'currency' },
  { key: 'h', label: 'Hearts', icon: 'heart', iconClass: 'currency' },
  { key: 'ac', label: 'Ascended candles', icon: 'ascended-candle', iconClass: 'currency' },
  { key: 'sc', label: 'Seasonal candles', icon: 'candle', iconClass: 'seasonal' },
  { key: 'sh', label: 'Seasonal hearts', icon: 'heart', iconClass: 'seasonal' },
  { key: 'ec', label: 'Event tickets', icon: 'ticket', iconClass: 'currency' },
  { key: 'lp', label: 'Loyalty points', icon: 'loyalty-point', iconClass: 'currency' }
];

type GroupMode = 'source' | 'currency';
type SourceKind = 'tree' | 'shop' | 'iap' | 'unknown';

interface IResultSource {
  key: string;
  kind: SourceKind;
  name: string;
  detail?: string;
  ongoing?: 'season' | 'event';
}

interface IPathNode {
  node: INode;
  owned: boolean;
  countedBy?: IItem;
}

interface IItemResult {
  item: IItem;
  source: IResultSource;
  found: boolean;

  hasTree?: boolean;
  estimatedCost?: ICost;
  hasUnknownCost?: boolean;
  cost?: ICost;
  isEmptyCost?: boolean;
  listNode?: IItemListNode;
  nodes?: Array<INode>;
  path?: Array<IPathNode>;

  iap?: IIAP;
  price?: number;
  inPackWith?: IItem;
  eventInstance?: IEventInstance;
  ts?: ITravelingSpirit;
  rs?: ISpecialVisitSpirit;
}

interface IResultGroup {
  key: string;
  name: string;
  detail?: string;
  icon?: string;
  svgIcon?: string;
  iconClass?: string;
  ongoing?: 'season' | 'event';
  estimated: boolean;
  results: Array<IItemResult>;
  cost: ICost;
  price: number;
}

interface INotice {
  message: string;
  undo?: Array<IItem>;
}

const SOURCE_ICONS: Record<SourceKind, string> = {
  tree: 'account_tree',
  shop: 'storefront',
  iap: 'attach_money',
  unknown: 'help_outline'
};

@Component({
  selector: 'app-item-unlock-calculator',
  templateUrl: './item-unlock-calculator.component.html',
  styleUrl: './item-unlock-calculator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TooltipDirective, MatIcon, DecimalPipe, LowerCasePipe,
    ItemIconComponent, CostComponent, ItemTypePipe,
    ItemGridLayoutComponent, SpiritTreeComponent,
    RouterLink,
    SectionQuickActionsComponent,
    TabsComponent, TabDirective,
    ItemUnlockCalculatorFavouritesComponent,
    ItemUnlockCalculatorSpiritsComponent,
    ItemUnlockCalculatorSeasonsComponent,
    ItemUnlockCalculatorEventsComponent
  ]
})
export class ItemUnlockCalculatorComponent {
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    if (isDevMode()) { return; }
    if (!this.results.length) { return; }
    event.preventDefault();
  }

  private readonly _dataService = inject(DataService);
  private readonly _router = inject(Router);
  private readonly _goalService = inject(GoalService);

  itemType: ItemType = ItemType.Outfit;
  private readonly _itemTypeSet = ITEM_GRID_TYPES;

  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly CURRENCIES = CURRENCIES;
  /** Pool the embedded browser draws from — every type the grid layout can show. */
  readonly pickerItems: ReadonlyArray<IItem>;
  /** Picker items that can't be added; marked in the grid instead of rejected on click. */
  readonly limitedItems: ReadonlySet<IItem>;

  readonly groupMode = signal<GroupMode>('source');
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly summaryOpen = signal(false);
  readonly notice = signal<INotice | undefined>(undefined);
  private _noticeTimer?: ReturnType<typeof setTimeout>;

  itemListItems: Array<IItem> = [];

  items: Array<IItem> = [];
  itemSet = new Set<IItem>();
  ownedItems: Array<IItem> = [];

  results: Array<IItemResult> = [];
  groups: Array<IResultGroup> = [];
  showAsTrees = false;

  totalCost: ICost = CostHelper.create();
  totalCurrencies: Array<ICurrency> = [];
  totalEstimatedKeys = new Set<CostKey>();
  totalCostIncludesEstimates = false;
  totalCostIncludesOngoingEvent = false;
  totalCostIncludesOngoingSeason = false;
  readonly seasonPlanner = SeasonHelper.getPlanner(DateHelper.getActive(this._dataService.seasonConfig.items));
  totalPrice = 0;
  checkedTrees: { [key: string]: ISpiritTree } = {};
  checkedNodes: { [key: string]: INode } = {};
  checkedIaps: { [key: string]: IIAP } = {};
  private _nodeCountedBy = new Map<string, IItem>();
  private _iapCountedBy = new Map<string, IItem>();

  treeRoots: { [key: string]: ISpiritTree } = {};
  treeOpaqueNodes: { [key: string]: Array<string> } = {};
  treeHighlightItems: { [key: string]: Array<string> } = {};
  trees: Array<ISpiritTree> = [];

  constructor() {
    this.pickerItems = this._dataService.itemConfig.items.filter(i => this._itemTypeSet.has(i.type));
    this.limitedItems = new Set(this.pickerItems.filter(i => this.getAddError(i)));
    inject(DestroyRef).onDestroy(() => clearTimeout(this._noticeTimer));
    this.readItemsFromUrl();
    if (this.items.length) { this.calculate(); }
  }

  shareSelection(): void {
    if (!this.items.length) { return; }
    const url = new URL(location.href);
    url.searchParams.set('items', url.searchParams.get('items')?.substring(0, 300) ?? '');
    navigator.clipboard.writeText(url.toString()).then(
      () => this.showNotice(this.items.length > 100 ? 'Link copied with the first 100 items.' : 'Link copied.'),
      () => this.showNotice('Couldn\'t copy the link. Copy it from the address bar instead.')
    );
  }

  createCollection(): void {
    if (!this.items.length) { return; }
    const queryParams = { items: ItemHelper.serializeQuery(this.items) };
    this._router.navigate(['/item/collection/add'], { queryParams });
  }

  saveAsGoals(): void {
    const guids = this.items.filter(i => !i.unlocked).map(i => i.guid);
    if (!guids.length) { return this.showNotice('You already own all selected items.'); }
    this._goalService.add(...guids);
    this._router.navigate(['/item/goals']);
  }

  setGroupMode(mode: GroupMode): void {
    this.groupMode.set(mode);
    this.buildGroups();
  }

  toggleExpanded(result: IItemResult): void {
    const guid = result.item.guid;
    this.expanded.update(set => {
      const next = new Set(set);
      next.has(guid) ? next.delete(guid) : next.add(guid);
      return next;
    });
  }

  toggleSummary(): void {
    this.summaryOpen.update(v => !v);
  }

  undo(): void {
    const snapshot = this.notice()?.undo;
    if (!snapshot) { return; }
    this.items = [...snapshot];
    this.itemSet = new Set(snapshot);
    this.dismissNotice();
    this.calculate();
  }

  dismissNotice(): void {
    clearTimeout(this._noticeTimer);
    this.notice.set(undefined);
  }

  onTreeNodeClicked(evt: { node: INode; event: MouseEvent }): void {
    const item = evt.node.item;
    if (!item) { return; }
    if (this.itemSet.has(item)) { return this.removeItem(item); }
    this.addItems([item], item.name);
  }

  onItemTypeChanged(type: ItemType): void {
    this.itemType = type;
  }

  onItemClicked(evt: ItemClickEvent): void {
    const item = evt.item;
    if (this.itemSet.has(item)) { return this.removeItem(item); }
    this.addItems([item], item.name);
  }

  onItemsClicked(events: Array<ItemClickEvent>): void {
    this.addItems(events.map(e => e.item), 'your wishlist');
  }

  onItemsChanged(items: ReadonlyArray<IItem>): void {
    this.itemListItems = [...items];
  }

  addItemsFromList(): void {
    this.addItems(this.itemListItems, 'the item list');
  }

  onSpiritSelected(spirit: ISpirit): void {
    const tree = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'AfterSeason' || t.revisionType === 'DuringSeason') ?? spirit.tree;
    if (!tree) { return this.showNotice(`${spirit.name} doesn't have a spirit tree.`); }
    this.addFilteredKeyItems(TreeHelper.getItems(tree), spirit.name);
  }

  onSeasonSelected(season: ISeason): void {
    const trees = season.spirits.filter(s => s.type === 'Season' && s.tree).map(s => s.tree!);
    if (!trees.length) { return this.showNotice(`${season.shortName} doesn't have any spirits with spirit trees.`); }
    this.addFilteredKeyItems(trees.flatMap(t => TreeHelper.getItems(t)), season.shortName);
  }

  onSeasonGuideSelected(season: ISeason): void {
    const spirit = season.spirits.find(s => s.type === 'Guide');
    const items = spirit?.tree ? TreeHelper.getItems(spirit.tree) : [];
    if (!items.length) { return this.showNotice(`The ${season.shortName} guide doesn't have items that can be added.`); }
    this.addFilteredKeyItems(items, `the ${season.shortName} guide`);
  }

  onEventSelected(event: IEvent): void {
    const instance = event.instances?.at(-1);
    if (!instance) { return; }
    const items: Array<IItem> = [];
    for (const spirit of instance.spirits || []) {
      items.push(...TreeHelper.getItems(spirit.tree));
    }
    for (const shop of instance.shops || []) {
      if (shop.itemList) {
        items.push(...shop.itemList.items.map(i => i.item));
      } else if (shop.iaps) {
        items.push(...shop.iaps.filter(a => a.items).flatMap(i => i.items!));
      }
    }
    this.addFilteredKeyItems(items, event.name);
  }

  clearItems(): void {
    if (!this.items.length) { return; }
    const snapshot = [...this.items];
    this.items = [];
    this.itemSet.clear();
    this.calculate();
    this.showNotice(`Cleared ${snapshot.length} ${snapshot.length === 1 ? 'item' : 'items'}.`, snapshot);
  }

  removeItem(item: IItem): void {
    const snapshot = [...this.items];
    this.itemSet.delete(item);
    this.items = this.items.filter(i => i !== item);
    this.calculate();
    this.showNotice(`Removed ${item.name}.`, snapshot);
  }

  toggleShowAsTrees(): void {
    this.showAsTrees = !this.showAsTrees;
  }

  getResultMeta(result: IItemResult): string {
    if (!result.found) { return 'No known source'; }
    if (result.hasUnknownCost) { return 'Cost unknown'; }
    if (result.estimatedCost) { return 'Estimated from similar items'; }
    if (result.inPackWith) { return `Same purchase as ${result.inPackWith.name}`; }
    if (result.iap) { return 'In-app purchase'; }
    if (!result.path) { return 'Shop item'; }

    const counted = result.path.filter(p => !p.owned && !p.countedBy).length;
    const shared = result.path.filter(p => !p.owned && p.countedBy).length;
    let meta = counted === 1 ? '1 node' : `${counted} nodes`;
    if (shared) { meta += `, ${shared} already counted`; }
    return meta;
  }

  getPickTooltip(item: IItem): string {
    return this.limitedItems.has(item) ? `${item.name} · limited, can't be calculated` : item.name;
  }

  private addFilteredKeyItems(items: Array<IItem>, label: string): void {
    const filteredItems = this.filterKeyItems(items);
    if (!filteredItems.length) { return this.showNotice(`There are no items to add from ${label}.`); }
    this.addItems(filteredItems, label);
  }

  /** Adds the items and reports the outcome in one notice with an undo, instead of a dialog per item. */
  private addItems(items: ReadonlyArray<IItem>, label: string): void {
    const snapshot = [...this.items];
    let added = 0;
    let lastError: string | undefined;
    const fresh = items.filter(i => !this.itemSet.has(i));
    for (const item of fresh) {
      const error = this.tryAddItem(item);
      if (error) { lastError = error; } else { added++; }
    }
    const skipped = items.length - added;

    if (!added) {
      if (items.length === 1) { return this.showNotice(lastError ? `${items[0].name}: ${lastError}` : `${items[0].name} is already selected.`); }
      return this.showNotice(`Everything from ${label} is already selected or can't be added.`);
    }

    this.calculate();
    const what = items.length === 1 ? items[0].name : `${added} ${added === 1 ? 'item' : 'items'} from ${label}`;
    this.showNotice(`Added ${what}.${skipped ? ` ${skipped} skipped.` : ''}`, snapshot);
  }

  private showNotice(message: string, undo?: Array<IItem>): void {
    clearTimeout(this._noticeTimer);
    this.notice.set({ message, undo });
    this._noticeTimer = setTimeout(() => this.notice.set(undefined), 6000);
  }

  private filterKeyItems(items: Array<IItem>): Array<IItem> {
    return items.filter(i => this._itemTypeSet.has(i.type) && i.group !== 'Limited' && i.group !== 'Ultimate');
  }

  private tryAddItem(item: IItem): string | undefined {
    if (this.itemSet.has(item)) { return `This item is already in the calculator.`; }
    const error = this.getAddError(item);
    if (error) { return error; }

    this.itemSet.add(item);
    this.items.push(item);
    return undefined;
  }

  private getAddError(item: IItem): string | undefined {
    if (item.group !== 'Ultimate' && item.group !== 'Limited') { return undefined; }

    const src = ItemHelper.getItemSource(item, true);
    let srcSeason: ISeason | undefined;
    let srcEvent: IEventInstance | undefined;
    switch (src?.type) {
      case 'iap': {
        srcSeason = src.source.shop?.season;
        srcEvent = src.source.shop?.event;
        break;
      }
      case 'list': {
        srcSeason = src.source.itemList.shop?.season;
        srcEvent = src.source.itemList.shop?.event;
        break;
      }
      case 'node': {
        const tree = src.source.root?.tree;
        srcSeason = tree?.spirit?.season;
        srcEvent = tree?.eventInstanceSpirit?.eventInstance;
        break;
      }
    }
    if (!DateHelper.isActivePeriod(srcSeason) && !DateHelper.isActivePeriod(srcEvent)) {
      return `This is a limited item, so it can't be calculated.`;
    }
    return undefined;
  }

  calculate(): void {
    /* Adds push into `items` in place, which a signal input on a child would never
       see; every mutation ends here, so hand out a fresh reference from one place. */
    this.items = [...this.items];
    this.updateUrl();

    this.totalCost = CostHelper.create();
    this.totalEstimatedKeys = new Set();
    this.totalCostIncludesEstimates = false;
    this.totalCostIncludesOngoingEvent = false;
    this.totalCostIncludesOngoingSeason = false;
    this.totalPrice = 0;
    this.ownedItems = [];
    this.results = [];
    this.checkedTrees = {};
    this.checkedNodes = {};
    this.checkedIaps = {};
    this._nodeCountedBy.clear();
    this._iapCountedBy.clear();
    this.trees = [];
    this.treeRoots = {};

    for (const item of this.items) {
      if (item.unlocked) {
        this.ownedItems.push(item);
        continue;
      }
      const src = ItemHelper.getItemSource(item, true);
      if (!src) { this.results.push({ item, found: false, source: { key: 'unknown', kind: 'unknown', name: 'Unknown source' } }); continue; }
      const result = this.handleSource(src);
      if (result.estimatedCost) {
        this.totalCostIncludesEstimates = true;
        CostHelper.add(this.totalCost, result.estimatedCost);
        CURRENCIES.filter(c => result.estimatedCost![c.key]).forEach(c => this.totalEstimatedKeys.add(c.key));
      } else if (result.cost) {
        CostHelper.add(this.totalCost, result.cost);
      } else if (result.price) {
        this.totalPrice += result.price;
      }
      this.results.push(result);
    }

    this.totalCurrencies = CURRENCIES.filter(c => this.totalCost[c.key]);
    this.buildGroups();

    let treeOpaqueNodes: Array<string> = [];
    let treeHighlightItems: Array<string> = [];
    this.treeOpaqueNodes = {};
    this.treeHighlightItems = {};

    const copyNodeCost = (newNode: INode, oldNode: INode) => {
      newNode.c = oldNode.c; newNode.h = oldNode.h;
      newNode.sc = oldNode.sc; newNode.sh = oldNode.sh;
      newNode.ec = oldNode.ec; newNode.ac = oldNode.ac;
    };

    const addNode = (newNode: INode, oldNode: INode) => {
      newNode.item = oldNode.item;
      const shouldCopyCost = this.checkedNodes[oldNode.guid] && !oldNode.item?.unlocked;
      shouldCopyCost ? copyNodeCost(newNode, oldNode) : newNode.c = 0;
      if (shouldCopyCost) { treeOpaqueNodes.push(newNode.guid); }
      if (oldNode.item && this.itemSet.has(oldNode.item)) {
        treeHighlightItems.push(oldNode.item.guid);
      }
      if (oldNode.n) { newNode.n = { guid: nanoid(10) } as INode; addNode(newNode.n, oldNode.n); }
      if (oldNode.nw) { newNode.nw = { guid: nanoid(10) } as INode; addNode(newNode.nw, oldNode.nw); }
      if (oldNode.ne) { newNode.ne = { guid: nanoid(10) } as INode; addNode(newNode.ne, oldNode.ne); }
    };

    for (const tree of Object.values(this.checkedTrees)) {
      if (tree.node) {
        treeOpaqueNodes = [];
        treeHighlightItems = [];
        const name = tree.eventInstanceSpirit?.eventInstance?.name
          ?? tree.eventInstanceSpirit?.eventInstance?.event?.name
          ?? tree.travelingSpirit?.spirit?.name
          ?? tree.specialVisitSpirit?.spirit?.name
          ?? tree?.spirit?.name;
        const newTree = {
          guid: nanoid(10), name, node: { guid: nanoid(10) }
        } as ISpiritTree;
        const node = tree.node;
        if (node) { addNode(newTree.node!, node); }
        this.treeOpaqueNodes[newTree.guid] = treeOpaqueNodes;
        this.treeHighlightItems[newTree.guid] = treeHighlightItems;
        this.trees.push(newTree);
      } else if (tree.tier) {
        treeOpaqueNodes = [];
        treeHighlightItems = [];
        const newTree = { guid: nanoid(10), name: tree.name } as ISpiritTree;
        const tiers = TreeHelper.getTiers(tree);
        let prevTier: ISpiritTreeTier | undefined = undefined;
        for (const tier of tiers) {
          const newTier = { guid: nanoid(10), rows: [] } as ISpiritTreeTier;
          for (const row of tier.rows) {
            const newRow = [] as Array<INode | undefined>;
            newTier.rows.push(newRow as [INode | undefined, INode | undefined, INode | undefined]);
            for (const node of row) {
              if (node == undefined) { newRow.push(undefined); continue; }
              const newNode = { guid: nanoid(10), item: node.item } as INode;
              newRow.push(newNode);
              if (this.checkedNodes[node.guid] && !node.item?.unlocked) {
                copyNodeCost(newNode, node);
                treeOpaqueNodes.push(newNode.guid);
              }
              if (node.item && this.itemSet.has(node.item)) {
                treeHighlightItems.push(node.item.guid);
              }
            }
          }
          if (prevTier) {
            prevTier.next = newTier;
            newTier.prev = prevTier;
            newTier.root = prevTier.root;
          } else {
            newTier.root = newTier;
          }
          prevTier = newTier;
        }
        newTree.tier = prevTier?.root;
        this.treeHighlightItems[newTree.guid] = treeHighlightItems;
        this.treeOpaqueNodes[newTree.guid] = treeOpaqueNodes;
        this.trees.push(newTree);
      }
    }
  }

  private buildGroups(): void {
    this.groups = this.groupMode() === 'source' ? this.groupBySource() : this.groupByCurrency();
  }

  private groupBySource(): Array<IResultGroup> {
    const map = new Map<string, Array<IItemResult>>();
    for (const result of this.results) {
      const list = map.get(result.source.key) ?? [];
      list.push(result);
      map.set(result.source.key, list);
    }
    return [...map.values()].map(results => {
      const source = results[0].source;
      return this.createGroup(source.key, source.name, results, {
        detail: source.detail,
        icon: SOURCE_ICONS[source.kind],
        ongoing: results.find(r => r.source.ongoing)?.source.ongoing
      });
    });
  }

  private groupByCurrency(): Array<IResultGroup> {
    const map = new Map<string, Array<IItemResult>>();
    for (const result of this.results) {
      const key = this.getPrimaryCurrency(result);
      const list = map.get(key) ?? [];
      list.push(result);
      map.set(key, list);
    }

    const groups: Array<IResultGroup> = [];
    for (const currency of CURRENCIES) {
      const results = map.get(currency.key);
      if (!results) { continue; }
      groups.push(this.createGroup(currency.key, currency.label, results, { svgIcon: currency.icon, iconClass: currency.iconClass }));
    }
    const other: Array<[string, string, string]> = [
      ['iap', 'In-app purchases', 'attach_money'],
      ['none', 'Nothing extra to pay', 'check'],
      ['unknown', 'Unknown cost', 'help_outline']
    ];
    for (const [key, name, icon] of other) {
      const results = map.get(key);
      if (!results) { continue; }
      groups.push(this.createGroup(key, name, results, { icon }));
    }
    return groups;
  }

  private getPrimaryCurrency(result: IItemResult): string {
    if (!result.found || result.hasUnknownCost) { return 'unknown'; }
    if (result.iap || result.inPackWith) { return 'iap'; }
    const cost = result.estimatedCost ?? result.cost;
    return CURRENCIES.find(c => cost?.[c.key])?.key ?? 'none';
  }

  private createGroup(key: string, name: string, results: Array<IItemResult>, options: Partial<IResultGroup>): IResultGroup {
    const cost = CostHelper.create();
    let price = 0;
    for (const result of results) {
      const resultCost = result.estimatedCost ?? result.cost;
      if (resultCost) { CostHelper.add(cost, resultCost); }
      price += result.price ?? 0;
    }
    const sub = results.length === 1 ? '1 item' : `${results.length} items`;
    return {
      key, name, results, cost, price,
      detail: options.detail ? `${options.detail} · ${sub}` : sub,
      icon: options.icon, svgIcon: options.svgIcon, iconClass: options.iconClass,
      ongoing: options.ongoing,
      estimated: results.some(r => r.estimatedCost)
    };
  }

  private handleSource(src: IItemSource): IItemResult {
    switch (src.type) {
      case 'node': return this.handleNode(src);
      case 'list': return this.handleListNode(src);
      case 'iap': return this.handleIap(src);
    }
  }

  private handleNode(src: IItemSourceNode): IItemResult {
    const node = src.source;
    const tree = node.root?.tree;
    if (!tree) { return { item: src.item, found: false, source: { key: 'unknown', kind: 'unknown', name: 'Unknown source' } }; }
    const source = this.getTreeSource(tree);

    const eventInstance = node.root?.tree?.eventInstanceSpirit?.eventInstance;
    const isOngoingEvent = eventInstance && DateHelper.isActivePeriod(eventInstance);
    if (eventInstance && !isOngoingEvent && node.ec) {
      const result: IItemResult = { item: src.item, source, found: true, estimatedCost: this.findAverageByItem(src.item) };
      result.hasUnknownCost = !result.estimatedCost && !result.cost;
      return result;
    } else if (eventInstance && isOngoingEvent) {
      this.totalCostIncludesOngoingEvent = true;
      source.ongoing = 'event';
    }

    const season = tree.spirit?.type === 'Season' ? tree.spirit.season : undefined;
    const isOngoingSeason = season && DateHelper.isActivePeriod(tree.spirit!.season);
    if (season && !isOngoingSeason) {
      const result: IItemResult = { item: src.item, source, found: true, estimatedCost: this.findAverageByItem(src.item) };
      result.hasUnknownCost = !result.estimatedCost;
      return result;
    } else if (season && isOngoingSeason) {
      this.totalCostIncludesOngoingSeason = true;
      source.ongoing = 'season';
    }

    if (!this.checkedTrees[tree.guid]) { this.checkedTrees[tree.guid] = tree; }

    const nodes = NodeHelper.trace(src.source);
    const newNodes: Array<INode> = [];
    const path: Array<IPathNode> = [];
    const totalCost = CostHelper.create();
    for (const n of nodes) {
      const owned = !!(n.unlocked || n.item?.unlocked);
      if (this.checkedNodes[n.guid]) {
        path.push({ node: n, owned, countedBy: this._nodeCountedBy.get(n.guid) });
        continue;
      }
      this.checkedNodes[n.guid] = n;
      this._nodeCountedBy.set(n.guid, src.item);
      path.push({ node: n, owned });
      if (!owned) {
        newNodes.push(n);
        CostHelper.add(totalCost, n);
      }
    }

    return {
      item: src.item,
      source,
      hasTree: true,
      found: true,
      cost: totalCost,
      isEmptyCost: CostHelper.isEmpty(totalCost),
      nodes: newNodes,
      path
    };
  }

  private handleListNode(src: IItemSourceListNode): IItemResult {
    const node = src.source;
    const cost = node.ec ? this.findAverageByItem(src.item) : node;
    const source = this.getShopSource(node.itemList.shop, node.itemList.guid, 'shop');
    return { item: src.item, source, found: true, listNode: node, cost, isEmptyCost: !!cost && CostHelper.isEmpty(cost), hasUnknownCost: !!node.ec && !cost };
  }

  private handleIap(src: IItemSourceIap): IItemResult {
    const iap = src.source;
    const source = this.getShopSource(iap.shop, iap.guid, 'iap');
    if (this.checkedIaps[iap.guid]) {
      return { item: src.item, source, found: true, price: 0, inPackWith: this._iapCountedBy.get(iap.guid) };
    }
    this.checkedIaps[iap.guid] = iap;
    this._iapCountedBy.set(iap.guid, src.item);
    return { item: src.item, source, found: true, iap, price: iap.price ?? 0 };
  }

  private getTreeSource(tree: ISpiritTree): IResultSource {
    const key = tree.guid;
    if (tree.eventInstanceSpirit) {
      const instance = tree.eventInstanceSpirit.eventInstance;
      return { key, kind: 'tree', name: tree.eventInstanceSpirit.name ?? tree.eventInstanceSpirit.spirit.name, detail: instance?.name ?? instance?.event?.name };
    }
    if (tree.travelingSpirit) {
      return { key, kind: 'tree', name: tree.travelingSpirit.spirit.name, detail: `Traveling Spirit #${tree.travelingSpirit.number}` };
    }
    if (tree.specialVisitSpirit) {
      return { key, kind: 'tree', name: tree.specialVisitSpirit.spirit.name, detail: 'Special visit' };
    }
    const spirit = tree.spirit;
    return { key, kind: 'tree', name: spirit?.name ?? tree.name ?? 'Spirit tree', detail: spirit?.season?.shortName };
  }

  private getShopSource(shop: IShop | undefined, fallbackKey: string, kind: 'shop' | 'iap'): IResultSource {
    const kindLabel = kind === 'iap' ? 'In-app purchase' : 'Shop';
    const name = shop?.name ?? shop?.event?.name ?? shop?.event?.event?.name ?? shop?.spirit?.name ?? shop?.season?.shortName ?? kindLabel;
    return { key: shop?.guid ?? fallbackKey, kind, name, detail: name === kindLabel ? undefined : kindLabel };
  }

  private findAverageByItem(item: IItem): ICost | undefined {
    return ItemHelper.estimateCost(item, this._dataService.itemConfig.items);
  }

  private readItemsFromUrl(): void {
    const url = new URL(location.href);
    const sIds = url.searchParams.get('items');
    if (!sIds) { return; }

    let skipped = 0;
    this.items = [];
    this.itemSet.clear();

    const ids = ItemHelper.deserializeQuery(sIds);
    for (const id of ids) {
      const item = this._dataService.itemIdMap.get(id);
      if (item && this.tryAddItem(item)) { skipped++; }
    }

    if (skipped) {
      this.showNotice(`${skipped} ${skipped === 1 ? 'item' : 'items'} from the link couldn't be added.`);
    }
  }

  private updateUrl(): void {
    const url = new URL(location.href);
    const ids = ItemHelper.serializeQuery(this.items);
    url.searchParams.set('items', ids);
    history.replaceState(window.history.state, '', url.toString());
  }
}
