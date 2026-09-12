import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { ISpirit, ISpiritTree, IEvent } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { TitleService } from '@app/services/title.service';
import { SpiritTypePipe } from '@app/pipes/spirit-type.pipe';
import { SpiritTypeIconComponent } from '@app/components/spirit/type-icon/spirit-type-icon.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { SpiritTreeComponent } from '@app/components/shared/shared-widgets';
import { QuickActionsComponent } from '@app/components/shared/quick-actions/quick-actions.component';

interface IQuickAction {
  label: string;
  /** Material ligature icon, or `svgIcon` for a sprite icon. */
  icon?: string;
  svgIcon?: string;
  route: string;
  queryParams?: Record<string, string>;
}

interface ITree {
  date?: DateTime;
  name: string;
  tree: ISpiritTree;
}

/**
 * Spirit detail. Renders the spirit summary card and a horizontally-scrolling
 * track of all spirit trees (current, revisions, TS, RS visits). Wires
 * unlock/lock node clicks against `NodeService` + `CurrencyService` so users
 * can mutate progress here.
 */
@Component({
  selector: 'app-spirit',
  templateUrl: './spirit.component.html',
  styleUrl: './spirit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon,
    SpiritTypeIconComponent, WikiLinkComponent,
    SpiritTreeComponent, QuickActionsComponent
  ]
})
export class SpiritComponent {
  private readonly _dataService = inject(DataService);
  private readonly _titleService = inject(TitleService);
  private readonly _route = inject(ActivatedRoute);

  readonly spirit = signal<ISpirit | undefined>(undefined);
  readonly trees = signal<ReadonlyArray<ITree>>([]);
  readonly highlightTree = signal<string | undefined>(undefined);
  readonly highlightItem = signal<string | undefined>(undefined);

  readonly typeName = computed<string | undefined>(() => {
    const s = this.spirit();
    return s ? new SpiritTypePipe().transform(s.type) : undefined;
  });

  /** Links back to the spirit lists this spirit appears on. */
  readonly quickActions = computed<ReadonlyArray<IQuickAction>>(() => {
    const s = this.spirit();
    if (!s) { return []; }

    const actions: IQuickAction[] = [
      { label: 'All spirits', icon: 'person', route: '/spirit' }
    ];

    switch (s.type) {
      case 'Regular':
        actions.push({ label: 'Regular spirits', svgIcon: 'candle', route: '/spirit', queryParams: { type: 'Regular' } });
        break;
      case 'Elder':
        actions.push({ label: 'Elder spirits', svgIcon: 'ascended-candle', route: '/spirit', queryParams: { type: 'Elder' } });
        break;
      case 'Season':
        actions.push({ label: 'Season spirits', svgIcon: 'season-candle', route: '/spirit', queryParams: { type: 'Season' } });
        actions.push({ label: 'Elusive spirits', icon: 'timer', route: '/spirit/elusive' });
        break;
      case 'Guide':
        actions.push({ label: 'Season guides', svgIcon: 'season-heart', route: '/spirit', queryParams: { type: 'Guide' } });
        break;
      case 'Event':
        actions.push({ label: 'Event spirits', icon: 'event', route: '/spirit', queryParams: { type: 'Event' } });
        break;
      case 'Special':
        actions.push({ label: 'Special spirits', icon: 'star', route: '/spirit', queryParams: { type: 'Special' } });
        break;
    }

    if (s.travelingSpirits?.length) {
      actions.push({ label: 'Traveling spirits', icon: 'hiking', route: '/ts' });
    }
    if (s.specialVisitSpirits?.length) {
      actions.push({ label: 'Special visits', icon: 'flight', route: '/rs' });
    }

    return actions;
  });

  readonly event = computed<IEvent | undefined>(() => {
    return this.spirit()?.eventInstanceSpirits?.at(-1)?.eventInstance?.event;
  });

  constructor() {
    this._route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    this._route.paramMap.subscribe(p => this.onParamsChanged(p));
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
