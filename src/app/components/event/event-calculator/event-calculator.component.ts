import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IEvent, IEventInstance, IEventInstanceSpirit } from 'src/app/interfaces/event.interface';
import { IItemListNode } from 'src/app/interfaces/item-list.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { IShop } from 'src/app/interfaces/shop.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { DataService } from 'src/app/services/data.service';
import { NodeService } from 'src/app/services/node.service';

@Component({
  selector: 'app-event-calculator',
  templateUrl: './event-calculator.component.html',
  styleUrl: './event-calculator.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCalculatorComponent {
  @ViewChild('inpEc', { static: false }) inpEc!: ElementRef<HTMLInputElement>;
  @ViewChild('inpC', { static: false }) inpC!: ElementRef<HTMLInputElement>;
  @ViewChild('inpH', { static: false }) inpH!: ElementRef<HTMLInputElement>;

  guid?: string;
  event!: IEvent;
  eventInstance!: IEventInstance;
  year!: string;
  concluded = false;
  spirits: Array<IEventInstanceSpirit> = [];
  trees: Array<ISpiritTree> = [];
  firstNodes: { [guid: string]: INode } = {};
  allNodes: Array<INode> = [];
  shops: Array<IShop> = [];
  allListNodes: Array<IItemListNode> = [];

  currencyCount = 0;
  candleCount = 0;
  heartCount = 0;
  includesToday = true;
  wantNodes: { [guid: string]: INode } = {};
  hasNodes = false;
  hasSkippedNode = false;
  daysLeft = 0;
  daysRequired = 0;

  wantListNodes: { [guid: string]: IItemListNode } = {};

  currencyRequired = 0;
  currencyAvailable = 0;
  currencyPerDay?: number;

  candlesAvailable = 0;
  candlesRequired = 0;
  candlesPerDay = 20;
  candlesPerHeart = 3; // Hardcoded for now, doesn't account for gifts of light / heart events.
  heartsRequired = 0;

  nodeShowButtons?: INode;
  listNodeShowButtons?: INode;

  constructor(
    private readonly _dataService: DataService,
    private readonly _nodeService: NodeService,
    private readonly _route: ActivatedRoute
  ) {
    this.guid = _route.snapshot.queryParamMap.get('guid') || '';
    let instance: IEventInstance | undefined;
    if (this.guid) {
      instance = _dataService.guidMap.get(this.guid) as IEventInstance;
    } else {
      const eventInstances = _dataService.eventConfig.items.map(e => DateHelper.getActive(e.instances)).filter(e => e) as Array<IEventInstance>;
      eventInstances.sort((a, b) => a.date.toMillis() - b.date.toMillis());
      instance = eventInstances.at(-1);
    }
    if (!instance) { return; }
    this.year = instance.date.toFormat('yyyy');

    this.event = instance.event;
    this.eventInstance = instance;
    this.currencyPerDay = instance.currencyPerDay || undefined;
    this.concluded = this.eventInstance.endDate < DateTime.now();

    this.spirits = this.eventInstance.spirits.filter(s => s.tree);
    this.trees = this.spirits.map(s => s.tree!);
    this.allNodes = [];
    this.firstNodes = this.trees.reduce((acc, t) => {
      this.allNodes.push(...NodeHelper.all(t.node));
      acc[t.node.guid] = t.node;
      return acc;
    }, {} as { [guid: string]: INode });

    this.shops = (this.eventInstance.shops ?? []).filter(s => s.itemList?.items?.length);
    this.allListNodes = this.shops.map(s => s.itemList!.items).flat();
  }

  ngOnInit(): void {
    if (!this.eventInstance) { return; }
    this.loadSettings();
    this.calculate();
  }

  toggleButtons(node: INode): void {
    this.nodeShowButtons = this.nodeShowButtons === node ? undefined : node;
  }

  toggleListButtons(node: IItemListNode): void {
    this.listNodeShowButtons = this.listNodeShowButtons === node ? undefined : node;
  }

  wantNode(node: INode, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.nodeShowButtons = undefined;
    if (this.wantNodes[node.guid]) {
      delete this.wantNodes[node.guid];
    } else {
      this.wantNodes[node.guid] = node;
    }

    this.calculate();
    this.saveSettings();
  }

  haveNode(node: INode, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.nodeShowButtons = undefined;

    if (node.unlocked || node.item?.unlocked) {
      this._nodeService.lock(node);
      this.currencyCount += node.ec || 0;
      this.currencyCount = Math.min(999, this.currencyCount);
    } else {
      this._nodeService.unlock(node);
      this.currencyCount -= node.ec || 0;
      this.currencyCount = Math.max(0, this.currencyCount);
    }

    this.currencyCountChanged();
    this.calculate();
    this.saveSettings();
  }

  wantListNode(node: IItemListNode, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.listNodeShowButtons = undefined;
    if (this.wantListNodes[node.guid]) {
      delete this.wantListNodes[node.guid];
    } else {
      this.wantListNodes[node.guid] = node;
    }

    this.calculate();
    this.saveSettings();
  }

  haveListNode(node: IItemListNode, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.listNodeShowButtons = undefined;

    if (node.unlocked) {
      this._nodeService.lock(node);
      this.currencyCount += node.ec || 0;
      this.currencyCount = Math.min(999, this.currencyCount);
    } else {
      this._nodeService.unlock(node);
      this.currencyCount -= node.ec || 0;
      this.currencyCount = Math.max(0, this.currencyCount);
    }
  }

  onCurrencyInput(): void {
    this.currencyInputChanged();
    this.calculate();
    this.saveSettings();
  }

  onCurrencyInputBlur(evt: Event): void {
    const target = evt.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    if (value <= 0) {
      target.value = '0';
    } else if (value > 999) {
      target.value = '999';
    } else if (!value) {
      target.value = '';
    }

    this.currencyInputChanged();
    this.calculate();
    this.saveSettings();
  }

  currencyInputChanged(): void {
    const targetEc = this.inpEc.nativeElement;
    this.currencyCount = Math.min(999, Math.max(parseInt(targetEc.value, 10) || 0, 0));
    const targetC = this.inpC.nativeElement;
    this.candleCount = Math.min(999, Math.max(parseInt(targetC.value, 10) || 0, 0));
    const targetH = this.inpH.nativeElement;
    this.heartCount = Math.min(999, Math.max(parseInt(targetH.value, 10) || 0, 0));
  }

  currencyCountChanged(): void {
    this.inpEc.nativeElement.value = (this.currencyCount).toString();
    this.inpC.nativeElement.value = (this.candleCount).toString();
    this.inpH.nativeElement.value = (this.heartCount).toString();
  }

  addCurrency(): void {
    this.currencyCount += this.currencyPerDay!;
    this.currencyCount = Math.min(999, Math.max(0, this.currencyCount));
    this.currencyCountChanged();
    this.calculate();
    this.saveSettings();
  }

  toggleIncludesToday(): void {
    this.includesToday = !this.includesToday;
    this.calculate();
    this.saveSettings();
  }

  selectEverything(): void {
    this.wantNodes = {};
    this.hasSkippedNode = false;
    this.allNodes.forEach(n => {
      this.wantNodes[n.guid] = n;
    });
    this.wantListNodes = {};
    this.allListNodes.forEach(n => {
      this.wantListNodes[n.guid] = n;
    });

    this.calculate();
    this.saveSettings();
  }

  selectNothing(): void {
    this.wantNodes = {};
    this.wantListNodes = {};
    this.hasSkippedNode = false;
    this.calculate();
    this.saveSettings();
  }

  // #region Settings

  private saveSettings(): void {
    const key = `event.calc.${this.eventInstance.guid}`;
    const today = DateHelper.todaySky();
    const data = {
      it: this.includesToday ? today.toISO() : '',
      ec: this.currencyCount,
      c: this.candleCount,
      h: this.heartCount,
      wn: Object.keys(this.wantNodes),
      ln: Object.keys(this.wantListNodes),
    };

    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadSettings(): void {
    const key = `event.calc.${this.eventInstance.guid}`;
    const data = localStorage.getItem(key) || 'null';

    const today = DateHelper.todaySky().toISO();
    const parsed = JSON.parse(data) || {
      it: today,
      ec: 0,
      c: 0,
      h: 0,
      wn: [],
    };

    this.includesToday = parsed.it === today;
    this.currencyCount = parsed.ec || 0;
    if (this.inpEc?.nativeElement) {
      this.inpEc.nativeElement.value = this.currencyCount.toString();
    }

    this.candleCount = parsed.c || 0;
    if (this.inpC?.nativeElement) {
      this.inpC.nativeElement.value = this.candleCount.toString();
    }

    this.heartCount = parsed.h || 0;
    if (this.inpH?.nativeElement) {
      this.inpH.nativeElement.value = this.heartCount.toString();
    }

    const nodeSet = new Map(this.allNodes.map(n => [n.guid, n]));
    this.wantNodes = parsed.wn.reduce((acc: { [guid: string]: INode }, guid: string) => {
      if (nodeSet.has(guid)) { acc[guid] = nodeSet.get(guid)!; }
      return acc;
    }, {} as { [guid: string]: INode });

    const listNodeSet = new Map();
    this.shops.forEach(s => { s.itemList!.items.forEach(i => { listNodeSet.set(i.guid, i); }); });
    this.wantListNodes = parsed.ln.reduce((acc: { [guid: string]: IItemListNode }, guid: string) => {
      if (listNodeSet.has(guid)) { acc[guid] = listNodeSet.get(guid)!; }
      return acc;
    }, {} as { [guid: string]: IItemListNode });
  }

  // #endregion

  private calculate(): void {
    const wantValues = Object.values(this.wantNodes);
    const wantSet = new Set(wantValues);
    const nodes = NodeHelper.traceMany(wantValues)

    let date = DateTime.now();
    if (this.eventInstance.date > date) { date = this.eventInstance.date; }

    this.daysLeft = DateHelper.daysBetween(date, this.eventInstance.endDate);
    if (this.includesToday) { this.daysLeft--; }
    if (this.eventInstance.endDate < date) { this.daysLeft = 0; }

    this.currencyAvailable = this.daysLeft * this.currencyPerDay!;
    this.candlesAvailable = this.daysLeft * this.candlesPerDay;

    this.hasNodes = nodes.length > 0 || Object.keys(this.wantListNodes).length > 0;
    this.hasSkippedNode = false;

    this.currencyRequired = 0;
    this.candlesRequired = 0;
    this.heartsRequired = 0;

    for (const node of nodes) {
      this.hasSkippedNode = this.hasSkippedNode || (!wantSet.has(node) && !node.item?.unlocked);

      if (!node.item?.unlocked) {
        this.currencyRequired += node.ec || 0;
        this.candlesRequired += node.c || 0;
        this.heartsRequired += node.h || 0;
      }
    }

    for (const shop of this.shops) {
      for (const item of shop.itemList!.items) {
        if (!item.unlocked) {
          this.currencyRequired += item.ec || 0;
          this.candlesRequired += item.c || 0;
          this.heartsRequired += item.h || 0;
        }
      }
    }

    this.currencyRequired -= this.currencyCount;
    this.daysRequired = Math.ceil(this.currencyRequired / this.currencyPerDay!);

    this.candlesRequired -= this.candleCount;
    this.heartsRequired -= this.heartCount;

    this.hasSkippedNode = nodes.some(n => !wantSet.has(n) && !n.item?.unlocked);
  }
}

