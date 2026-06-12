import { ChangeDetectionStrategy, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { DateTime } from 'luxon';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import {
  ICalculatorData, ICalculatorDataTimedCurrency,
  INode, ISeason, ISpiritTree
} from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { NodeHelper } from '@app/helpers/node-helper';
import { CurrencyService } from '@app/services/currency.service';
import { DataService } from '@app/services/data.service';
import { NodeService } from '@app/services/node.service';
import { StorageService } from '@app/services/storage.service';
import { DateTimePipe } from '@app/pipes/date-time.pipe';
import {
  AtmosDraftWarningComponent,
  AtmosSpiritTreeComponent,
  AtmosSpiritTreeNodeClickEvent
} from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosSeasonQuickActionsComponent } from '../season/quick-actions/atmos-season-quick-actions.component';

@Component({
  selector: 'app-atmos-season-calculator',
  templateUrl: './atmos-season-calculator.component.html',
  styleUrl: './atmos-season-calculator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, DateTimePipe, AtmosSpiritTreeComponent, AtmosSeasonQuickActionsComponent, AtmosDraftWarningComponent]
})
export class AtmosSeasonCalculatorComponent implements OnInit {
  @ViewChild('inpSc', { static: false }) inpSc!: ElementRef<HTMLInputElement>;
  @ViewChildren('inpTimed', { read: ElementRef }) inpTimed!: QueryList<ElementRef<HTMLInputElement>>;

  private readonly _currencyService = inject(CurrencyService);
  private readonly _dataService = inject(DataService);
  private readonly _nodeService = inject(NodeService);
  private readonly _storageService = inject(StorageService);

  season!: ISeason;
  hasTiers = false;
  trees: ReadonlyArray<ISpiritTree> = [];
  firstNodes: { [guid: string]: INode } = {};
  allNodes: ReadonlyArray<INode> = [];
  now: DateTime = DateTime.now();

  calculatorData?: ICalculatorData;
  timedCurrencies: ReadonlyArray<ICalculatorDataTimedCurrency> = [];
  timedCurrencyCount: { [guid: string]: number } = {};
  timedCurrencyRemaining: { [guid: string]: number } = {};

  candleCount = 0;
  includesToday = true;
  hasSeasonPass = false;
  hasSeasonPassGifted = false;
  wantNodes: { [guid: string]: INode } = {};
  hasNodes = false;
  hasSkippedNode = false;
  hasSeasonPassNode = false;
  daysLeft = 0;
  daysRequired = 0;
  candlesRequired = 0;
  candlesAvailable = 0;

  toggleConnected = false;

  constructor() {
    const seasons = this._dataService.seasonConfig.items;
    const season = DateHelper.getActive(seasons) || seasons.at(-1)!;
    if (season.spirits.some(s => s.tree?.tier)) {
      this.season = season;
      this.hasTiers = true;
      return;
    }
    if (season.endDate < DateTime.now()) { return; }

    this.toggleConnected = this._storageService.getKey('tree.unlock-connected') !== '0';

    this.season = season;
    this.hasSeasonPass = this._storageService.hasSeasonPass(this.season.guid);
    this.hasSeasonPassGifted = this._storageService.hasGifted(this.season.guid);
    this.calculatorData = this.season.calculatorData;

    this.timedCurrencies = this.calculatorData?.timedCurrency || [];
    for (const timedCurrency of this.timedCurrencies) {
      timedCurrency.date = DateHelper.fromStringSky(timedCurrency.date)!;
      timedCurrency.endDate = DateHelper.fromStringSky(timedCurrency.endDate)!.endOf('day');
      this.timedCurrencyCount[timedCurrency.guid] = 0;
    }

    this.trees = this.season.spirits.filter(s => s.type === 'Season').map(s => s.tree!);
    const allNodes: INode[] = [];
    this.firstNodes = this.trees.reduce((acc, t) => {
      allNodes.push(...NodeHelper.all(t.node!));
      acc[t.node!.guid] = t.node!;
      return acc;
    }, {} as { [guid: string]: INode });
    this.allNodes = allNodes;
  }

  ngOnInit(): void {
    if (!this.season || this.hasTiers) { return; }
    this.loadSettings();
    this.calculate();
  }

