import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, viewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DateTime } from 'luxon';
import { SubscriptionLike } from 'rxjs';
import { DateHelper } from 'src/app/helpers/date-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { INode } from 'src/app/interfaces/node.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { NodeService } from 'src/app/services/node.service';

@Component({
  selector: 'app-season-calculator',
  templateUrl: './season-calculator.component.html',
  styleUrl: './season-calculator.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonCalculatorComponent implements OnInit {
  @ViewChild('inpSc', { static: false }) inpSc!: ElementRef<HTMLInputElement>;

  season!: ISeason;
  trees: Array<ISpiritTree> = [];
  firstNodes: { [guid: string]: INode } = {};
  allNodes: Array<INode> = [];

  candleCount = 0;
  includesToday = true;
  ownSeasonPass = false;
  wantNodes: { [guid: string]: INode } = {};
  hasSkippedNode = false;
  hasSeasonPassNode = false;
  daysLeft = 0;
  daysRequired = 0;
  candlesRequired = 0;
  candlesAvailable = 0;

  nodeShowButtons?: INode;

  constructor(
    private readonly _dataService: DataService,
    private readonly _nodeService: NodeService
  ) {
    const seasons = _dataService.seasonConfig.items;
    const season = DateHelper.getActive(seasons) || seasons.at(-1)!;
    if (season.endDate < DateTime.now()) { return; }

    this.season = season!;
    this.trees = this.season.spirits.filter(s => s.type === 'Season').map(s => s.tree!);
    this.allNodes = [];
    this.firstNodes = this.trees.reduce((acc, t) => {
      this.allNodes.push(...NodeHelper.all(t.node));
      acc[t.node.guid] = t.node;
      return acc;
    }, {} as { [guid: string]: INode });
  }

  ngOnInit(): void {
    this.loadSettings();
    this.calculate();
  }

  toggleButtons(node: INode): void {
    this.nodeShowButtons = this.nodeShowButtons === node ? undefined : node;
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

    if (node.unlocked) {
      this._nodeService.lock(node);
      this.candleCount += node.sc || 0;
      this.candleCount = Math.min(999, this.candleCount);
    } else {
      this._nodeService.unlock(node);
      this.candleCount -= node.sc || 0;
      this.candleCount = Math.max(0, this.candleCount);
    }

    this.candleCountChanged();
    this.calculate();
    this.saveSettings();
  }

  onCandleInput(): void {
    this.candleInputChanged();
    this.calculate();
    this.saveSettings();
  }

  onCandleInputBlur(evt: Event): void {
    const target = evt.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    if (value <= 0) {
      target.value = '0';
    } else if (value > 999) {
      target.value = '999';
    } else if (!value) {
      target.value = '';
    }

    this.candleInputChanged();
    this.calculate();
    this.saveSettings();
  }

  candleInputChanged(): void {
    const target = this.inpSc.nativeElement;
    this.candleCount = Math.min(999, Math.max(parseInt(target.value, 10) || 0, 0));
  }

  candleCountChanged(): void {
    this.inpSc.nativeElement.value = (this.candleCount).toString();
  }

  addCandles(n: number): void {
    this.candleCount += n;
    this.candleCount = Math.min(999, Math.max(0, this.candleCount));
    this.candleCountChanged();
    this.calculate();
    this.saveSettings();
  }

  toggleIncludesToday(): void {
    this.includesToday = !this.includesToday;
    this.calculate();
    this.saveSettings();
  }

  toggleSeasonPass(): void {
    this.ownSeasonPass = !this.ownSeasonPass;
    this.calculate();
    this.saveSettings();
  }

  selectEverything(): void {
    this.wantNodes = {};
    this.hasSkippedNode = false;
    this.allNodes.forEach(n => {
      this.wantNodes[n.guid] = n;
    });

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

  // #region Settings

  private saveSettings(): void {
    const key = `season.calc.${this.season.guid}`;
    const today = DateHelper.todaySky();
    const data = {
      sp: this.ownSeasonPass ? 1 : 0,
      it: this.includesToday ? today.toISO() : '',
      sc: this.candleCount,
      wn: Object.keys(this.wantNodes),
    };

    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadSettings(): void {
    const key = `season.calc.${this.season.guid}`;
    const data = localStorage.getItem(key) || 'null';

    const today = DateHelper.todaySky().toISO();
    const parsed = JSON.parse(data) || {
      sp: 0,
      it: today,
      sc: 0,
      wn: [],
    };

    this.ownSeasonPass = !!parsed.sp;
    this.includesToday = parsed.it === today;
    this.candleCount = parsed.sc || 0;
    if (this.inpSc?.nativeElement) {
      this.inpSc.nativeElement.value = this.candleCount.toString();
    }

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
    const nodes = NodeHelper.traceMany(wantValues)

    let date = DateTime.now();
    if (this.season.date > date) { date = this.season.date; }

    this.daysLeft = DateHelper.daysBetween(date, this.season.endDate);
    if (this.includesToday) { this.daysLeft--; }

    const candlesPerDay = this.ownSeasonPass ? 6 : 5;
    this.candlesAvailable = this.daysLeft * candlesPerDay;

    this.hasSeasonPassNode = false;
    this.hasSkippedNode = false;

    this.candlesRequired = 0;

    for (const node of nodes) {
      this.hasSeasonPassNode = this.hasSeasonPassNode || node.item?.group === 'SeasonPass';
      this.hasSkippedNode = this.hasSkippedNode || (!wantSet.has(node) && !node.item?.unlocked);

      if (!node.item?.unlocked) {
        this.candlesRequired += node.sc || 0;
      }
    }

    this.candlesRequired -= this.candleCount;
    this.daysRequired = Math.ceil(this.candlesRequired / candlesPerDay);

    this.hasSkippedNode = nodes.some(n => !wantSet.has(n) && !n.item?.unlocked);
    this.hasSeasonPassNode = nodes.some(n => n.item?.group === 'SeasonPass' && !n.item?.unlocked);
  }
}
