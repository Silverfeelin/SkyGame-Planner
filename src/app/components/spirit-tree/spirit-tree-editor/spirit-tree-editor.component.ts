import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, isDevMode, ViewChild } from '@angular/core';
import { SpiritTreeComponent, SpiritTreeNodeClickEvent } from "../spirit-tree.component";
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { DataService } from '@app/services/data.service';
import { nanoid } from 'nanoid';
import { ItemClickEvent, ItemsComponent } from "../../items/items.component";
import { IItem, ItemType } from '@app/interfaces/item.interface';
import { CardComponent } from "../../layout/card/card.component";
import { ItemIconComponent } from "../../items/item-icon/item-icon.component";
import { INode } from '@app/interfaces/node.interface';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NodeHelper } from '@app/helpers/node-helper';
import { CostHelper } from '@app/helpers/cost-helper';
import { MatIcon } from '@angular/material/icon';
import { ItemHelper } from '@app/helpers/item-helper';
import { ICost } from '@app/interfaces/cost.interface';
import { ISpirit, SpiritType } from '@app/interfaces/spirit.interface';
import { SpiritTreeRenderService } from '@app/services/spirit-tree-render.service';

type TreeNodeArray = Array<TreeNode>;
type TreeNode = { node: INode; x: number; y: number; };
type CostType = { id: string; label: string; }
type SpecialItemNames = 'blessing' | 'wingBuff' | 'heart' | 'dyeRed' | 'dyeYellow' | 'dyeGreen' | 'dyeCyan' | 'dyeBlue' | 'dyePurple' | 'dyeBlack' | 'dyeWhite';
type SpecialItem = { item: IItem; cost?: ICost; }

