import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, signal, SimpleChanges, TemplateRef } from '@angular/core';
import { filter, lastValueFrom, SubscriptionLike } from 'rxjs';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IItem } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { NodeAction, NodeComponent } from '../node/node.component';
import { DateTime } from 'luxon';
import { CostComponent } from '../util/cost/cost.component';
import { DateComponent } from '../util/date/date.component';
import { NgFor, NgTemplateOutlet } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatIcon } from '@angular/material/icon';
import { DebugService } from '@app/services/debug.service';
import { CurrencyService } from '@app/services/currency.service';
import { NodeHelper } from '@app/helpers/node-helper';
import { IconService } from '@app/services/icon.service';
import { DataService } from '@app/services/data.service';

export type SpiritTreeNodeClickEvent = { node: INode, event: MouseEvent };
const signalAction = signal<NodeAction>('unlock');

@Component({
    selector: 'app-spirit-tree',
    templateUrl: './spirit-tree.component.html',
    styleUrls: ['./spirit-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatIcon, NgbTooltip, NgFor, NgTemplateOutlet, DateComponent, CostComponent, NodeComponent]
})
export class SpiritTreeComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() tree!: ISpiritTree;
  @Input() name?: string | undefined;
  @Input() highlight?: boolean;
  @Input() highlightItem?: string | Array<string>;
  @Input() enableControls = true;
  @Input() nodeOverlayTemplate?: TemplateRef<unknown>;
  @Input() opaqueNodes?: boolean | Array<string>;
  @Input() padBottom = false;
  @Input() forceNodeAction?: NodeAction;

  @Output() readonly nodeClicked = new EventEmitter<SpiritTreeNodeClickEvent>();

  nodes: Array<INode> = [];
  left: Array<INode> = [];
  center: Array<INode> = [];
  right: Array<INode> = [];
  opaqueNodesAll: boolean = false;
  opaqueNodesMap: { [guid: string]: boolean } = {};
  highlightItemMap: { [guid: string]: boolean } = {};

  hasCostAtRoot = false;
  toggleUnlock = false;

  showingNodeActions = false;
  nodeAction: NodeAction = 'unlock';

  itemMap = new Map<string, INode>();
  hasCost!: boolean;
  totalCost!: ICost;
  remainingCost!: ICost;

  tsDate?: DateTime;
  rsDate?: DateTime;

  _itemSub?: SubscriptionLike;

  constructor(
    private readonly _debugService: DebugService,
    private readonly _currencyService: CurrencyService,
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _iconService: IconService,
    private readonly _storageService: StorageService,
    private readonly _elementRef: ElementRef,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    effect(() => {
      this.nodeAction = signalAction();
      _changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    const element = this._elementRef.nativeElement as HTMLElement;
    const scrollElem = element.querySelector('.spirit-tree-scroll');
    if (scrollElem) { scrollElem.scrollTop = 1000; }

    document.addEventListener('click', this.hideNodeActions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tree']) {
      this.initializeNodes();
      this.subscribeItemChanged();
      this.calculateRemainingCosts();

      this.tsDate = this.tree.ts?.date;
      this.rsDate = this.tree.visit?.return?.date;
    }

    if (changes['opaqueNodes']) {
      this.opaqueNodesAll = false;
      this.opaqueNodesMap = {};
      if (this.opaqueNodes) {
        this.opaqueNodesAll = this.opaqueNodes === true;
        typeof this.opaqueNodes === 'object' && this.opaqueNodes.forEach(guid => this.opaqueNodesMap[guid] = true);
      }
    }

    if (changes['highlightItem']) {
      this.highlightItemMap = {};
      if (this.highlightItem) {
        if (typeof this.highlightItem === 'string') {
          this.highlightItemMap[this.highlightItem] = true;
        } else {
          this.highlightItem.forEach(guid => this.highlightItemMap[guid] = true);
        }
      }
    }
  }

  ngOnDestroy(): void {
    this._itemSub?.unsubscribe();
    document.removeEventListener('click', this.hideNodeActions);
  }

  onNodeClicked(event: MouseEvent, node: INode): void {
    this.nodeClicked.emit({ node, event: event });
  }

  hideNodeActions = (): void => {
    this.showingNodeActions = false;
    this._changeDetectorRef.markForCheck();
  }

  setNodeAction(evt: MouseEvent, action: NodeAction): void {
    evt.stopPropagation();
    if (this.showingNodeActions) {
      signalAction.set(action);
      this.showingNodeActions = false;
    } else {
      this.showingNodeActions = true;
    }
  }

  /** Build grid from nodes. */
  initializeNodes(): void {
    // Reset data
    this.itemMap.clear();
    this.totalCost = CostHelper.create();
    this.remainingCost = CostHelper.create();
    this.nodes = []; this.left = []; this.center = []; this.right = [];
    this.hasCost = false;

    if (!this.tree) { return; }
    this.initializeNode(this.tree.node, 0, 0);
    this.hasCost = !CostHelper.isEmpty(this.totalCost);
    this.hasCostAtRoot = !CostHelper.isEmpty(this.tree.node);
  }

  subscribeItemChanged(): void {
    this._itemSub?.unsubscribe();
    this._itemSub = this._eventService.itemToggled
      .pipe(filter(v => this.itemMap.has(v.guid)))
      .subscribe(v => this.onItemChanged(v));
  }

  onItemChanged(item: IItem): void {
    const node = this.itemMap.get(item.guid);
    if (!node) { return; }
    this.calculateRemainingCosts();
    this._changeDetectorRef.markForCheck();
  }

  initializeNode(node: INode, direction: number, level: number): void {
    // Save item guid to detect updates
    if (node.item) { this.itemMap.set(node.item.guid, node); }

    this.nodes.push(node);
    const arr = direction < 0 ? this.left : direction > 0 ? this.right : this.center;
    arr[level] = node;

    // Add costs to total
    CostHelper.add(this.totalCost, node);

    if (node.nw) { this.initializeNode(node.nw, direction -1, level); }
    if (node.ne) { this.initializeNode(node.ne, direction + 1, level); }
    if (node.n) { this.initializeNode(node.n, direction, level + 1); }
  }

  calculateRemainingCosts(): void {
    this.remainingCost = CostHelper.create();
    this.toggleUnlock = this.nodes.some(n => n.item && !n.item.unlocked);
    this.nodes.filter(n => !n.unlocked && !n.item?.unlocked).forEach(n => {
      CostHelper.add(this.remainingCost, n);
    });
  }

  unlockAll(): void {
    if (this._debugService.copyTree) {
      navigator.clipboard.writeText(this.tree?.guid || '');
      return;
    }
    const itemNodes = this.nodes.filter(n => n.item);
    const items: Array<IItem> = itemNodes.map(n => n.item!);
    const shouldUnlock = items.filter(v => !v.unlocked).length;

    const msg = `Are you sure you want to ${shouldUnlock?'UNLOCK':'REMOVE'} all items from this tree?`;
    if (!confirm(msg)) { return; }

    const unlockCost = CostHelper.create();
    if (shouldUnlock) {
      // Unlock all locked items.
      itemNodes.filter(n => !n.item!.unlocked).forEach(node => {
        // Track currencies to remove.
        CostHelper.add(unlockCost, node);

        // Unlock item.
        node.item!.unlocked = true;
        node.unlocked = true;

        this._storageService.addUnlocked(node.item!.guid);
        this._storageService.addUnlocked(node.guid);
        this._eventService.itemToggled.next(node.item!);
      });
    } else {
      // Lock all unlocked items.
      itemNodes.filter(n => n.item!.unlocked).forEach(node => {
        // Track currencies to refund.
        node.unlocked && CostHelper.add(unlockCost, node);

        // Lock item and all nodes referencing it.
        node.item!.unlocked = false;
        const refNodes = node.item!.nodes || [];
        refNodes.forEach(n => n.unlocked = false);

        this._storageService.removeUnlocked(node.item!.guid);
        this._storageService.removeUnlocked(...refNodes.map(n => n.guid));
        this._eventService.itemToggled.next(node.item!);
      });
    }

    // When unlocking, invert cost.
    if (shouldUnlock) { CostHelper.invert(unlockCost); }

    // Modify currencies.
    // TODO: this does not track the cost when locking nodes outside of this tree.
    this._currencyService.addTreeCost(unlockCost, this.tree);
  }

  async share(): Promise<void> {
    if (!navigator.share) { alert('Sharing is not supported by this browser.'); return; }

    const nodes = NodeHelper.all(this.tree.node);
    const cost = CostHelper.add(CostHelper.create(), ...nodes);
    const hasCost = !CostHelper.isEmpty(cost);
    const wCost = 24;
    const wGapX = 32;
    const wGapY = 40 + 18; // 24 is cost height, can probably reduce it.
    const wItem = 64;
    const wLine = 24;
    const wOffsetSide = 48;
    const wPadding = 10;
    const hCredit = 8;
    const hFooterName = 32;
    let hFooterCost = 0;
    if (hasCost) { hFooterCost += 32 + 2; } // + border
    const hFooter = hFooterName + hFooterCost;

    const calculateHeight = (h: number, node?: INode): number => {
      if (!node) { return 0; }
      return Math.max(h, calculateHeight(h + wOffsetSide, node.nw), calculateHeight(h + wOffsetSide, node.ne), calculateHeight(h + wItem + wGapY, node.n));
    }

    const hasRootCost = !CostHelper.isEmpty(this.tree.node);
    const width = wItem * 3 + wGapX * 2 + wPadding * 2;
    const height = calculateHeight(64, this.tree.node) + wPadding * 2 + (hasRootCost ? wCost : 0) + hCredit + hFooter;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { alert('Failed to render image.'); return; }
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    const loadImage = (url: string): Promise<{ url: string, img: HTMLImageElement}> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ url, img });
        img.onerror = reject;
        img.src = url;
      });
    };

    const imageUrlBackground =
      getComputedStyle(document.body).getPropertyValue('--background').match(/url\(([^)]+)\)/)?.[1] ||
      '/assets/game/background/peaks.webp';
    const imageUrlC = '/assets/game/icons/candle.png';
    const imageUrlH = '/assets/game/icons/heart.png';
    const imageUrlSc = '/assets/game/icons/season-candle.png';
    const imageUrlSh = '/assets/game/icons/season-heart.png';
    const imageUrlAc = '/assets/game/icons/ascended-candle.png';
    const imageUrlEc = '/assets/game/icons/ticket.png';
    const imageSeason = nodes.some(n => (n.item?.group === 'SeasonPass' || n.item?.group === 'Ultimate') && CostHelper.isEmpty(n))
      && this.tree.spirit?.season?.iconUrl || '';
    const imageUrls: Array<string> = [
      imageUrlBackground, imageUrlC, imageUrlH, imageUrlSc, imageUrlSh, imageUrlAc, imageUrlEc,
      ...new Set(nodes.map(n => n.item?.icon).filter(v => v) as Array<string>)
    ];
    if (imageSeason) { imageUrls.push(imageSeason); }
    let images: Array<{ url: string, img: HTMLImageElement }>;
    try {
      images = await Promise.all(imageUrls.map(loadImage));
    } catch (e) {
      console.error('Failed to load images:', e);
      alert('Failed to load images.');
      return;
    }

    const imageMap = new Map<string, HTMLImageElement>(images.map(v => [v.url, v.img]));

    /** Draws the background with a blur effect. */
    {
      ctx.filter = 'blur(4px) brightness(0.6)';
      const img = imageMap.get(imageUrlBackground)!;
      const imgAspectRatio = img.naturalWidth / img.naturalHeight;
      const canvasAspectRatio = canvas.width / canvas.height;

      let drawWidth, drawHeight;
      if (imgAspectRatio > canvasAspectRatio) {
        drawHeight = canvas.height;
        drawWidth = img.naturalWidth * (drawHeight / img.naturalHeight);
      } else {
        drawWidth = canvas.width;
        drawHeight = img.naturalHeight * (drawWidth / img.naturalWidth);
      }

      const xn = canvas.width / 2 - drawWidth / 2;
      const yn = canvas.height / 2 - drawHeight / 2;

      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, xn - 10, yn - 10, drawWidth + 20, drawHeight + 20);
      ctx.filter = 'none';
    }

    /** Draws a line between nodes, based on the current node coordinates and a direction */
    const drawLine = (x: number, y: number, direction: 'nw'|'ne'|'n') => {
      let x2: number, y2: number;
      if (direction === 'nw') {
        x -= 2; y += 24;
        x2 = x - wLine; y2 = y - wLine;
      } else if (direction === 'ne') {
        x += 2 + wItem; y += 24;
        x2 = x + wLine; y2 = y - wLine;
      } else {
        x += wItem / 2; y -= 3;
        x2 = x; y2 = y - wLine;
      }

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    type CostRenderData = { text: string; image: string; textWidth: number };
    const getCostData = (cost: ICost): CostRenderData | undefined => {
      let text = '';
      let image = '';
      if (cost.c) {
        text = cost.c.toString(); image = imageUrlC;
      } else if (cost.h) {
        text = cost.h.toString(); image = imageUrlH;
      } else if (cost.sc) {
        text = cost.sc.toString(); image = imageUrlSc;
      } else if (cost.sh) {
        text = cost.sh.toString(); image = imageUrlSh;
      } else if (cost.ac) {
        text = cost.ac.toString(); image = imageUrlAc;
      } else if (cost.ec) {
        text = cost.ec.toString(); image = imageUrlEc;
      }

      if (!text) { return undefined; }
      ctx.save();
      ctx.font = '18px sans-serif';
      const textWidth = ctx.measureText(text).width;
      ctx.restore();
      return { text, image, textWidth };
    }

    const drawCost = (data: CostRenderData, x: number, y: number, bg: boolean) => {
      if (!data.text) { return; }
      x -= data.textWidth! / 2 + wCost / 2 + 2;

      if (bg) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 2, data.textWidth! + wCost + 8, wCost + 4, 8);
        ctx.fill();
      }

      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#fff';
      const img = imageMap.get(data.image!)!;
      ctx.drawImage(img, x, y, wCost, wCost);
      ctx.fillText(data.text, x + wCost, y + 19); // y text offset
    }

    const drawSeason = (x: number, y: number) => {
      const img = imageMap.get(imageSeason);
      if (img) {
        ctx.drawImage(img, x - 4, y - 4, 32, 32);
      }
    }

    const drawNode = (node: INode, x: number, y: number) => {
      if (node.nw) {
        drawNode(node.nw, x - wItem - wGapX, y - wOffsetSide);
        drawLine(x, y, 'nw');
      }
      if (node.ne) {
        drawNode(node.ne, x + wItem + wGapX, y - wOffsetSide);
        drawLine(x, y, 'ne');
      }
      if (node.n) {
        drawNode(node.n, x, y - wItem - wGapY);
        drawLine(x, y, 'n');
      }

      const img = imageMap.get(node.item?.icon || '');
      if (img) {
        const costData = getCostData(node);
        costData && drawCost(costData, x + wItem / 2, y + wItem + 2, true);
        ctx.drawImage(img, x, y, wItem, wItem);
      }

      if (node.item?.group === 'SeasonPass' || node.item?.group === 'Ultimate') {
        drawSeason(x, y);
      }
    };


    // Node coordinates (top left corner).
    let x = wGapX + wItem + wPadding;
    let y = height - wPadding - wItem - (hasRootCost ? wCost : 0) - hFooter;
    drawNode(this.tree.node, x, y);

    // Footer
    x = 0; y = height - hFooter;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y, canvas.width, hFooter);
    ctx.strokeStyle = '#fff8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, y + hFooterName + 1);
    ctx.lineTo(canvas.width - 8, y + hFooterName + 1);
    ctx.stroke();

    // Draw name
    const name = this.name || this.tree.name || 'Spirit tree';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(name, canvas.width / 2, y + 23);
    ctx.textAlign = 'left';

    // Draw cost
    y += 32 + 6;
    const costDatas: Array<CostRenderData | undefined> = [];
    if (cost.c) { costDatas.push(getCostData({ c: cost.c })); }
    if (cost.h) { costDatas.push(getCostData({ h: cost.h })); }
    if (cost.sc) { costDatas.push(getCostData({ sc: cost.sc })); }
    if (cost.sh) { costDatas.push(getCostData({ sh: cost.sh })); }
    if (cost.ac) { costDatas.push(getCostData({ ac: cost.ac })); }
    if (cost.ec) { costDatas.push(getCostData({ ec: cost.ec })); }
    const costDataWidth = costDatas.filter(c => c).reduce((acc, v) => acc + v!.textWidth + wCost + 8, 0);
    x = (canvas.width - costDataWidth) / 2;

    costDatas.forEach(costData => {
      costData && drawCost(costData, x + costData.textWidth! / 2 + wCost / 2, y, false);
      x += costData!.textWidth! + wCost + 8;
    });

    // Draw attribution text
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.fillText('Icons by contributors of the Sky: CotL Wiki', canvas.width - 3, 12);
    ctx.textAlign = 'left';

    // Share
    canvas.toBlob(blob => {
      if (!blob) { alert('Rendering canvas failed.'); return; }

      const data: ShareData = {
        files: [ new File([blob], 'sky-planner-spirit-tree.png', { type: 'image/png' }) ],
        title: 'Sky: CotL Outfit Request',
      };

      if (!navigator.canShare(data)) { alert('Sharing is not supported on this device.'); return; }
      try { navigator.share(data); } catch { alert('Sharing failed.'); return; }
    });
  }
}
