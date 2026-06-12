import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { INode, IRevisedSpiritTree, ISeason, IShop, ISpirit, ISpiritTree } from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { IAPService } from '@app/services/iap.service';
import { StorageService } from '@app/services/storage.service';
import { TitleService } from '@app/services/title.service';
import { DateComponent } from '@app/components/util/date/date.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { DurationComponent } from '@app/components/util/duration/duration.component';
import {
  AtmosDraftWarningComponent,
  AtmosIapCardComponent,
  AtmosItemListComponent,
  AtmosSpiritTreeComponent
} from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosSeasonQuickActionsComponent } from '../quick-actions/atmos-season-quick-actions.component';

interface ITreeEntry {
  readonly spirit: ISpirit;
  readonly tree: ISpiritTree;
  readonly label: 'Guide' | 'Season';
}

@Component({
  selector: 'app-atmos-season',
  templateUrl: './atmos-season.component.html',
  styleUrl: './atmos-season.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon, DateComponent, DaysLeftComponent, DurationComponent,
    AtmosSpiritTreeComponent, AtmosItemListComponent, AtmosIapCardComponent,
    AtmosSeasonQuickActionsComponent, AtmosDraftWarningComponent
  ]
})
export class AtmosSeasonComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _dataService = inject(DataService);
  private readonly _eventService = inject(EventService);
  private readonly _iapService = inject(IAPService);
  private readonly _storageService = inject(StorageService);
  private readonly _titleService = inject(TitleService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly season = signal<ISeason | undefined>(undefined);
  readonly previousSeason = signal<ISeason | undefined>(undefined);
  readonly nextSeason = signal<ISeason | undefined>(undefined);
  readonly state = signal<'future' | 'active' | 'ended' | undefined>(undefined);

  readonly guide = signal<ISpirit | undefined>(undefined);
  readonly guideTree = signal<ISpiritTree | undefined>(undefined);
  readonly guideTreePostSeason = signal<ISpiritTree | undefined>(undefined);
  readonly seasonTrees = signal<ReadonlyArray<ITreeEntry>>([]);
  readonly includedTrees = signal<ReadonlyArray<ISpiritTree> | undefined>(undefined);

  readonly shops = signal<ReadonlyArray<IShop>>([]);
  readonly iapShops = signal<ReadonlyArray<IShop>>([]);

  readonly hasBoughtSeasonPass = signal(false);
  readonly hasGiftedSeasonPass = signal(false);

  readonly sc = signal(0);
  readonly scLeft = signal(0);
  readonly sh = signal(0);
  readonly shLeft = signal(0);

  readonly highlightIap = signal<string | undefined>(undefined);
  readonly highlightTree = signal<string | undefined>(undefined);

  readonly showCalculator = computed(() => {
    const s = this.state();
    return s === 'active' || s === 'future';
  });

  ngOnInit(): void {
    this._route.queryParamMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(p => this.onQueryChanged(p));
    this._route.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(p => this.onParamsChanged(p));

    this._eventService.itemToggled.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => this.calculateSc());
    this._storageService.events.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      const s = this.season();
      if (!s) { return; }
      const gifted = this._storageService.hasGifted(s.guid);
      this.hasGiftedSeasonPass.set(gifted);
      this.hasBoughtSeasonPass.set(!gifted && this._storageService.hasSeasonPass(s.guid));
    });
  }

  toggleSeasonPass(gifted: boolean): void {
    const s = this.season();
    if (!s) { return; }
    const newValue = gifted ? !this.hasGiftedSeasonPass() : !this.hasBoughtSeasonPass();
    newValue && gifted ? this._storageService.addGifted(s.guid) : this._storageService.removeGifted(s.guid);
    newValue ? this._storageService.addSeasonPasses(s.guid) : this._storageService.removeSeasonPasses(s.guid);
  }

  private onQueryChanged(params: ParamMap): void {
    this.highlightIap.set(params.get('highlightIap') ?? undefined);
    this.highlightTree.set(params.get('highlightTree') ?? undefined);
  }

  private onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    if (!guid) { return; }
    this.initializeSeason(guid);
  }

  private initializeSeason(guid: string): void {
    const season = this._dataService.guidMap.get(guid) as ISeason | undefined;
    if (!season) { return; }
    this.season.set(season);
    this.state.set(DateHelper.getStateFromPeriod(season.date, season.endDate));
    this._titleService.setTitle(season.name);

    let prev: ISeason | undefined;
    let next: ISeason | undefined;
    this._dataService.seasonConfig.items.forEach(s => {
      if (s.number === season.number - 1) { prev = s; }
      else if (s.number === season.number + 1) { next = s; }
    });
    this.previousSeason.set(prev);
    this.nextSeason.set(next);

    let guide: ISpirit | undefined;
    let guideTree: ISpiritTree | undefined;
    let guideTreePost: ISpiritTree | undefined;
    const seasonTrees: ITreeEntry[] = [];

    season.spirits?.forEach(spirit => {
      switch (spirit.type) {
        case 'Guide':
          guide = spirit;
          guideTree = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'DuringSeason') ?? spirit.tree;
          guideTreePost = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'AfterSeason');
          break;
        case 'Season': {
          const tree = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'DuringSeason') ?? spirit.tree;
          if (tree) {
            seasonTrees.push({ spirit, tree, label: 'Season' });
          }
          break;
        }
      }
    });
    this.guide.set(guide);
    this.guideTree.set(guideTree);
    this.guideTreePostSeason.set(guideTreePost);
    this.seasonTrees.set(seasonTrees);
    this.includedTrees.set(season.includedTrees);

    this.hasGiftedSeasonPass.set(this._storageService.hasGifted(guid));
    this.hasBoughtSeasonPass.set(!this.hasGiftedSeasonPass() && this._storageService.hasSeasonPass(guid));

    const shops = season.shops ?? [];
    this.iapShops.set(shops.filter(s => s.iaps?.length));
    this.shops.set(shops.filter(s => s.itemList));
    this.calculateSc();
  }

  private calculateSc(): void {
    let sc = 0, scLeft = 0, sh = 0, shLeft = 0;
    const trees: Array<ISpiritTree | undefined> = [];
    const guide = this.guide();
    if (guide?.tree) { trees.push(guide.tree); }
    for (const entry of this.seasonTrees()) { trees.push(entry.spirit.tree); }

    for (const tree of trees) {
      if (!tree) { continue; }
      const nodes: INode[] = TreeHelper.getNodes(tree);
      for (const n of nodes) {
        sc += n.sc || 0;
        sh += n.sh || 0;
        if (!n.unlocked && !n.item?.unlocked) {
          scLeft += n.sc || 0;
          shLeft += n.sh || 0;
        }
      }
    }

    this.sc.set(sc);
    this.scLeft.set(scLeft);
    this.sh.set(sh);
    this.shLeft.set(shLeft);
  }
}