  /** Single click cycles want → have → none (mirrors legacy two-button overlay). */
  onNodeClicked(evt: AtmosSpiritTreeNodeClickEvent): void {
    evt.event.preventDefault();
    evt.event.stopPropagation();
    const node = evt.node;
    const wanted = !!this.wantNodes[node.guid];
    const owned = !!node.item?.unlocked;

    if (!wanted && !owned) {
      // -> want
      this.wantNodes = { ...this.wantNodes, [node.guid]: node };
    } else if (wanted && !owned) {
      // -> have
      delete this.wantNodes[node.guid];
      this.wantNodes = { ...this.wantNodes };
      this.haveUnlock(node);
    } else {
      // owned -> clear
      this.haveLock(node);
    }

    this.calculate();
    this.saveSettings();
  }

  private haveUnlock(node: INode): void {
    const nodesToUnlock = this.toggleConnected ? NodeHelper.trace(node) : [node];
    if (this.hasSeasonPass) {
      for (const n of [...nodesToUnlock]) {
        if (n.nw?.item?.group !== 'SeasonPass') { continue; }
        nodesToUnlock.push(n.nw);
      }
    }
    for (const n of nodesToUnlock) {
      if (!n.unlocked && (!n.item || !n.item.unlocked)) {
        this.candleCount -= n.sc || 0;
      }
      this._nodeService.unlock(n);
    }
    this.candleCount = this._currencyService.clamp(this.candleCount);
    this.candleCountChanged();
  }

  private haveLock(node: INode): void {
    const nodesToLock = this.toggleConnected ? NodeHelper.all(node) : [node];
    for (const n of nodesToLock) {
      if (n.unlocked || n.item?.unlocked) {
        this.candleCount += n.sc || 0;
      }
      this._nodeService.lock(n);
    }
    this.candleCount = this._currencyService.clamp(this.candleCount);
    this.candleCountChanged();
  }

  onCurrencyInput(): void {
    this.candleInputChanged();
    this.calculate();
    this.saveSettings();
  }

  onCurrencyInputBlur(evt: Event): void {
    const target = evt.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    if (value <= 0) { target.value = '0'; }
    else if (value > 99999) { target.value = '99999'; }
    else if (!value) { target.value = ''; }
    this.candleInputChanged();
    this.calculate();
    this.saveSettings();
  }

  private candleInputChanged(): void {
    if (!this.inpSc?.nativeElement) { return; }
    this.candleCount = this._currencyService.clamp(parseInt(this.inpSc.nativeElement.value, 10) || 0);

    this.inpTimed?.forEach(inp => {
      const value = parseInt(inp.nativeElement.value, 10) || 0;
      const guid = inp.nativeElement.dataset['guid']!;
      this.timedCurrencyCount[guid] = value;
    });
    this.updateStoredCurrencies();
  }

  private candleCountChanged(): void {
    if (this.inpSc?.nativeElement) {
      this.inpSc.nativeElement.value = (this.candleCount).toString();
    }
    this.updateStoredCurrencies();
  }

  addCurrency(n?: number): void {
    this.candleCount += n ?? (this.hasSeasonPass ? 6 : 5);
    this.candleCount = this._currencyService.clamp(this.candleCount);
    this.candleCountChanged();
    this.calculate();
    this.saveSettings();
  }

