import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import L from 'leaflet';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { IArea } from 'src/app/interfaces/area.interface';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { MapInstanceService } from 'src/app/services/map-instance.service';
import { IMapInit } from 'src/app/services/map.service';
import { TitleService } from 'src/app/services/title.service';
import { PercentagePipe } from '../../../pipes/percentage.pipe';
import { SpiritTreeComponent } from '../../spirit-tree/spirit-tree.component';
import { RealmConstellationComponent } from '../realm-constellation/realm-constellation.component';
import { NgIf, NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SpiritTypeIconComponent } from '../../spirit-type-icon/spirit-type-icon.component';
import { WikiLinkComponent } from '../../util/wiki-link/wiki-link.component';

@Component({
    selector: 'app-realm',
    templateUrl: './realm.component.html',
    styleUrls: ['./realm.component.less'],
    providers: [MapInstanceService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WikiLinkComponent, RouterLink, SpiritTypeIconComponent, MatIcon, NgIf, RealmConstellationComponent, NgFor, SpiritTreeComponent, PercentagePipe]
})
export class RealmComponent implements OnInit, OnDestroy {
  @ViewChild('divSpiritTrees', { static: false }) divSpiritTrees?: ElementRef;

  realm!: IRealm;

  highlightTree?: string;
  spirits: Array<ISpirit> = [];
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

  private readonly _subscriptions = new SubscriptionBag();

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  ngOnInit(): void {
    this._eventService.itemToggled.subscribe(() => this.calculateTierCosts());
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
      // Scroll to trees
      this.divSpiritTrees.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Scroll to tree
      let tree = this.divSpiritTrees?.nativeElement.querySelector(`app-spirit-tree [data-tree="${spirit.tree?.guid}"]`) as HTMLElement;
      tree && tree.closest('.tree-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this._changeDetectorRef.markForCheck();
  }

  constellationRealmChanged(realm: IRealm): void {
    // Update realm on current page.
    this.initializeRealm(realm.guid);
    document.title = `${realm.name} - Sky Planner`;
    window.history.replaceState(window.history.state, '', `/realm/${realm.guid}`)

    // Navigation causes scroll top.
    //void this._router.navigate(['/realm', realm.guid]);
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
          this.spirits.push(spirit);
          this.spiritCount++;
        } else if (spirit.type === 'Season') {
          this.seasonSpiritCount++;
        } else if (spirit.type === 'Guide') {
          this.seasonGuideCount++;
        }
      });
    });

    if (this.realm.elder) {
      this.spirits.push(this.realm.elder);
    }

    this.calculateTierCosts();

    this._changeDetectorRef.markForCheck();
  }

  private calculateTierCosts(): void {
    this.tier1Cost = {}; this.tier1Spent = {}; this.tier1Remaining = {};
    this.tier2Cost = {}; this.tier2Spent = {}; this.tier2Remaining = {};

    this.spirits.forEach(spirit => {
      if (spirit.type === 'Elder') { return; }
      this.addTierCosts(spirit.tree!);
    });

    this.tier1Pct = CostHelper.percentage(this.tier1Spent, this.tier1Cost);
    this.tier2Pct = CostHelper.percentage(this.tier2Spent, this.tier2Cost);

    this._changeDetectorRef.markForCheck();
  }

  private addTierCosts(tree: ISpiritTree): void {
    if (!tree?.node) { return; }
    for (const node of  NodeHelper.allTier(tree.node)) {
      if (typeof node.tier !== 'number') { continue; }

      const cost = node.tier < 2 ? this.tier1Cost : this.tier2Cost;
      const remaining = node.tier < 2 ? this.tier1Remaining : this.tier2Remaining;
      const spent = node.tier < 2 ? this.tier1Spent : this.tier2Spent;

      CostHelper.add(cost!, node);
      node.unlocked || node.item?.unlocked ? CostHelper.add(spent!, node) : CostHelper.add(remaining!, node);
    }
  }
}

