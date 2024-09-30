import { ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { SpiritTreeComponent } from '../../spirit-tree/spirit-tree.component';
import { ItemListComponent } from '../../item-list/item-list/item-list.component';
import { MatIcon } from '@angular/material/icon';
import { ICalculatorData, ICalculatorDataTimedCurrency } from '@app/interfaces/calculator-data.interface';
import { DateTimePipe } from '@app/pipes/date-time.pipe';
import { CurrencyService } from '@app/services/currency.service';
import { StorageService } from '@app/services/storage.service';

@Component({
    selector: 'app-event-calculator',
    templateUrl: './event-calculator.component.html',
    styleUrl: './event-calculator.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink, MatIcon, ItemListComponent, SpiritTreeComponent, DateTimePipe]
})
export class EventCalculatorComponent {
  @ViewChild('inpEc', { static: false }) inpEc!: ElementRef<HTMLInputElement>;
  @ViewChild('inpC', { static: false }) inpC!: ElementRef<HTMLInputElement>;
  @ViewChild('inpH', { static: false }) inpH!: ElementRef<HTMLInputElement>;
  @ViewChild('inpAc', { static: false }) inpAc!: ElementRef<HTMLInputElement>;

  @ViewChildren('inpTimed', { read: ElementRef }) inpTimed!: QueryList<ElementRef<HTMLInputElement>>;

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
  now: DateTime = DateTime.now();

  timedCurrencies: Array<ICalculatorDataTimedCurrency> = [];
  timedCurrencyCount: {[guid: string]: number} = {};
  timedCurrencyRemaining: {[guid: string]: number} = {};

  currencyCount = 0;
  candleCount = 0;
  heartCount = 0;
  acCount = 0;
  includesToday = true;
  wantNodes: { [guid: string]: INode } = {};
  hasNodes = false;
  hasSkippedNode = false;
  daysLeft = 0;
  daysRequired = 0;

  wantListNodes: { [guid: string]: IItemListNode } = {};

  calculatorData?: ICalculatorData;
  currencyRequired = 0;
  currencyAvailable = 0;
  currencyPerDay?: number;

  candlesAvailable = 0;
  candlesRequired = 0;
  candlesPerDay = 20;
  candlesPerHeart = 3; // Hardcoded for now, doesn't account for gifts of light / heart events.
  heartsRequired = 0;
  acRequired = 0;

  nodeShowButtons?: INode;
  listNodeShowButtons?: INode;

  constructor(
    private readonly _currencyService: CurrencyService,
    private readonly _dataService: DataService,
    private readonly _nodeService: NodeService,
    private readonly _storageService: StorageService,
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
    this.calculatorData = instance.calculatorData;
    this.currencyPerDay = instance.calculatorData?.dailyCurrencyAmount || undefined;
    this.concluded = this.eventInstance.endDate < DateTime.now();

    // Load timed currencies.
    this.timedCurrencies = instance.calculatorData?.timedCurrency || [];
    for (const timedCurrency of this.timedCurrencies) {
      timedCurrency.date = DateHelper.fromStringSky(timedCurrency.date)!;
      timedCurrency.endDate = DateHelper.fromStringSky(timedCurrency.endDate)!.endOf('day');
      this.timedCurrencyCount[timedCurrency.guid] = 0;
    }

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
      if (node.unlocked) {
        this.currencyCount = this._currencyService.clamp(this.currencyCount + (node.ec || 0));
        this.candleCount = this._currencyService.clamp(this.candleCount + (node.c || 0));
        this.heartCount = this._currencyService.clamp(this.heartCount + (node.h || 0));
        this.acCount = this._currencyService.clamp(this.acCount + (node.ac || 0));
      }
      this._nodeService.lock(node);
    } else {
      this.currencyCount = this._currencyService.clamp(this.currencyCount - (node.ec || 0));
      this.candleCount = this._currencyService.clamp(this.candleCount - (node.c || 0));
      this.heartCount = this._currencyService.clamp(this.heartCount - (node.h || 0));
      this.acCount = this._currencyService.clamp(this.acCount - (node.ac || 0));
      this._nodeService.unlock(node);
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
      this.currencyCount = this._currencyService.clamp(this.currencyCount);
    } else {
      this._nodeService.unlock(node);
      this.currencyCount -= node.ec || 0;
      this.currencyCount = this._currencyService.clamp(this.currencyCount);
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
    } else if (value > 99999) {
      target.value = '99999';
    } else if (!value) {
      target.value = '';
    }

    this.currencyInputChanged();
    this.calculate();
    this.saveSettings();
  }

  currencyInputChanged(): void {
    const targetEc = this.inpEc.nativeElement;
    this.currencyCount = this._currencyService.clamp(parseInt(targetEc.value, 10) || 0);
    const targetC = this.inpC.nativeElement;
    this.candleCount = this._currencyService.clamp(parseInt(targetC.value, 10) || 0);
    const targetH = this.inpH.nativeElement;
    this.heartCount = this._currencyService.clamp(parseInt(targetH.value, 10) || 0);
    const targetAc = this.inpAc.nativeElement;
    this.acCount = this._currencyService.clamp(parseInt(targetAc.value, 10) || 0);

    this.inpTimed?.forEach(inp => {
      const value = parseInt(inp.nativeElement.value, 10) || 0;
      const guid = inp.nativeElement.dataset['guid']!;
      this.timedCurrencyCount[guid] = value;
    });

    this.updateStoredCurrencies();
  }

  currencyCountChanged(): void {
    this.inpEc.nativeElement.value = (this.currencyCount).toString();
    this.inpC.nativeElement.value = (this.candleCount).toString();
    this.inpH.nativeElement.value = (this.heartCount).toString();
    this.inpAc.nativeElement.value = (this.acCount).toString();
    this.updateStoredCurrencies();
  }

  addCurrency(): void {
    this.currencyCount += this.currencyPerDay!;
    this.currencyCount = this._currencyService.clamp(this.currencyCount);
    this.currencyCountChanged();
    this.calculate();
    this.saveSettings();
  }

  toggleIncludesToday(): void {
    this.includesToday = !this.includesToday;
    const checkinKey = `event.checkin.${this.event!.guid}`;
    if (this.includesToday) {
      localStorage.setItem(checkinKey, DateTime.local({ zone: DateHelper.skyTimeZone }).toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(checkinKey);
    }
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

  private updateStoredCurrencies(): void {
    this._currencyService.setRegularCost({ c: this.candleCount, h: this.heartCount, ac: this.acCount });
    this._currencyService.setEventCurrency(this.eventInstance.guid, this.currencyCount);
  }

  private saveSettings(): void {
    const key = `event.calc.${this.eventInstance.guid}`;
    const data = {
      tc: Object.keys(this.timedCurrencyCount).reduce((acc: { [guid: string]: number }, guid: string) => {
        const value = this.timedCurrencyCount[guid];
        if (value) { acc[guid] = value; }
        return acc;
      }, {} as { [guid: string]: number }),
      wn: Object.keys(this.wantNodes),
      ln: Object.keys(this.wantListNodes),
    };

    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadSettings(): void {
    const key = `event.calc.${this.eventInstance.guid}`;
    const data = localStorage.getItem(key) || 'null';
    const parsed = JSON.parse(data) || {
      tc: {},
      wn: [],
      ln: [],
    };

    const checkinKey = `event.checkin.${this.event!.guid}`;
    const checkinDate = localStorage.getItem(checkinKey);
    if (checkinDate) {
      const d = DateTime.fromFormat(checkinDate, 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
      this.includesToday = d.hasSame(DateTime.now().setZone(DateHelper.skyTimeZone), 'day');
    } else { this.includesToday = false; }

    const currencies = this._storageService.getCurrencies();
    const eventCurrency = currencies.eventCurrencies?.[this.eventInstance.guid] || { tickets: 0 };
    this.currencyCount = eventCurrency.tickets;
    this.candleCount = currencies.candles;
    this.heartCount = currencies.hearts;
    this.acCount = currencies.ascendedCandles;

    this.timedCurrencyCount = parsed.tc || {};
    this.timedCurrencies.forEach(timedCurrency => {
      this.timedCurrencyCount[timedCurrency.guid] ||= 0;
    });

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
    this.now = DateTime.now();

    // Get all wanted nodes that are not obtained.
    const allWantedValues = Object.values(this.wantNodes);
    const newWantedValues = allWantedValues.filter(n => !n.item?.unlocked);

    // Create a subtree with all the necessary nodes. Some of these may already be obtained.
    const requiredNodes = NodeHelper.traceMany(newWantedValues);

    // Get the days left to obtain currency.
    let date = DateTime.now();
    if (this.eventInstance.date > date) { date = this.eventInstance.date; }

    this.daysLeft = DateHelper.daysBetween(date, this.eventInstance.endDate);
    if (this.includesToday) { this.daysLeft--; }
    if (this.eventInstance.endDate < date) { this.daysLeft = 0; }

    // Get the available currency in the event.
    this.currencyAvailable = this.daysLeft * this.currencyPerDay!;
    this.candlesAvailable = this.daysLeft * this.candlesPerDay;

    this.hasNodes = allWantedValues.length > 0 || Object.keys(this.wantListNodes).length > 0;
    this.hasSkippedNode = false;

    // Calculate necessary currencies.
    this.currencyRequired = 0;
    this.candlesRequired = 0;
    this.heartsRequired = 0;
    this.acRequired = 0;

    // Handle all nodes in the tree to determine cost.
    for (const node of requiredNodes) {
      if (node.item?.unlocked) { continue; }
      this.currencyRequired += node.ec || 0;
      this.candlesRequired += node.c || 0;
      this.heartsRequired += node.h || 0;
      this.acRequired += node.ac || 0;
    }

    // Handle item shop nodes.
    for (const node of Object.values(this.wantListNodes)) {
      if (node.item.unlocked) { continue; }
      this.currencyRequired += node.ec || 0;
      this.candlesRequired += node.c || 0;
      this.heartsRequired += node.h || 0;
      this.acRequired += node.ac || 0;
    }

    this.currencyRequired -= this.currencyCount;

    // Check for available timed currencies.
    for (const timedCurrency of this.timedCurrencies) {
      const obtained = (this.timedCurrencyCount[timedCurrency.guid] || 0);
      let available = Math.max(0, timedCurrency.amount - obtained);
      this.timedCurrencyRemaining[timedCurrency.guid] = available;

      if (timedCurrency.endDate >= date) {
        this.currencyAvailable += available;
      }
    }

    this.daysRequired = Math.ceil(this.currencyRequired / this.currencyPerDay!);

    this.candlesRequired -= this.candleCount;
    this.heartsRequired -= this.heartCount;
    this.acRequired -= this.acCount;

    // Check if any required node is not marked as wanted.
    const newWantedSet = new Set(newWantedValues);
    this.hasSkippedNode = requiredNodes.some(n => !newWantedSet.has(n) && !n.item?.unlocked);
  }
}

