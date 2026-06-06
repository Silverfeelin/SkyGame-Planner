import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CostHelper } from '@app/helpers/cost-helper';
import { NodeHelper } from '@app/helpers/node-helper';
import { SubscriptionBag } from '@app/helpers/subscription-bag';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { TitleService } from '@app/services/title.service';
import { PercentagePipe } from '@app/pipes/percentage.pipe';
import { SpiritTypeIconComponent } from '@app/components/spirit-type-icon/spirit-type-icon.component';
import { AtmosSpiritTreeComponent } from '@app/redesign/spirit/spirit-tree/atmos-spirit-tree.component';
import { AtmosRealmConstellationComponent } from '../constellation/atmos-realm-constellation.component';
import { AtmosRealmQuickActionsComponent } from '../quick-actions/atmos-realm-quick-actions.component';
import { ICost, IRealm, ISpirit, ISpiritTree } from 'skygame-data';

interface ISpiritEntry {
  spirit: ISpirit;
  tree: ISpiritTree;
}

@Component({
  selector: 'app-atmos-realm',
  templateUrl: './atmos-realm.component.html',
  styleUrl: './atmos-realm.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon, SpiritTypeIconComponent, AtmosSpiritTreeComponent,
    AtmosRealmConstellationComponent, AtmosRealmQuickActionsComponent, PercentagePipe
  ]
})
export class AtmosRealmComponent implements OnInit, OnDestroy {
  @ViewChild('divSpiritTrees', { static: false }) divSpiritTrees?: ElementRef<HTMLElement>;

  realm!: IRealm;
  highlightTree?: string;
  spirits: Array<ISpiritEntry> = [];
  spiritCount = 0;
  seasonSpiritCount = 0;
  seasonGuideCount = 0;

  tier1Cost: ICost = {};
  tier1Spent: ICost = {};
  tier1Remaining: ICost = {};
  tier1Pct: ICost = {};
  tier2Cost: ICost = {};
  tier2Spent: ICost = {};
  tier2Remaining: ICost = {};
  tier2Pct: ICost = {};

  visibleRealms: ReadonlyArray<IRealm> = [];

  private readonly _subscriptions = new SubscriptionBag();

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.visibleRealms = this._dataService.realmConfig.items.filter(r => !r.hidden);
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  ngOnInit(): void {
    this._subscriptions.add(this._eventService.itemToggled.subscribe(() => this.calculateTierCosts()));
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  onQueryChanged(params: ParamMap): void {
    this.highlightTree = params.get('highlightTree') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.initializeRealm(guid!);
  }

  constellationSpiritClicked(spirit: ISpirit): void {
    this.highlightTree = spirit.tree?.guid;
    if (this.highlightTree && this.divSpiritTrees?.nativeElement) {
      this.divSpiritTrees.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const tree = this.divSpiritTrees.nativeElement.querySelector(
        `app-atmos-spirit-tree [data-tree="${spirit.tree?.guid}"]`
      ) as HTMLElement | null;
      tree?.closest('.atmos-realm__tree-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this._changeDetectorRef.markForCheck();
  }

  constellationRealmChanged(realm: IRealm): void {
    this.initializeRealm(realm.guid);
    document.title = `${realm.name} - Sky Planner`;
    window.history.replaceState(window.history.state, '', `/r/realm/${realm.guid}`);
  }

  private initializeRealm(guid: string): void {
    this.realm = this._dataService.guidMap.get(guid!) as IRealm;
    this._titleService.setTitle(this.realm.name);

    this.spirits = [];
    this.spiritCount = 0;
    this.seasonSpiritCount = 0;
    this.seasonGuideCount = 0;

    this.realm?.areas?.forEach(area => {
      area.spirits?.forEach(spirit => {
        if (spirit.type === 'Regular' || spirit.type === 'Elder') {
          this.spirits.push({ spirit, tree: spirit.treeRevisions?.at(-1) || spirit.tree! });
          this.spiritCount++;
        } else if (spirit.type === 'Season') {
          this.seasonSpiritCount++;
        } else if (spirit.type === 'Guide') {
          this.seasonGuideCount++;
        }
      });
    });

    if (this.realm.elder) {
      this.spirits.push({ spirit: this.realm.elder, tree: this.realm.elder.treeRevisions?.at(-1) || this.realm.elder.tree! });
    }

    this.calculateTierCosts();
    this._changeDetectorRef.markForCheck();
  }

  private calculateTierCosts(): void {
    this.tier1Cost = {}; this.tier1Spent = {}; this.tier1Remaining = {};
    this.tier2Cost = {}; this.tier2Spent = {}; this.tier2Remaining = {};

    this.spirits.forEach(data => {
      if (data.spirit.type === 'Elder') { return; }
      this.addTierCosts(data.tree);
    });

    this.tier1Pct = CostHelper.percentage(this.tier1Spent, this.tier1Cost);
    this.tier2Pct = CostHelper.percentage(this.tier2Spent, this.tier2Cost);

    this._changeDetectorRef.markForCheck();
  }

  private addTierCosts(tree: ISpiritTree): void {
    if (!tree?.node) { return; }
    for (const node of NodeHelper.allTier(tree.node)) {
      if (typeof node.tier !== 'number') { continue; }
      const cost = node.tier < 2 ? this.tier1Cost : this.tier2Cost;
      const remaining = node.tier < 2 ? this.tier1Remaining : this.tier2Remaining;
      const spent = node.tier < 2 ? this.tier1Spent : this.tier2Spent;

      CostHelper.add(cost!, node);
      node.unlocked || node.item?.unlocked ? CostHelper.add(spent!, node) : CostHelper.add(remaining!, node);
    }
  }
}
