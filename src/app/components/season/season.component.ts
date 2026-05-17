import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { DateHelper } from 'src/app/helpers/date-helper';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { IAPService } from 'src/app/services/iap.service';
import { TitleService } from 'src/app/services/title.service';
import { ItemListComponent } from '../item-list/item-list/item-list.component';
import { SpiritTreeComponent } from '../spirit-tree/spirit-tree.component';
import { CardComponent } from '../layout/card/card.component';
import { DurationComponent } from '../util/duration/duration.component';
import { DaysLeftComponent } from '../util/days-left/days-left.component';
import { NgIf } from '@angular/common';
import { DateComponent } from '../util/date/date.component';
import { MatIcon } from '@angular/material/icon';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { StorageService } from '@app/services/storage.service';
import { SubscriptionBag } from '@app/helpers/subscription-bag';
import { CalendarLinkComponent } from "../util/calendar-link/calendar-link.component";
import { IapCardComponent } from "../iap/iap-card/iap-card.component";
import { TreeHelper } from '@app/helpers/tree-helper';
import { ISeason, ISpirit, ISpiritTree, IShop, INode, IRevisedSpiritTree } from 'skygame-data';

@Component({
    selector: 'app-season',
    templateUrl: './season.component.html',
    styleUrls: ['./season.component.less'],
    imports: [WikiLinkComponent, RouterLink, MatIcon, DateComponent, NgIf, DaysLeftComponent, DurationComponent, CardComponent, SpiritTreeComponent, ItemListComponent, CalendarLinkComponent, IapCardComponent]
})
export class SeasonComponent implements OnDestroy {
  season!: ISeason;
  previousSeason?: ISeason;
  nextSeason?: ISeason;
  state: 'future' | 'active' | 'ended' | undefined;
  highlightIap?: string;
  highlightTree?: string;

  guide?: ISpirit;
  guideTree?: ISpiritTree;
  guideTreePostSeason?: ISpiritTree;
  spirits: Array<ISpirit> = [];
  spiritTrees: { [guid: string]: ISpiritTree } = {};
  shops: Array<IShop> = [];
  iapShops: Array<IShop> = [];

  includedTrees?: Array<ISpiritTree>;

  nodes: Set<INode> = new Set();

  hasBoughtSeasonPass = false;
  hasGiftedSeasonPass = false;
  sc: number = 0;
  scLeft: number = 0;
  sh: number = 0;
  shLeft: number = 0;

  private _subs = new SubscriptionBag();

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _iapService: IAPService,
    private readonly _storageService: StorageService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));

    this._subs.add(this._eventService.itemToggled.subscribe(v => this.onItemChanged()));
    this._subs.add(this._storageService.events.subscribe(() => {
      this.hasGiftedSeasonPass = _storageService.hasGifted(this.season.guid);
      this.hasBoughtSeasonPass = !this.hasGiftedSeasonPass && this._storageService.hasSeasonPass(this.season.guid);
    }));
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  onItemChanged(): void {
    this.calculateSc();
  }

  onQueryChanged(params: ParamMap): void {
    this.highlightIap = params.get('highlightIap') || undefined;
    this.highlightTree = params.get('highlightTree') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.initializeSeason(guid!);
  }

  private initializeSeason(guid: string): void {
    this.season = this._dataService.guidMap.get(guid!) as ISeason;
    this.state = DateHelper.getStateFromPeriod(this.season.date, this.season.endDate);
    this._titleService.setTitle(this.season.name);

    this.previousSeason = this.nextSeason = undefined;
    this._dataService.seasonConfig.items.forEach(s => {
      if (s.number == this.season.number - 1) { this.previousSeason = s; }
      else if (s.number == this.season.number + 1) { this.nextSeason = s; }
    });

    this.guide = undefined;
    this.spirits = [];
    this.spiritTrees = {};
    this.hasGiftedSeasonPass = this._storageService.hasGifted(guid);
    this.hasBoughtSeasonPass = !this.hasGiftedSeasonPass && this._storageService.hasSeasonPass(guid);
    this.season?.spirits?.forEach(spirit => {
      switch (spirit.type) {
        case 'Guide':
          this.guide = spirit;
          this.guideTree = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'DuringSeason') ?? spirit.tree;
          this.guideTreePostSeason = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'AfterSeason');
          break;
        case 'Season':
          this.spirits.push(spirit);
          this.spiritTrees[spirit.guid] = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'DuringSeason') ?? spirit.tree!;
          break;
      }
    });

    this.includedTrees = this.season.includedTrees;

    const shops = this.season.shops ?? [];
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.shops = shops.filter(s => s.itemList);
    this.calculateSc();
  }

  calculateSc(): void {
    this.sc = this.scLeft = this.sh = this.shLeft = 0;

    [this.guide, ...this.spirits].map(s => s?.tree).forEach(tree => {
      if (!tree) { return; }
      TreeHelper.getNodes(tree).forEach(n => {
        this.sc += n.sc || 0;
        this.sh += n.sh || 0;
        if (!n.unlocked && !n.item?.unlocked) {
          this.scLeft += n.sc || 0;
          this.shLeft += n.sh || 0;
        }
      });
    });
  }

  toggleSeasonPass(gifted: boolean): void {
    const newValue = gifted ? !this.hasGiftedSeasonPass : !this.hasBoughtSeasonPass;
    newValue && gifted ? this._storageService.addGifted(this.season.guid) : this._storageService.removeGifted(this.season.guid);
    newValue ? this._storageService.addSeasonPasses(this.season.guid) : this._storageService.removeSeasonPasses(this.season.guid);
  }
}