@Component({
    selector: 'app-spirit-tree-editor',
    imports: [NgbTooltip, MatIcon, SpiritTreeComponent, ItemsComponent, CardComponent, ItemIconComponent],
    templateUrl: './spirit-tree-editor.component.html',
    styleUrl: './spirit-tree-editor.component.scss',
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
      case 'ArrowUp': this.switchTreeNode('up') && event.preventDefault(); break;
      case 'ArrowRight': this.switchTreeNode('right') && event.preventDefault(); break
      case 'ArrowDown': this.switchTreeNode('down') && event.preventDefault(); break;
      case 'ArrowLeft': this.switchTreeNode('left') && event.preventDefault(); break;
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
  @ViewChild('inpCost', { static: true }) inpCost!: ElementRef<HTMLInputElement>;
  @ViewChild('selCostType', { static: true }) selCostType!: ElementRef<HTMLSelectElement>;
  @ViewChild('refTree', { static: true }) refTree!: SpiritTreeComponent;
  @ViewChild('ttCopy', { static: false }) private readonly _ttCopy?: NgbTooltip;

  tree: ISpiritTree;
  items: Array<IItem> = [];
  itemMap: { [guid: string]: IItem } = {};
  nodeTable: [TreeNodeArray, TreeNodeArray, TreeNodeArray] = [[], [], []];
  nodeMap: { [guid: string]: TreeNode } = {};

  spirits: Array<ISpirit>;
  spiritTrees: Array<ISpiritTree> = [];

  selectedTreeNode: TreeNode;
  selectedItem: IItem;

  costTypes: Array<CostType> = [
    { id: 'c', label: 'Candles' },
    { id: 'h', label: 'Hearts' },
    { id: 'ac', label: 'Ascended candles' },
    { id: 'sc', label: 'Seasonal candles' },
    { id: 'sh', label: 'Seasonal hearts' },
    { id: 'ec', label: 'Event currency' }
  ];

  missingItem = { id: -1, guid: nanoid(10), type: ItemType.Special, name: 'Missing item', icon: '/assets/icons/question.webp' };
  specialItemMap: { [key in SpecialItemNames]: SpecialItem } = {
    blessing: { item: { id: -2, guid: nanoid(10), type: ItemType.Special, name: 'Blessing', icon: '/assets/icons/question.webp' }, cost: { c: 5 }},
    wingBuff: { item: { id: -3, guid: nanoid(10), type: ItemType.WingBuff, name: 'Wing Buff', icon: '/assets/icons/question.webp' }, cost: { ac: 2 }},
    heart: { item: { id: -4, guid: nanoid(10), type: ItemType.Special, name: 'Hearts', icon: '/assets/icons/question.webp' }, cost: { c: 3 }},
    dyeRed: { item: { id: -5, guid: nanoid(10), type: ItemType.Special, name: 'Red dye', icon: '/assets/icons/question.webp' }},
    dyeYellow: { item: { id: -6, guid: nanoid(10), type: ItemType.Special, name: 'Yellow dye', icon: '/assets/icons/question.webp' }},
    dyeGreen: { item: { id: -7, guid: nanoid(10), type: ItemType.Special, name: 'Green dye', icon: '/assets/icons/question.webp' }},
    dyeCyan: { item: { id: -8, guid: nanoid(10), type: ItemType.Special, name: 'Cyan dye', icon: '/assets/icons/question.webp' }},
    dyeBlue: { item: { id: -9, guid: nanoid(10), type: ItemType.Special, name: 'Blue dye', icon: '/assets/icons/question.webp' }},
    dyePurple: { item: { id: -10, guid: nanoid(10), type: ItemType.Special, name: 'Purple dye', icon: '/assets/icons/question.webp' }},
    dyeBlack: { item: { id: -11, guid: nanoid(10), type: ItemType.Special, name: 'Black dye', icon: '/assets/icons/question.webp' }},
    dyeWhite: { item: { id: -12, guid: nanoid(10), type: ItemType.Special, name: 'White dye', icon: '/assets/icons/question.webp' }}
  }
  specialItems: Array<SpecialItem> = Object.values(this.specialItemMap);

  constructor(
    private readonly _dataService: DataService,
    private readonly _spiritTreeRenderService: SpiritTreeRenderService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.initializeItemIcons();
    this.tree = {
      guid: nanoid(10),
      node: { guid: nanoid(10), item: this.cloneItem(this.missingItem) }
    };

    const treeNode = { x: 1, y: 0, node: this.tree.node };
    this.nodeTable[1][0] = treeNode;
    this.nodeMap[this.tree.node.guid] = treeNode;
    this.selectedTreeNode = treeNode;
    this.selectedItem = this.tree.node.item!;

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
      item: this.cloneItem(this.missingItem),
      prev: current.node
    };

    const treeNode: TreeNode = { x, y, node };
    this.nodeTable[x][y] = treeNode;
    this.nodeMap[node.guid] = treeNode;
    current.node[direction] = node;
    this.selectTreeNode(treeNode);

    this.reloadTree();
  }

  onNodeClicked(event: SpiritTreeNodeClickEvent) {
    const treeNode = this.nodeMap[event.node.guid];
    this.selectTreeNode(treeNode);
  }

  swapNodes(targetNode: INode): void {
    const targetTreeNode = this.nodeMap[targetNode.guid];
    if (!targetTreeNode) { alert('Invalid target node.'); return; }
    const selectedNode = this.selectedTreeNode.node;

    // Swap nodes
    NodeHelper.swap(selectedNode, targetNode);
    this.selectedTreeNode = targetTreeNode;
    this.selectedItem = targetNode.item!;

    this.reloadTree();
  }

  onItemClicked(event: ItemClickEvent) {
    const existingItem = this.itemMap[event.item.guid];
    if (existingItem) {
      existingItem !== this.selectedItem && alert('This item is already in use by another node.');
      return;
    }

    delete this.itemMap[this.selectedItem.guid];
    this.selectedTreeNode.node.item = event.item;
    this.selectedItem = event.item;
    this.itemMap[event.item.guid] = event.item;
    this.items = Object.values(this.itemMap);
    this.reloadTree();
  }

  onSpecialItemClicked(event: MouseEvent, specialItem: SpecialItem) {
    const item = this.cloneItem(specialItem.item);
    this.onItemClicked({ item, event });

    if (specialItem.cost) {
      this.setCostInputs(specialItem.cost);
    }
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

  private setCostInputs(cost: ICost): void {
    const costType = this.costTypes.find(t => (cost as any)[t.id] > 0) || this.costTypes[0];
    this.inpCost.nativeElement.value = (cost as any)[costType?.id || 'c'] || '0';
    this.selCostType.nativeElement.value = costType?.id || 'c';
  }

  onCostInputBlur(evt: Event): void {
    const target = evt.target as HTMLInputElement;
    const value = this.parseInt(target.value);
    if (value <= 0) {
      target.value = '0';
    } else if (value > 999) {
      target.value = '999';
    } else if (!value) {
      target.value = '';
    }
  }

  applyCost(): void {
    const node = this.selectedTreeNode.node;
    CostHelper.clear(node);
    const costType = this.costTypes.find(t => t.id === this.selCostType.nativeElement.value) || this.costTypes[0];
    const costValue = this.parseInt(this.inpCost.nativeElement.value) || 0;
    (node as any)[costType.id] = costValue;
    this.reloadTree();
  }

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
    if (spirit.ts) { spirit.ts.map(ts => ts.tree).forEach(t => trees.add(t)); }
    if (spirit.returns) { spirit.returns.map(r => r.tree).forEach(t => trees.add(t)); }
    if (spirit.events) { spirit.events.map(e => e.tree).forEach(t => trees.add(t)); }
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
    this.tree = { guid: nanoid(10), node: NodeHelper.clone(tree.node, preserveGuid) };
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

    addNode(this.tree.node, 1, 0);
    this.items = Object.values(this.itemMap);
    this.selectedTreeNode = this.nodeMap[this.tree.node.guid];
    this.selectedItem = this.selectedTreeNode.node.item!;

    const tsDate = tree.ts?.date;
    const rsDate = tree.visit?.return?.date;

    let title = tree.eventInstanceSpirit?.name ?? tree.eventInstanceSpirit?.spirit?.name
      ?? tree.visit?.spirit?.name ?? tree.ts?.spirit?.name ?? tree.spirit?.name ?? '';
    let subtitle = tree.name;
    if (tsDate || rsDate) {
      subtitle = tsDate ? `TS #${tree.ts!.number}` : `${tree.visit!.return.name}`;
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
    this._spiritTreeRenderService.copyCanvas(canvas);
    this._ttCopy?.open();
  }

  async shareImage(): Promise<void> {
    const canvas = await this._spiritTreeRenderService.render(this.tree, {
      title: this.inpTitle.nativeElement.value.trim(),
      subtitle: this.inpSubtitle.nativeElement.value.trim(),
      background: true
    });
    this._spiritTreeRenderService.shareCanvas(canvas, 'spirit-tree.png');
  }

  exportJson(): void {
    const jsonTree = {
      guid: this.tree.guid,
      node: this.tree.node.guid
    };

    const nodes = NodeHelper.all(this.tree.node);
    const jsonNodes = nodes.map(n => {
      const node: any = { ...n };
      delete node.prev;
      node.nw && (node.nw = node.nw.guid);
      node.n && (node.n = node.n.guid);
      node.ne && (node.ne = node.ne.guid);
      node.item && (node.item = node.item.guid);
      node.hiddenItems && (node.hiddenItems = node.hiddenItems.map((i: IItem) => i.guid))
      return node;
    });

    const jsonItems = this.items.filter(i => i.id && i.id < 0).map(i => {
      const item: any = { ...i };
      delete item.id;
      return item;
    });

    const jsonData = {
      tree: jsonTree,
      nodes: jsonNodes,
      items: jsonItems
    };

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

    const item = this.nodeMap[nodeEl.getAttribute('guid') || '']?.node.item;
    if (item?.icon?.startsWith('http')) {
      this.draggingPreview = document.createElement('img');
      this.draggingPreview.src = item.icon;
      this.draggingPreview.width = 64;
      this.draggingPreview.height = 64;
      document.body.appendChild(this.draggingPreview);
      this.draggingPreview.style.position = 'absolute';
      this.draggingPreview.style.zIndex = '1000';
      this.draggingPreview.style.top = `${event.clientY-32}px`;
      this.draggingPreview.style.left = `${event.clientX-32}px`;
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
    const target = document.elementsFromPoint(event.clientX, event.clientY).find(e => e.tagName === 'APP-NODE');
    if (!target || target === draggingNode) { return; }

    // Swap nodes.
    const firstGuid = draggingNode.getAttribute('guid') || '';
    const secondGuid = target.getAttribute('guid') || '';
    const firstNode = this.nodeMap[firstGuid];
    const secondNode = this.nodeMap[secondGuid];
    if (!firstNode || !secondNode) { return; }

    // Swap nodes
    NodeHelper.swap(firstNode.node, secondNode.node);
    this.selectedTreeNode = firstNode;
    this.selectedItem = this.selectedTreeNode.node.item!;
    this.reloadTree();
  }

  onTreeTouchStart(event: TouchEvent): void {
    const target = event.target as HTMLElement;
    if (target?.closest('app-node')) { event.preventDefault(); }
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

  private reloadTree(): void { this.tree = { guid: this.tree.guid, node: this.tree.node }; }
  private parseInt(value?: string): number { return parseInt(value || '', 10) || 0; }
  private cloneItem(item: IItem): IItem { return { ...item, guid: nanoid(10) }; }
}
