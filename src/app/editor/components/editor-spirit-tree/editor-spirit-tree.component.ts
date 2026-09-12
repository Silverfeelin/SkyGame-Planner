import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, inject, isDevMode, ViewChild } from '@angular/core';
import { SpiritTreeComponent, SpiritTreeNodeClickEvent, TreeEditSlot, TreeEditSlotKind } from "@app/components/spirit/spirit-tree/spirit-tree.component";
import { NodePosition } from '@app/components/spirit/node/node.component';
import { DataService } from '@app/services/data.service';
import { nanoid } from 'nanoid';
import { ItemGridLayoutComponent, ItemClickEvent, ITEM_GRID_SUBICONS, ITEM_GRID_TYPES } from '@app/components/item/grid/item-grid-layout.component';
import { ItemIconComponent } from "../../../components/item/icon/item-icon.component";
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { NodeHelper } from '@app/helpers/node-helper';
import { CostHelper } from '@app/helpers/cost-helper';
import { MatIcon } from '@angular/material/icon';
import { ItemHelper } from '@app/helpers/item-helper';
import { SpiritTreeRenderService } from '@app/services/spirit-tree-render.service';
import { OverlayComponent } from "../../../components/layout/overlay/overlay.component";
import { EditorItemComponent } from '../editor-item/editor-item.component';
import { StorageService } from '@app/services/storage.service';
import { TabsComponent, TabDirective } from '@app/components/shared/shared-widgets';
import { NodeComponent } from '@app/components/spirit/node/node.component';
import { TreeHelper } from '@app/helpers/tree-helper';
import { INode, IItem, ICost, ISpiritTree, ISpiritTreeTier, SpiritTreeTierRow, ISpirit, ItemType, SpiritType } from 'skygame-data';

/** Normal trees are a chain of linked nodes; tiered trees are a stack of fixed 3-column rows. */
type EditorMode = 'node' | 'tier';
type TreeNodeArray = Array<TreeNode | undefined>;
type TreeNode = { node: INode; x: number; y: number; };
type TierCell = { tierIndex: number; rowIndex: number; col: number; };
type TierViewRow = { rowIndex: number; nodes: [INode?, INode?, INode?]; };
type TierView = { tierIndex: number; label: string; rows: Array<TierViewRow>; };
type CostType = { id: string; label: string; }
type SpecialItemNames = 'placeholder' | 'blessing' | 'wingBuff' | 'heart' | 'accompany' | 'dyeRed' | 'dyeYellow' | 'dyeGreen' | 'dyeCyan' | 'dyeBlue' | 'dyePurple' | 'dyeBlack' | 'dyeWhite';
type SpecialItem = { item: IItem; cost?: ICost; }

