import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpecialVisit, ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { TitleService } from '@app/services/title.service';
import { StorageService } from '@app/services/storage.service';
import { EventService } from '@app/services/event.service';
import { CurrencyService } from '@app/services/currency.service';
import { NodeService } from '@app/services/node.service';
import { DateHelper } from '@app/helpers/date-helper';
import { CostHelper } from '@app/helpers/cost-helper';
import { NodeHelper } from '@app/helpers/node-helper';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { CalendarLinkComponent } from '@app/components/util/calendar-link/calendar-link.component';
import { DateComponent } from '@app/components/util/date/date.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { DurationComponent } from '@app/components/util/duration/duration.component';
import { AtmosSpiritTreeComponent, AtmosSpiritTreeNodeClickEvent } from '@app/redesign/shared/atmos-shared-widgets';

/**
 * Atmospheric returning-spirit (Special Visit) detail. Port of legacy
 * `ReturningSpiritComponent`. Renders the visit metadata + each spirit's tree.
 */
@Component({
  selector: 'app-atmos-returning-spirit',
  templateUrl: './atmos-returning-spirit.component.html',
  styleUrl: './atmos-returning-spirit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon,
    WikiLinkComponent, CalendarLinkComponent,
    DateComponent, DaysLeftComponent, DurationComponent,
    AtmosSpiritTreeComponent
  ]
})
export class AtmosReturningSpiritComponent {
  private readonly _dataService = inject(DataService);
  private readonly _titleService = inject(TitleService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _storageService = inject(StorageService);
  private readonly _eventService = inject(EventService);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _nodeService = inject(NodeService);

  readonly rs = signal<ISpecialVisit | undefined>(undefined);

  readonly state = computed<'future' | 'active' | 'ended' | undefined>(() => {
    const r = this.rs();
    return r ? DateHelper.getStateFromPeriod(r.date, r.endDate) : undefined;
  });

  constructor() {
    this._route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onNodeClicked(tree: ISpiritTree, evt: AtmosSpiritTreeNodeClickEvent): void {
    const node = evt.node;
    if (!node.item) { return; }
    const item = node.item;
    if (evt.event.ctrlKey || evt.event.shiftKey || evt.event.button === 1) { return; }

    const unlock = !item.unlocked;
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

  private onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    const rs = this._dataService.guidMap.get(guid!) as ISpecialVisit | undefined;
    this.rs.set(rs);
    if (rs) { this._titleService.setTitle(rs.name || 'Special Visit'); }
  }
}
