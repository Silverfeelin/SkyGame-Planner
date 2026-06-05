import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { ISpirit, ISpiritTree, IEvent } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { TitleService } from '@app/services/title.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { CurrencyService } from '@app/services/currency.service';
import { NodeService } from '@app/services/node.service';
import { SpiritTypePipe } from '@app/pipes/spirit-type.pipe';
import { SpiritTypeIconComponent } from '@app/components/spirit-type-icon/spirit-type-icon.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { CostHelper } from '@app/helpers/cost-helper';
import { NodeHelper } from '@app/helpers/node-helper';
import { AtmosSpiritTreeComponent, AtmosSpiritTreeNodeClickEvent } from '@app/redesign/shared/atmos-shared-widgets';

interface ITree {
  date?: DateTime;
  name: string;
  tree: ISpiritTree;
}

/**
 * Atmospheric spirit detail. Port of legacy `SpiritComponent`. Renders the
 * spirit summary card and a horizontally-scrolling track of all spirit trees
 * (current, revisions, TS, RS visits). Wires unlock/lock node clicks against
 * `NodeService` + `CurrencyService` so users can mutate progress here.
 */
@Component({
  selector: 'app-atmos-spirit',
  templateUrl: './atmos-spirit.component.html',
  styleUrl: './atmos-spirit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon,
    SpiritTypeIconComponent, WikiLinkComponent,
    AtmosSpiritTreeComponent
  ]
})
export class AtmosSpiritComponent {
  private readonly _dataService = inject(DataService);
  private readonly _titleService = inject(TitleService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _eventService = inject(EventService);
  private readonly _storageService = inject(StorageService);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _nodeService = inject(NodeService);

  readonly spirit = signal<ISpirit | undefined>(undefined);
  readonly trees = signal<ReadonlyArray<ITree>>([]);
  readonly highlightTree = signal<string | undefined>(undefined);
  readonly highlightItem = signal<string | undefined>(undefined);

  readonly typeName = computed<string | undefined>(() => {
    const s = this.spirit();
    return s ? new SpiritTypePipe().transform(s.type) : undefined;
  });

  readonly event = computed<IEvent | undefined>(() => {
    return this.spirit()?.eventInstanceSpirits?.at(-1)?.eventInstance?.event;
  });

  constructor() {
    this._route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    this._route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onNodeClicked(tree: ISpiritTree, evt: AtmosSpiritTreeNodeClickEvent): void {
    const node = evt.node;
    if (!node.item) { return; }
    const item = node.item;
    if (evt.event.ctrlKey || evt.event.shiftKey || evt.event.button === 1) { return; }

    const unlock = !item.unlocked;

    if (unlock && (item.group === 'SeasonPass' || item.group === 'Ultimate')) {
      const isFirstNode = node === item.nodes?.at(0);
      const season = item.season;
      if (isFirstNode && season && !this._storageService.hasSeasonPass(season.guid)) {
        const confirmed = confirm(
          `You've selected an item that requires the ${season.name} season pass. Do you want to unlock this item and the season pass?`
        );
        if (!confirmed) { return; }
        this._storageService.addSeasonPasses(season.guid);
      }
    }

    let toggleConnected = this._storageService.getKey('tree.unlock-connected') !== '0';
    if (!unlock && !node.unlocked) { toggleConnected = false; }

    const unlockCost = CostHelper.create();
    if (unlock) {
      const nodesToUnlock = toggleConnected ? NodeHelper.trace(node) : [node];
      for (const n of nodesToUnlock) {
        if (n.item && !n.item.unlocked) {
          this._nodeService.unlock(n);
          CostHelper.add(unlockCost, n);
        }
      }
    } else {
      const nodesToLock = toggleConnected ? NodeHelper.all(node) : [node];
      for (const n of nodesToLock) {
        if (n === node || n.unlocked) {
          this._nodeService.lock(n);
          CostHelper.add(unlockCost, n);
        }
      }
    }

    if (unlock) { CostHelper.invert(unlockCost); }
    this._currencyService.addTreeCost(unlockCost, tree);

    evt.event.preventDefault();
    evt.event.stopImmediatePropagation();
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightTree.set(p.get('highlightTree') || undefined);
    this.highlightItem.set(p.get('highlightItem') || undefined);
  }

  private onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    const spirit = this._dataService.guidMap.get(guid!) as ISpirit | undefined;
    this.spirit.set(spirit);
    if (!spirit) { return; }
    this._titleService.setTitle(spirit.name || 'Spirit');

    const ts = (spirit.travelingSpirits || []).map(ts => ({
      date: ts.date,
      name: 'Traveling Spirit #' + ts.number,
      tree: ts.tree
    }));

    const visits = (spirit.specialVisitSpirits || []).map((v, vi) => ({
      date: v.visit.date,
      name: v.visit.name || 'Visit #' + (vi + 1),
      tree: v.tree
    }));

    const sorted: ITree[] = ts.concat(visits);
    sorted.sort((a, b) => b.date!.diff(a.date!).as('milliseconds'));

    if (spirit.treeRevisions) {
      for (let i = spirit.treeRevisions.length - 1; i >= 0; i--) {
        const t = spirit.treeRevisions[i];
        sorted.push({ name: t.name || `Spirit tree (#${i + 2})`, tree: t });
      }
    }

    if (spirit.tree) {
      sorted.push({
        name: spirit.tree.name || (spirit.treeRevisions?.length ? 'Spirit tree (#1)' : 'Spirit tree'),
        tree: spirit.tree
      });
    }

    this.trees.set(sorted);
  }
}