@Component({
    selector: 'app-editor-spirit-tree',
    imports: [
    TooltipDirective, MatIcon, SpiritTreeComponent, ItemGridLayoutComponent,
    ItemIconComponent, OverlayComponent,
    EditorItemComponent, TabsComponent, TabDirective, NodeComponent
],
    templateUrl: './editor-spirit-tree.component.html',
    styleUrl: './editor-spirit-tree.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpiritTreeEditorComponent {
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    if (isDevMode()) { return; }
    event.preventDefault();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp': this.switchSelection('up') && event.preventDefault(); break;
      case 'ArrowRight': this.switchSelection('right') && event.preventDefault(); break
      case 'ArrowDown': this.switchSelection('down') && event.preventDefault(); break;
      case 'ArrowLeft': this.switchSelection('left') && event.preventDefault(); break;
      default: break;
    }

    if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
      navigator.clipboard.readText().then(text => {
        if (text?.length !== 10) { return; }
        const item = this._dataService.guidMap.get(text) as IItem;
        if (!item) { return; }
        this.onItemClicked({ item, event: new MouseEvent('click') });
      });
    }
  }

  @HostBinding('class.dragging') get isDragging() { return !!this.draggingNode; }

  @ViewChild('inpTitle', { static: true }) inpTitle!: ElementRef<HTMLInputElement>;
  @ViewChild('inpSubtitle', { static: true }) inpSubtitle!: ElementRef<HTMLInputElement>;
  @ViewChild('ttCopy', { static: false }) private readonly _ttCopy?: TooltipDirective;

  mode: EditorMode = 'node';
  tree!: ISpiritTree;
  items: Array<IItem> = [];
  itemMap: { [guid: string]: IItem } = {};

  /** Tiers in data order (tier 1 first); `tierView` holds them in display order (top tier first). */
  tiers: Array<ISpiritTreeTier> = [];
  tierView: Array<TierView> = [];
  tierCellMap: { [guid: string]: TierCell } = {};
  selectedCell?: TierCell;
  selectedTierNode?: INode;
  readonly cols: ReadonlyArray<number> = [0, 1, 2];

  readonly itemSubIcons = ITEM_GRID_SUBICONS;
  readonly pickerItems: ReadonlyArray<IItem>;
  nodeTable: [TreeNodeArray, TreeNodeArray, TreeNodeArray] = [[], [], []];
  nodeMap: { [guid: string]: TreeNode } = {};

  spirits: Array<ISpirit>;
  spiritTrees: Array<ISpiritTree> = [];

  selectedTreeNode!: TreeNode;
  selectedItem!: IItem;

  /** In-tree add/move/remove affordances around the selected node. */
  treeEditSlots: Array<TreeEditSlot> = [];

  costTypeId: string = 'c';
  costValue: number = 0;

  costTypes: Array<CostType> = [
    { id: 'c', label: 'Candles' },
    { id: 'h', label: 'Hearts' },
    { id: 'ac', label: 'Ascended candles' },
    { id: 'sc', label: 'Seasonal candles' },
    { id: 'sh', label: 'Seasonal hearts' },
    { id: 'ec', label: 'Event currency' }
  ];

  specialItemMap: { [key in SpecialItemNames]: SpecialItem } = {
    placeholder: { item: { id: -1, guid: nanoid(10), type: ItemType.Special, name: 'Placeholder', icon: '/assets/icons/question.webp' }},
    blessing: { item: { id: -2, guid: nanoid(10), type: ItemType.Special, name: 'Blessing', icon: '/assets/icons/question.webp' }, cost: { c: 5 }},
    wingBuff: { item: { id: -3, guid: nanoid(10), type: ItemType.WingBuff, name: 'Wing Buff', icon: '/assets/icons/question.webp' }, cost: { ac: 2 }},
    heart: { item: { id: -4, guid: nanoid(10), type: ItemType.Special, name: 'Heart', icon: '/assets/icons/question.webp' }, cost: { c: 3 }},
    accompany: { item: { id: -13, guid: nanoid(10), type: ItemType.Special, name: 'Accompany', icon: '/assets/icons/question.webp' }},
    dyeRed: { item: { id: -5, guid: nanoid(10), type: ItemType.Special, name: 'Red dye', icon: '/assets/icons/question.webp' }},
    dyeYellow: { item: { id: -6, guid: nanoid(10), type: ItemType.Special, name: 'Yellow dye', icon: '/assets/icons/question.webp' }},
    dyeGreen: { item: { id: -7, guid: nanoid(10), type: ItemType.Special, name: 'Green dye', icon: '/assets/icons/question.webp' }},
    dyeCyan: { item: { id: -8, guid: nanoid(10), type: ItemType.Special, name: 'Cyan dye', icon: '/assets/icons/question.webp' }},
    dyeBlue: { item: { id: -9, guid: nanoid(10), type: ItemType.Special, name: 'Blue dye', icon: '/assets/icons/question.webp' }},
    dyePurple: { item: { id: -10, guid: nanoid(10), type: ItemType.Special, name: 'Purple dye', icon: '/assets/icons/question.webp' }},
    dyeBlack: { item: { id: -11, guid: nanoid(10), type: ItemType.Special, name: 'Black dye', icon: '/assets/icons/question.webp' }},
    dyeWhite: { item: { id: -12, guid: nanoid(10), type: ItemType.Special, name: 'White dye', icon: '/assets/icons/question.webp' }}
  };
  specialItems: Array<SpecialItem> = Object.values(this.specialItemMap);

  private readonly _storageService = inject(StorageService);

  constructor(
    private readonly _dataService: DataService,
    private readonly _spiritTreeRenderService: SpiritTreeRenderService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.initializeItemIcons();
    this.resetTree('node');

    this.pickerItems = _dataService.itemConfig.items.filter(i => ITEM_GRID_TYPES.has(i.type));

    // Load spirits
    const spiritTypes = new Set<SpiritType>(['Elder', 'Guide', 'Season', 'Event', 'Regular']);
    this.spirits = [
      { guid: nanoid(10), name: 'Select a spirit', type: 'Regular', _index: -1 },
      ..._dataService.spiritConfig.items.filter(s => spiritTypes.has(s.type)).sort((a, b) => a.name.localeCompare(b.name))
    ];

    // Copy tree after inputs are loaded.
    const copyTreeGuid = new URL(location.href).searchParams.get('tree');
    const preserveTreeGuid = new URL(location.href).searchParams.get('modify')==='true';
    copyTreeGuid && setTimeout(() => {
      this.copySpiritTree(_dataService.guidMap.get(copyTreeGuid) as ISpiritTree, preserveTreeGuid);
      this._changeDetectorRef.markForCheck();
    });

    // Load custom item data
    const customData = this._storageService.getKey('editor.items') as { items: Array<IItem> };
    if (customData?.items?.length) {
      this.customItems = customData.items.filter(i => i.guid && !this._dataService.guidMap.has(i.guid));
    }
  }

  promptItemCode(): void {
    const selectedGuid = this.selectedItem.guid || '';
    const guid = prompt('Item code:', selectedGuid);
    if (!guid || guid === selectedGuid) { return; }

    const item = this._dataService.guidMap.get(guid) as IItem;
    if (!item || !item.type) {
      alert('Invalid item code.');
      return;
    }

    this.onItemClicked({ item, event: new MouseEvent('click') });
  }

  addRootNode(): void {
    // Create new placeholder node.
    const node: INode = {
      guid: nanoid(10),
      item: this.cloneItem(this.specialItemMap.placeholder.item)
    };

    // Shift every existing node up one.
    const treeNode: TreeNode = { x: 1, y: 0, node };
    this.nodeMap[node.guid] = treeNode;
    this.nodeTable.forEach(row => {
      row.forEach(node => {
        if (!node) { return; }
        node.y++;
      });
    });
    this.nodeTable[0].unshift(undefined);
    this.nodeTable[1].unshift(treeNode);
    this.nodeTable[2].unshift(undefined);

    // Replace root node.
    this.tree.node!.prev = node;
    node.n = this.tree.node;
    this.tree.node = node;
    this.reloadTree();
  }

  addNode(direction: 'nw'|'n'|'ne') {
    const current = this.selectedTreeNode;
    if (!current) { return; }

    const x = current.x + (direction === 'nw' ? -1 : direction === 'ne' ? 1 : 0);
    const y = current.y + (direction === 'n' ? 1 : 0);
    const target = this.nodeTable[x][y];

    // Remove linked node
    if (target && target.node.prev === current.node) {
      let msg = `Are you sure you want to delete all the connected nodes ${direction==='nw' ? 'to the left of' : direction==='ne' ? 'to the right of' : 'above'} the selected node?`;
      if (!confirm(msg)) { return; }
      const nodes = NodeHelper.all(target.node);
      nodes.forEach(n => {
        const treeNode = this.nodeMap[n.guid];
        if (!treeNode) { return; }
        delete this.nodeMap[n.guid];
        delete this.nodeTable[treeNode.x][treeNode.y];
      });
      current.node[direction] = undefined;
      this.reloadTree();
      return;
    }

    // Change linked node
    if (target) {
      const [currentNode, targetNode] = [current.node, target.node];
      const prev = targetNode.prev;
      if (prev?.nw == targetNode) { delete prev.nw; }
      if (prev?.n == targetNode) { delete prev.n; }
      if (prev?.ne == targetNode) { delete prev.ne; }
      currentNode[direction] = targetNode;
      targetNode.prev = currentNode;
      this.reloadTree();
      return;
    }

    // Create node
    const node: INode = {
      guid: nanoid(10),
      item: this.cloneItem(this.specialItemMap.placeholder.item),
      prev: current.node
    };

    const treeNode: TreeNode = { x, y, node };
    this.nodeTable[x][y] = treeNode;
    this.nodeMap[node.guid] = treeNode;
    current.node[direction] = node;
    this.selectTreeNode(treeNode);

    this.reloadTree();
  }

  onEditSlotClicked(slot: TreeEditSlot): void {
    if (slot.direction === 'below') {
      slot.kind === 'unlink' ? this.detachSelectedNode() : this.addRootNode();
      return;
    }
    this.addNode(slot.direction);
  }

  /** Cuts the trunk below the selected node, dropping that part and promoting it to root. */
  private detachSelectedNode(): void {
    const current = this.selectedTreeNode;
    const parent = current?.node.prev;
    if (!current || !parent) { return; }
    if (!confirm('Are you sure you want to disconnect this node? The nodes below it are deleted and this node becomes the root.')) { return; }

    if (parent.nw === current.node) { delete parent.nw; }
    if (parent.n === current.node) { delete parent.n; }
    if (parent.ne === current.node) { delete parent.ne; }
    delete current.node.prev;

    this.tree = { guid: this.tree.guid, node: current.node };
    this.indexNodeTree();
    this.selectTreeNode(this.nodeMap[current.node.guid]);
    this.reloadTree();
  }

  /**
   * Rebuilds the affordances shown around the selected node. They are anchored to the
   * selection because an empty slot is reachable from two parents (a column node going
   * up, or the trunk beside it branching sideways), so an unanchored slot would be
   * ambiguous. An occupied target owned by another parent offers to move that
   * connection here; one owned by the selection offers to drop it.
   */
  private updateEditSlots(): void {
    const current = this.mode === 'node' ? this.selectedTreeNode : undefined;
    if (!current) { this.treeEditSlots = []; return; }

    const positions: ReadonlyArray<NodePosition> = ['left', 'center', 'right'];
    const targets: Array<{ direction: 'nw' | 'n' | 'ne'; x: number; y: number }> = [
      { direction: 'n', x: current.x, y: current.y + 1 }
    ];

    // Branches only fork off the trunk, matching the guard in addNode.
    if (current.x === 1) {
      targets.push({ direction: 'nw', x: 0, y: current.y });
      targets.push({ direction: 'ne', x: 2, y: current.y });
    }

    const slots: Array<TreeEditSlot> = targets.map(t => {
      const target = this.nodeTable[t.x]?.[t.y];
      const kind: TreeEditSlotKind = !target ? 'add'
        : target.node.prev === current.node ? 'unlink'
        : 'link';
      return { position: positions[t.x], level: t.y, kind, direction: t.direction };
    });

    if (current.node === this.tree.node) {
      slots.push({ position: 'center', level: -1, kind: 'add', direction: 'below' });
    } else if (current.x === 1 && this.nodeTable[1][current.y - 1]?.node.n === current.node) {
      // Trunk node hanging off the node below it: offer to cut there and become the root.
      slots.push({ position: 'center', level: current.y - 1, kind: 'unlink', direction: 'below' });
    }

    this.treeEditSlots = slots;
  }

  onNodeClicked(event: SpiritTreeNodeClickEvent) {
    const treeNode = this.nodeMap[event.node.guid];
    this.selectTreeNode(treeNode);
  }

  onItemClicked(event: ItemClickEvent) {
    const node = this.activeNode;
    if (!node) { return; }
    delete this.itemMap[this.selectedItem.guid];
    node.item = event.item;
    this.selectedItem = event.item;
    this.itemMap[event.item.guid] = event.item;
    this.items = Object.values(this.itemMap);
    this.reloadTree();
  }

  onSpecialItemClicked(event: MouseEvent, specialItem: SpecialItem) {
    const item = this.cloneItem(specialItem.item);
    this.onItemClicked({ item, event });

    this.setCostInputs(specialItem.cost);
    this.applyCost();
  }

  calculateCost(): void {
    const item = this.selectedItem;
    const src = ItemHelper.getItemSource(item, true);
    if (!src) { alert(`Couldn't determine a cost for this item.`); return; }
    if (src.type === 'iap') { alert('This item is an IAP and can not be estimated.'); return; }
    const cost = src.source as ICost;
    this.setCostInputs(cost);
  }

  private setCostInputs(cost: ICost | undefined): void {
    const costType = cost && this.costTypes.find(t => (cost as any)[t.id] > 0);
    this.costTypeId = costType?.id ?? this.costTypes[0].id;
    this.costValue = costType ? this.parseInt(`${(cost as any)[costType.id]}`) : 0;
    this._changeDetectorRef.markForCheck();
  }

  onCostInput(evt: Event): void {
    const target = evt.target as HTMLInputElement;
    const value = Math.min(999, Math.max(0, this.parseInt(target.value)));
    this.costValue = value;
    if (target.value !== `${value}`) { target.value = `${value}`; }
  }

  onCostTypeInput(evt: Event): void {
    this.costTypeId = (evt.target as HTMLSelectElement).value;
  }

  applyCost(): void {
    const node = this.activeNode;
    if (!node) { return; }
    CostHelper.clear(node);
    const costType = this.costTypes.find(t => t.id === this.costTypeId) || this.costTypes[0];
    (node as any)[costType.id] = this.costValue;
    this.reloadTree();
  }

  // #region Tiers

  /** The node the selected-item panel acts on, in either mode. */
  get activeNode(): INode | undefined {
    return this.mode === 'tier' ? this.selectedTierNode : this.selectedTreeNode?.node;
  }

  setMode(mode: EditorMode): void {
    if (mode === this.mode) { return; }
    if (!confirm('Switching tree modes discards the current tree. Are you sure?')) { return; }
    this.resetTree(mode);
  }

  isCellSelected(tierIndex: number, rowIndex: number, col: number): boolean {
    const cell = this.selectedCell;
    return !!cell && cell.tierIndex === tierIndex && cell.rowIndex === rowIndex && cell.col === col;
  }

  onTierCellClicked(tierIndex: number, rowIndex: number, col: number): void {
    const row = this.tiers[tierIndex]?.rows[rowIndex];
    if (!row) { return; }
    if (!row[col]) { row[col] = this.createPlaceholderNode(); }
    this.reloadTierTree();
    this.selectCell({ tierIndex, rowIndex, col });
  }

  clearTierNode(): void {
    const cell = this.selectedCell;
    if (!cell || !this.selectedTierNode) { return; }
    if (!confirm('Are you sure you want to remove this node?')) { return; }
    this.tiers[cell.tierIndex].rows[cell.rowIndex][cell.col] = undefined;
    this.selectedTierNode = undefined;
    this.reloadTierTree();
  }

  addTier(): void {
    this.tiers.push({ guid: nanoid(10), rows: [[undefined, undefined, undefined]] });
    this.reloadTierTree();
  }

  removeTier(): void {
    if (this.tiers.length <= 1) { alert('A tiered tree needs at least one tier.'); return; }
    const tier = this.tiers.at(-1)!;
    if (this.tierHasNodes(tier) && !confirm('Are you sure you want to delete the last tier and all of its nodes?')) { return; }
    this.tiers.pop();
    this.reloadTierTree();
  }

  addRow(tierIndex: number): void {
    const tier = this.tiers[tierIndex];
    if (!tier) { return; }
    tier.rows.push([undefined, undefined, undefined]);
    this.reloadTierTree();
  }

  removeRow(tierIndex: number): void {
    const tier = this.tiers[tierIndex];
    if (!tier) { return; }
    if (tier.rows.length <= 1) { alert('A tier needs at least one row.'); return; }
    const row = tier.rows.at(-1)!;
    if (row.some(n => n) && !confirm('Are you sure you want to delete the top row of this tier and all of its nodes?')) { return; }
    tier.rows.pop();
    this.reloadTierTree();
  }

  private tierHasNodes(tier: ISpiritTreeTier): boolean {
    return tier.rows.some(row => row.some(n => n));
  }

  private createPlaceholderNode(): INode {
    return { guid: nanoid(10), item: this.cloneItem(this.specialItemMap.placeholder.item) };
  }

  private selectCell(cell: TierCell): void {
    const node = this.tiers[cell.tierIndex]?.rows[cell.rowIndex]?.[cell.col];
    this.selectedCell = cell;
    this.selectedTierNode = node;
    if (node?.item) { this.selectedItem = node.item; }
    this.setCostInputs(node);
  }

  /**
   * Rebuilds the tier lookups and the display model. Nodes and tiers are shallow cloned
   * so the OnPush node tiles pick up in-place edits, mirroring `reloadTree` for node trees.
   */
  private reloadTierTree(): void {
    this.treeEditSlots = [];

    this.tiers = this.tiers.map(tier => ({
      ...tier,
      rows: tier.rows.map(row => [
        row[0] ? { ...row[0] } : undefined,
        row[1] ? { ...row[1] } : undefined,
        row[2] ? { ...row[2] } : undefined
      ] as SpiritTreeTierRow)
    }));

    this.tierCellMap = {};
    this.itemMap = {};
    this.tiers.forEach((tier, tierIndex) => {
      tier.prev = this.tiers[tierIndex - 1];
      tier.next = this.tiers[tierIndex + 1];
      tier.root = this.tiers[0];
      tier.rows.forEach((row, rowIndex) => {
        row.forEach((node, col) => {
          if (!node) { return; }
          this.tierCellMap[node.guid] = { tierIndex, rowIndex, col };
          node.item && (this.itemMap[node.item.guid] = node.item);
        });
      });
    });
    this.items = Object.values(this.itemMap);

    // Display order: highest tier on top, and within a tier the first row at the bottom.
    this.tierView = this.tiers.map((tier, tierIndex) => ({
      tierIndex,
      label: `Tier ${tierIndex + 1}`,
      rows: tier.rows
        .map((row, rowIndex) => ({ rowIndex, nodes: [row[0], row[1], row[2]] as [INode?, INode?, INode?] }))
        .reverse()
    })).reverse();

    this.tree = { guid: this.tree.guid, tier: this.tiers[0] };
    this.tiers.forEach(tier => tier.tree = this.tree);

    // Re-point the selection at the clone that replaced it, or drop it if its cell is gone.
    const cell = this.selectedCell;
    if (cell) {
      if (!this.tiers[cell.tierIndex]?.rows[cell.rowIndex]) {
        this.selectedCell = undefined;
        this.selectedTierNode = undefined;
      } else {
        this.selectedTierNode = this.tiers[cell.tierIndex].rows[cell.rowIndex][cell.col];
      }
    }
  }

  private resetTree(mode: EditorMode): void {
    this.mode = mode;
    this.items = [];
    this.itemMap = {};
    this.nodeTable = [[], [], []];
    this.nodeMap = {};
    this.tiers = [];
    this.tierView = [];
    this.tierCellMap = {};
    this.selectedCell = undefined;
    this.selectedTierNode = undefined;

    const node = this.createPlaceholderNode();
    this.itemMap[node.item!.guid] = node.item!;
    this.items = Object.values(this.itemMap);
    this.selectedItem = node.item!;

    if (mode === 'node') {
      this.tree = { guid: nanoid(10), node };
      const treeNode: TreeNode = { x: 1, y: 0, node };
      this.nodeTable[1][0] = treeNode;
      this.nodeMap[node.guid] = treeNode;
      this.selectedTreeNode = treeNode;
      this.setCostInputs(node);
      this.updateEditSlots();
    } else {
      this.tiers = [{ guid: nanoid(10), rows: [[undefined, node, undefined]] }];
      this.tree = { guid: nanoid(10), tier: this.tiers[0] };
      this.reloadTierTree();
      this.selectCell({ tierIndex: 0, rowIndex: 0, col: 1 });
    }
  }

  // #endregion

  // #region Spirits

  onSpiritInput(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.spiritTrees = [];
    const spirit = this._dataService.guidMap.get(value) as ISpirit | undefined;
    if (!spirit) { return; }

    const trees = new Set<ISpiritTree>();
    if (spirit.tree) { trees.add(spirit.tree); }
    if (spirit.treeRevisions) { spirit.treeRevisions.forEach(t => trees.add(t)); }
    if (spirit.travelingSpirits) { spirit.travelingSpirits.map(ts => ts.tree).forEach(t => trees.add(t)); }
    if (spirit.specialVisitSpirits) { spirit.specialVisitSpirits.map(r => r.tree).forEach(t => trees.add(t)); }
    if (spirit.eventInstanceSpirits) { spirit.eventInstanceSpirits.map(e => e.tree).forEach(t => trees.add(t)); }
    this.spiritTrees = Array.from(trees).reverse();
  }

  onSpiritNodeClicked(event: SpiritTreeNodeClickEvent) {
    if (!event.node.item) { return; }
    this.onItemClicked({ item: event.node.item, event: event.event });
    this.setCostInputs(event.node);
    this.applyCost();
  }

  promptCopySpiritTree(tree: ISpiritTree, preserveGuid: boolean): void {
    if (!confirm('Are you sure you want to copy this spirit tree? Your current tree will be replaced.')) { return; }
    this.copySpiritTree(tree, preserveGuid);
  }

  copySpiritTree(tree: ISpiritTree, preserveGuid: boolean): void {
    // Copying a tiered tree switches modes without a prompt; the tree is replaced either way.
    if (tree.tier) { this.copyTierTree(tree, preserveGuid); this.applyTreeTitle(tree); return; }

    this.mode = 'node';
    this.tiers = [];
    this.tierView = [];
    this.tierCellMap = {};
    this.selectedCell = undefined;
    this.selectedTierNode = undefined;
    this.tree = {
      guid: preserveGuid ? tree.guid : nanoid(10),
      node: NodeHelper.clone(tree.node!, preserveGuid)
    };
    this.indexNodeTree();
    this.selectedTreeNode = this.nodeMap[this.tree.node!.guid];
    this.selectedItem = this.selectedTreeNode.node.item!;
    this.setCostInputs(this.selectedTreeNode.node);
    this.updateEditSlots();

    this.applyTreeTitle(tree);
  }

  private copyTierTree(tree: ISpiritTree, preserveGuid: boolean): void {
    this.mode = 'tier';
    this.nodeTable = [[], [], []];
    this.nodeMap = {};
    this.selectedCell = undefined;
    this.selectedTierNode = undefined;

    const cloneNode = (node: INode): INode => {
      const clone: INode = { ...node };
      delete clone.tree; delete clone.root; delete clone.prev;
      delete clone.nw; delete clone.n; delete clone.ne;
      delete clone.unlocked;
      if (!preserveGuid) { clone.guid = nanoid(10); }
      return clone;
    };

    this.tiers = TreeHelper.getTiers(tree).map(tier => ({
      guid: preserveGuid ? tier.guid : nanoid(10),
      rows: tier.rows.map(row => [
        row[0] ? cloneNode(row[0]) : undefined,
        row[1] ? cloneNode(row[1]) : undefined,
        row[2] ? cloneNode(row[2]) : undefined
      ] as SpiritTreeTierRow)
    }));
    if (!this.tiers.length) { this.tiers = [{ guid: nanoid(10), rows: [[undefined, undefined, undefined]] }]; }

    this.tree = { guid: preserveGuid ? tree.guid : nanoid(10), tier: this.tiers[0] };
    this.reloadTierTree();
    this.selectFirstTierNode();
  }

  /** Selects the first filled cell so the item panel has something to act on. */
  private selectFirstTierNode(): void {
    for (let tierIndex = 0; tierIndex < this.tiers.length; tierIndex++) {
      const tier = this.tiers[tierIndex];
      for (let rowIndex = 0; rowIndex < tier.rows.length; rowIndex++) {
        for (let col = 0; col < 3; col++) {
          if (tier.rows[rowIndex][col]) {
            this.selectCell({ tierIndex, rowIndex, col });
            return;
          }
        }
      }
    }
    this.selectCell({ tierIndex: 0, rowIndex: 0, col: 1 });
  }

  private applyTreeTitle(tree: ISpiritTree): void {
    const tsDate = tree.travelingSpirit?.date;
    const rsDate = tree.specialVisitSpirit?.visit?.date;

    let title = tree.eventInstanceSpirit?.name ?? tree.eventInstanceSpirit?.spirit?.name
      ?? tree.specialVisitSpirit?.spirit?.name ?? tree.travelingSpirit?.spirit?.name ?? tree.spirit?.name ?? '';
    let subtitle = tree.name;
    if (tsDate || rsDate) {
      subtitle = tsDate ? `TS #${tree.travelingSpirit!.number}` : `${tree.specialVisitSpirit!.visit.name}`;
      subtitle += ` (${(tsDate || rsDate)!.toFormat('dd-MM-yyyy')})`;
    }

    if (title === subtitle) { subtitle = undefined; }

    this.inpTitle.nativeElement.value = title || '';
    this.inpSubtitle.nativeElement.value = subtitle || '';
  }

  // #endregion

  // #region Output

  async copyImage(bg?: boolean): Promise<void> {
    const canvas = await this._spiritTreeRenderService.render(this.tree, {
      title: this.inpTitle.nativeElement.value.trim(),
      subtitle: this.inpSubtitle.nativeElement.value.trim(),
      background: bg
    });
    try {
      await this._spiritTreeRenderService.copyCanvas(canvas);
      this._ttCopy?.open();
    } catch (e) {
      console.error(e);
      alert('Copying failed. Please make sure the document is focused.');
    }
  }

  async shareImage(): Promise<void> {
    if (!navigator.share) { return alert('Sharing is not supported by this browser.'); }

    const canvas = await this._spiritTreeRenderService.render(this.tree, {
      title: this.inpTitle.nativeElement.value.trim(),
      subtitle: this.inpSubtitle.nativeElement.value.trim(),
      background: true
    });
    this._spiritTreeRenderService.shareCanvas(canvas, 'spirit-tree.png');
  }

  importJson(): void {
    if (!confirm('Are you sure you want to import a spirit tree? Your current tree will be replaced.')) { return; }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) { return; }
      const text = await file.text();
      try {
        const jsonData = JSON.parse(text);
        if (!jsonData.tree?.guid || !jsonData.nodes?.length) {
          throw new Error('No tree or nodes found in JSON file.');
        }

        this.importJsonData(jsonData);
      } catch (e) {
        console.error(e);
        alert('Invalid JSON file. Please check the file and try again.');
      }
    };
    input.click();
  }

  importJsonData(data: any): void {
    // Load custom items.
    this.addCustomItems(data.items || []);

    const nodeMap = data.nodes.reduce((map: { [guid: string]: INode }, node: any) => {
      map[node.guid] = node;
      return map;
    }, {});

    const customItemMap = this.customItems.reduce((map: { [guid: string]: IItem }, item: IItem) => {
      map[item.guid] = item;
      return map;
    }, {});

    const itemMap = data.items.reduce((map: { [guid: string]: IItem }, item: any) => {
      map[item.guid] = item;
      return map;
    }, {});

    for (const node of data.nodes) {
      if (node.nw) { node.nw = nodeMap[node.nw]; }
      if (node.n) { node.n = nodeMap[node.n]; }
      if (node.ne) { node.ne = nodeMap[node.ne]; }
      if (node.item) {
        node.item = this._dataService.guidMap.get(node.item) as IItem
          ?? customItemMap[node.item]
          ?? itemMap[node.item]
          ?? this.cloneItem(this.specialItemMap.placeholder.item);
      }
    }

    const tree: ISpiritTree = data.tiers?.length
      ? { guid: data.tree.guid, tier: this.importTiers(data.tiers, nodeMap) }
      : { guid: data.tree.guid, node: nodeMap[data.tree.node] };

    this.copySpiritTree(tree, true);
    this._changeDetectorRef.markForCheck();
  }

  /** Rebuilds the tier chain from exported rows of node GUIDs. */
  private importTiers(jsonTiers: Array<any>, nodeMap: { [guid: string]: INode }): ISpiritTreeTier {
    const tiers: Array<ISpiritTreeTier> = jsonTiers.map(jsonTier => ({
      guid: jsonTier.guid,
      rows: (jsonTier.rows || []).map((row: Array<string | null>) => [
        row?.[0] ? nodeMap[row[0]] : undefined,
        row?.[1] ? nodeMap[row[1]] : undefined,
        row?.[2] ? nodeMap[row[2]] : undefined
      ] as SpiritTreeTierRow)
    }));

    tiers.forEach((tier, i) => {
      tier.prev = tiers[i - 1];
      tier.next = tiers[i + 1];
      tier.root = tiers[0];
    });

    return tiers[0];
  }

  exportJson(): void {
    const jsonData = this.mode === 'tier' ? this.exportTierData() : this.exportNodeData();

    const json = JSON.stringify(jsonData, undefined, 2)
      .replace(/(?<![}\]])(,\s+)/gm, ', ') // remove linebreaks within objects
      .replace(/(["\d])\s+(})/gm, '$1 $2') // remove linebreaks at end of objects
      .replace(/{\s+"g/gm, '{ "g') // remove linebreaks at start of objects (assuming "g"uid first)
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spirit-tree.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private exportTierData(): unknown {
    const nodes = this.tiers.flatMap(tier => tier.rows.flat()).filter(n => n) as Array<INode>;

    const jsonTiers = this.tiers.map((tier, i) => {
      const jsonTier: any = { guid: tier.guid };
      if (this.tiers[i + 1]) { jsonTier.next = this.tiers[i + 1].guid; }
      jsonTier.rows = tier.rows.map(row => this.cols.map(col => row[col]?.guid ?? null));
      return jsonTier;
    });

    return {
      tree: { guid: this.tree.guid, tier: this.tiers[0].guid },
      tiers: jsonTiers,
      nodes: this.toJsonNodes(nodes, true),
      items: this.toJsonItems(nodes)
    };
  }

  private exportNodeData(): unknown {
    const jsonTree = {
      guid: this.tree.guid,
      node: this.tree.node!.guid
    };

    const nodes = NodeHelper.all(this.tree.node);

    return {
      tree: jsonTree,
      nodes: this.toJsonNodes(nodes, false),
      items: this.toJsonItems(nodes)
    };
  }

  private toJsonItems(nodes: Array<INode>): Array<any> {
    return nodes.filter(n => {
      return n.item?.guid && !this._dataService.guidMap.has(n.item.guid)
    }).map(n => {
      const item: any = { ...n.item };
      delete item.id;
      return item;
    });
  }

  private toJsonNodes(nodes: Array<INode>, tiered: boolean): Array<any> {
    return nodes.map(n => {
      const node: any = { ...n };
      delete node.prev;
      if (tiered) {
        // Tier rows carry the layout; the node itself only holds its item and cost.
        delete node.tree; delete node.root; delete node.nw; delete node.n; delete node.ne;
      } else {
        node.nw && (node.nw = node.nw.guid);
        node.n && (node.n = node.n.guid);
        node.ne && (node.ne = node.ne.guid);
      }
      node.item && (node.item = node.item.guid);
      node.hiddenItems && (node.hiddenItems = node.hiddenItems.map((i: IItem) => i.guid))
      return node;
    });
  }

  // #endregion

  // #region Dragging

  draggingNode?: HTMLElement;
  draggingPreview?: HTMLImageElement;
  onTreePointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const nodeEl = target.closest('app-node') as HTMLElement;
    if (!nodeEl) { return; }

    this.draggingNode = nodeEl;
    target.setPointerCapture(event.pointerId);

    const item = this.getDraggedNode(nodeEl.getAttribute('guid') || '')?.item;
    if (item?.icon?.startsWith('http')) {
      this.draggingPreview = document.createElement('img');
      this.draggingPreview.src = item.icon;
      this.draggingPreview.width = 64;
      this.draggingPreview.height = 64;
      document.body.appendChild(this.draggingPreview);
      this.draggingPreview.style.position = 'absolute';
      this.draggingPreview.style.zIndex = '1000';
      this.draggingPreview.style.top = `${event.clientY - 32 + window.scrollY}px`;
      this.draggingPreview.style.left = `${event.clientX - 32 + window.scrollX}px`;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  onTreePointerMove(event: PointerEvent): void {
    if (!this.draggingNode || !this.draggingPreview) { return; }
    this.draggingPreview.style.top = `${event.clientY - 32 + window.scrollY}px`;
    this.draggingPreview.style.left = `${event.clientX - 32 + window.scrollX}px`;
  }

  onTreePointerUp(event: PointerEvent): void {
    if (this.draggingPreview) {
      document.body.removeChild(this.draggingPreview);
      this.draggingPreview = undefined;
    }

    if (!this.draggingNode) { return; }
    const draggingNode = this.draggingNode;
    this.draggingNode = undefined;
    const target = document.elementsFromPoint(event.clientX, event.clientY).find(e => e.tagName === 'APP-ATMOS-NODE');
    if (!target || target === draggingNode) { return; }

    // Swap nodes.
    const firstGuid = draggingNode.getAttribute('guid') || '';
    const secondGuid = target.getAttribute('guid') || '';

    if (this.mode === 'tier') {
      this.swapTierNodes(firstGuid, secondGuid);
      return;
    }

    const firstNode = this.nodeMap[firstGuid];
    const secondNode = this.nodeMap[secondGuid];
    if (!firstNode || !secondNode) { return; }

    // Swap nodes
    NodeHelper.swap(firstNode.node, secondNode.node);
    this.selectedTreeNode = firstNode;
    this.selectedItem = this.selectedTreeNode.node.item!;
    this.setCostInputs(this.selectedTreeNode.node);
    this.reloadTree();
  }

  /** Tier nodes have no connections, so swapping is just exchanging the two cells. */
  private swapTierNodes(firstGuid: string, secondGuid: string): void {
    const first = this.tierCellMap[firstGuid];
    const second = this.tierCellMap[secondGuid];
    if (!first || !second) { return; }

    const firstRow = this.tiers[first.tierIndex].rows[first.rowIndex];
    const secondRow = this.tiers[second.tierIndex].rows[second.rowIndex];
    const firstNode = firstRow[first.col];
    firstRow[first.col] = secondRow[second.col];
    secondRow[second.col] = firstNode;

    this.reloadTierTree();
    this.selectCell(second);
  }

  private getDraggedNode(guid: string): INode | undefined {
    if (this.mode === 'tier') {
      const cell = this.tierCellMap[guid];
      return cell ? this.tiers[cell.tierIndex]?.rows[cell.rowIndex]?.[cell.col] : undefined;
    }
    return this.nodeMap[guid]?.node;
  }

  onTreeTouchStart(event: TouchEvent): void {
    const target = event.target as HTMLElement;
    if (target?.closest('app-node')) { event.preventDefault(); }
  }

  // #endregion

  // #region Custom items

  isCustomEditorVisible = false;
  selectedCustomItem?: IItem;
  customItems: Array<IItem> = [];

  addCustomItem(): void {
    this.selectedCustomItem = undefined;
    this.isCustomEditorVisible = true;
  }

  editCustomItem(item: IItem): void {
    this.selectedCustomItem = item;
    this.isCustomEditorVisible = true;
  }

  applyCustomItem(event: MouseEvent, item: IItem): void {
    this.onItemClicked({ item, event });
  }

  duplicateCustomItem(item: IItem): void {
    const i = this.customItems.findIndex(i => i.guid === item.guid);
    if (i >= 0) {
      const newItem = this.cloneItem(item);
      this.customItems.push(newItem);
      this._storageService.setKey('editor.items', { items: this.customItems });
      this._changeDetectorRef.markForCheck();
    }
  }

  deleteCustomItem(item: IItem): void {
    if (!confirm('Are you sure you want to delete this item?')) { return; }
    const i = this.customItems.findIndex(i => i.guid === item.guid);
    if (i >= 0) {
      this.customItems.splice(i, 1);
      this._storageService.setKey('editor.items', { items: this.customItems });
      this._changeDetectorRef.markForCheck();
    }
  }

  onCustomItem(item: IItem): void {
    const i = this.customItems.findIndex(i => i.guid === item.guid);
    if (i >= 0) {
      this.customItems[i] = item;
    } else {
      this.customItems.push(item);
    }

    this._storageService.setKey('editor.items', { items: this.customItems });
    this._changeDetectorRef.markForCheck();
    this.selectedCustomItem = item;
    this.isCustomEditorVisible = false;
  }

  addCustomItems(items: Array<IItem>): void {
    const existingGuids = new Set(this.customItems.map(i => i.guid));
    const specialItemNames = new Set(Object.values(this.specialItemMap).map(i => i.item.name));

    for (const item of items) {
      if (specialItemNames.has(item.name)) { continue; }
      if (this._dataService.guidMap.has(item.guid)) { continue; }
      if (existingGuids.has(item.guid)) { continue; }
      this.customItems.push(item);
    }
    this._storageService.setKey('editor.items', { items: this.customItems });
    this._changeDetectorRef.markForCheck();
  }

  onCustomItemClicked(event: ItemClickEvent): void {
    this.selectedCustomItem = event.item;
    // event.item = this.cloneItem(event.item);
    // this.onItemClicked(event);
  }

  // #endregion

  private initializeItemIcons(): void {
    for (const item of this._dataService.itemConfig.items) {
      if (item.type === ItemType.Special && item.name === 'Blessing' && item.nodes?.at(-1)?.c === 5) {
        this.specialItemMap.blessing.item.icon = item.icon;
      } else if (item.type === ItemType.WingBuff) {
        this.specialItemMap.wingBuff.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'Heart' && item.nodes?.at(-1)?.c === 3) {
        this.specialItemMap.heart.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name?.startsWith('Accompany ')) {
        this.specialItemMap.accompany.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'Red dye') {
        this.specialItemMap.dyeRed.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'Yellow dye') {
        this.specialItemMap.dyeYellow.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'Green dye') {
        this.specialItemMap.dyeGreen.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'Cyan dye') {
        this.specialItemMap.dyeCyan.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'Blue dye') {
        this.specialItemMap.dyeBlue.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'Purple dye') {
        this.specialItemMap.dyePurple.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'Black dye') {
        this.specialItemMap.dyeBlack.item.icon = item.icon;
      } else if (item.type === ItemType.Special && item.name === 'White dye') {
        this.specialItemMap.dyeWhite.item.icon = item.icon;
      }
    }
  }

  private selectTreeNode(treeNode: TreeNode): void {
    this.selectedTreeNode = treeNode;
    this.selectedItem = treeNode.node.item!;
    this.setCostInputs(treeNode.node);
    this.updateEditSlots();
  }

  private switchSelection(direction: 'up'|'down'|'left'|'right'): boolean | undefined {
    return this.mode === 'tier' ? this.switchTierCell(direction) : this.switchTreeNode(direction);
  }

  /** Moves the tier selection across the grid as it is displayed, empty cells included. */
  private switchTierCell(direction: 'up'|'down'|'left'|'right'): boolean | undefined {
    const cell = this.selectedCell;
    if (!cell) { return; }

    if (direction === 'left' || direction === 'right') {
      const col = cell.col + (direction === 'left' ? -1 : 1);
      if (col < 0 || col > 2) { return; }
      this.selectCell({ ...cell, col });
      return true;
    }

    const visualRows = this.tierView.flatMap(tier => tier.rows.map(row => ({ tierIndex: tier.tierIndex, rowIndex: row.rowIndex })));
    const index = visualRows.findIndex(r => r.tierIndex === cell.tierIndex && r.rowIndex === cell.rowIndex);
    if (index < 0) { return; }
    const target = visualRows[index + (direction === 'up' ? -1 : 1)];
    if (!target) { return; }
    this.selectCell({ ...target, col: cell.col });
    return true;
  }

  private switchTreeNode(direction: 'up'|'down'|'left'|'right'): boolean | undefined {
    if (!this.selectedTreeNode) { return; }
    const { x, y } = this.selectedTreeNode;
    const [dx, dy] = direction === 'up' ? [0, 1] : direction === 'down' ? [0, -1] : direction === 'left' ? [-1, 0] : [1, 0];
    const target = this.nodeTable[x + dx]?.[y + dy];
    if (!target) { return; }
    this.selectTreeNode(target);
    return true;
  }

  /** Rebuilds the coordinate table, node lookup and item list by walking from the root. */
  private indexNodeTree(): void {
    this.nodeTable = [[], [], []];
    this.nodeMap = {};
    this.items = [];
    this.itemMap = {};

    const addNode = (n: INode, x: number, y: number) => {
      const treeNode: TreeNode = { x, y, node: n };
      this.nodeTable[x][y] = treeNode;
      this.nodeMap[n.guid] = treeNode;
      n.item && (this.itemMap[n.item.guid] = n.item);

      if (n.nw) { addNode(n.nw, x - 1, y); }
      if (n.n) { addNode(n.n, x, y + 1); }
      if (n.ne) { addNode(n.ne, x + 1, y); }
    };

    addNode(this.tree.node!, 1, 0);
    this.items = Object.values(this.itemMap);
  }

  private reloadTree(): void {
    if (this.mode === 'tier') { this.reloadTierTree(); return; }

    const clones: { [guid: string]: INode } = {};
    const cloneNode = (node: INode, prev?: INode): INode => {
      const clone: INode = { ...node };
      clones[clone.guid] = clone;
      if (prev) { clone.prev = prev; } else { delete clone.prev; }
      if (node.nw) { clone.nw = cloneNode(node.nw, clone); }
      if (node.n) { clone.n = cloneNode(node.n, clone); }
      if (node.ne) { clone.ne = cloneNode(node.ne, clone); }
      return clone;
    };

    const root = cloneNode(this.tree.node!);
    for (const treeNode of Object.values(this.nodeMap)) {
      const clone = clones[treeNode.node.guid];
      if (clone) { treeNode.node = clone; }
    }

    this.tree = { guid: this.tree.guid, node: root };
    this.updateEditSlots();
  }
  private parseInt(value?: string): number { return parseInt(value || '', 10) || 0; }
  private cloneItem(item: IItem): IItem {
    const newItem = { ...item };
    newItem.guid = nanoid(10);
    return newItem;
  }
}