  toggleIncludesToday(): void {
    this.includesToday = !this.includesToday;
    const checkinKey = `season.checkin.${this.season.guid}`;
    if (this.includesToday) {
      localStorage.setItem(checkinKey, DateTime.local({ zone: DateHelper.skyTimeZone }).toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(checkinKey);
    }
    this.calculate();
    this.saveSettings();
  }

  toggleSeasonPass(): void {
    this.hasSeasonPass = !this.hasSeasonPass;
    if (this.hasSeasonPass) {
      this._storageService.addSeasonPasses(this.season.guid);
      if (this.hasSeasonPassGifted) { this._storageService.addGifted(this.season.guid); }
    } else {
      this._storageService.removeSeasonPasses(this.season.guid);
      this._storageService.removeGifted(this.season.guid);
    }
    this.calculate();
    this.saveSettings();
  }

  selectEverything(): void {
    this.wantNodes = {};
    this.hasSkippedNode = false;
    this.allNodes.forEach(n => { this.wantNodes[n.guid] = n; });
    this.calculate();
    this.saveSettings();
  }

  selectFreeAll(): void {
    this.wantNodes = {};
    this.hasSkippedNode = false;
    this.allNodes.forEach(n => {
      if (n.item?.group === 'SeasonPass') { return; }
      this.wantNodes[n.guid] = n;
    });
    this.calculate();
    this.saveSettings();
  }

  selectFree(): void {
    this.wantNodes = {};
    this.hasSkippedNode = false;
    this.allNodes.forEach(n => {
      if (n.item?.group === 'SeasonPass') { return; }
      if (n?.item?.type === 'Special' && n.n?.item?.name === 'Season Heart') { return; }
      this.wantNodes[n.guid] = n;
    });
    this.calculate();
    this.saveSettings();
  }

  selectNothing(): void {
    this.wantNodes = {};
    this.hasSkippedNode = false;
    this.calculate();
    this.saveSettings();
  }

  // Helpers for template state.
  isOwned(node: INode): boolean { return !!node.item?.unlocked; }
  isWanted(node: INode): boolean { return !!this.wantNodes[node.guid]; }

  // Opaque all nodes that are not wanted and not owned (mirrors legacy
  // `[opaqueNodes]="true"` plus per-node "want/have" highlights).
  highlightedGuids(): ReadonlyArray<string> {
    return Object.keys(this.wantNodes);
  }

  // #region Settings

  private updateStoredCurrencies(): void {
    this._currencyService.setSeasonCurrency(this.season.guid, this.candleCount);
  }

  private saveSettings(): void {
    const key = `season.calc.${this.season.guid}`;
    const data = {
      tc: Object.keys(this.timedCurrencyCount).reduce((acc: { [guid: string]: number }, guid: string) => {
        const value = this.timedCurrencyCount[guid];
        if (value) { acc[guid] = value; }
        return acc;
      }, {} as { [guid: string]: number }),
      sc: this.candleCount,
      wn: Object.keys(this.wantNodes),
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadSettings(): void {
    const key = `season.calc.${this.season.guid}`;
    const data = localStorage.getItem(key) || 'null';
    const parsed = JSON.parse(data) || { tc: {}, wn: [] };

    const checkinKey = `season.checkin.${this.season.guid}`;
    const checkinDate = localStorage.getItem(checkinKey);
    if (checkinDate) {
      const d = DateTime.fromFormat(checkinDate, 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
      this.includesToday = d.hasSame(DateTime.now().setZone(DateHelper.skyTimeZone), 'day');
    } else { this.includesToday = false; }

    const seasonCurrencies = this._storageService.getCurrencies()?.seasonCurrencies;
    this.candleCount = seasonCurrencies?.[this.season.guid]?.candles || 0;
    if (this.inpSc?.nativeElement) {
      this.inpSc.nativeElement.value = this.candleCount.toString();
    }

    this.timedCurrencyCount = parsed.tc || {};
    this.timedCurrencies.forEach(timedCurrency => {
      this.timedCurrencyCount[timedCurrency.guid] ||= 0;
    });

    const nodeSet = new Map(this.allNodes.map(n => [n.guid, n]));
    this.wantNodes = parsed.wn.reduce((acc: { [guid: string]: INode }, guid: string) => {
      if (nodeSet.has(guid)) { acc[guid] = nodeSet.get(guid)!; }
      return acc;
    }, {} as { [guid: string]: INode });
  }

  // #endregion

  private calculate(): void {
    const wantValues = Object.values(this.wantNodes);
    const wantSet = new Set(wantValues);
    const nodes = NodeHelper.traceMany(wantValues);

    let date = DateTime.now();
    if (this.season.date > date) { date = this.season.date; }

    this.daysLeft = DateHelper.daysBetween(date, this.season.endDate);
    if (this.includesToday) { this.daysLeft--; }

    const candlesPerDay = this.hasSeasonPass ? 6 : 5;
    this.candlesAvailable = this.daysLeft * candlesPerDay;

    this.hasNodes = nodes.length > 0;
    this.hasSeasonPassNode = false;
    this.hasSkippedNode = false;
    this.candlesRequired = 0;

    for (const node of nodes) {
      this.hasSeasonPassNode = this.hasSeasonPassNode || node.item?.group === 'SeasonPass';
      this.hasSkippedNode = this.hasSkippedNode || (!wantSet.has(node) && !node.item?.unlocked);
      if (!node.item?.unlocked) { this.candlesRequired += node.sc || 0; }
    }

    this.candlesRequired -= this.candleCount;

    for (const timedCurrency of this.timedCurrencies) {
      const obtained = (this.timedCurrencyCount[timedCurrency.guid] || 0);
      const available = Math.max(0, timedCurrency.amount - obtained);
      this.timedCurrencyRemaining[timedCurrency.guid] = available;
      if (timedCurrency.endDate >= date) { this.candlesAvailable += available; }
    }

    this.daysRequired = Math.ceil(this.candlesRequired / candlesPerDay);
    this.hasSkippedNode = nodes.some(n => !wantSet.has(n) && !n.item?.unlocked);
    this.hasSeasonPassNode = nodes.some(n => n.item?.group === 'SeasonPass' && !n.item?.unlocked);
  }
}
