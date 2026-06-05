import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { IEvent, IEventInstance, ICost } from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { DateComponent } from '@app/components/util/date/date.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { DiscordLinkComponent } from '@app/components/util/discord-link/discord-link.component';

export type AtmosEventCardSection =
  | 'select' | 'img' | 'date' | 'overview' | 'list' | 'recent'
  | 'upcoming' | 'cost' | 'dailies' | 'checkin' | 'calculator';

export interface AtmosEventCardOptions {
  show?: ReadonlyArray<AtmosEventCardSection>;
}

/**
 * Atmospheric event summary card. Mirrors `EventCardComponent`.
 */
@Component({
  selector: 'app-atmos-event-card',
  templateUrl: './atmos-event-card.component.html',
  styleUrl: './atmos-event-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, CostComponent, DateComponent, DaysLeftComponent, DiscordLinkComponent]
})
export class AtmosEventCardComponent {
  readonly event = input<IEvent | undefined>(undefined);
  readonly instance = input<IEventInstance | undefined>(undefined);
  readonly options = input<AtmosEventCardOptions>({ show: ['img', 'list', 'recent'] });
  readonly checkedIn = input<boolean>(false);

  readonly eventSelected = output<IEvent>();
  readonly checkinToggle = output<MouseEvent>();

  readonly sections = computed<Record<string, boolean>>(() => {
    const show = this.options().show ?? [];
    const map: Record<string, boolean> = {};
    for (const s of show) { map[s] = true; }
    return map;
  });

  readonly imageStyle = computed<string | undefined>(() => {
    const url = this.event()?.imageUrl;
    return url ? `url('${url}')` : undefined;
  });

  readonly lastInstance = computed<IEventInstance | undefined>(() => {
    const ev = this.event();
    if (!ev?.instances?.length) { return undefined; }
    const now = DateTime.now();
    return DateHelper.getActive(ev.instances) ?? ev.instances.findLast(i => i.date < now);
  });

  readonly nextInstance = computed<IEventInstance | undefined>(() => {
    const ev = this.event();
    if (!ev?.instances?.length) { return undefined; }
    return DateHelper.getUpcoming(ev.instances);
  });

  readonly cost = computed<ICost | undefined>(() => {
    const inst = this.instance();
    if (!inst?.spirits?.length) { return undefined; }
    const nodes = inst.spirits.flatMap(s => s.tree ? TreeHelper.getNodes(s.tree) : []);
    const cost = CostHelper.add(CostHelper.create(), ...nodes);
    inst.shops?.filter(s => s.itemList?.items?.length).forEach(s => {
      CostHelper.add(cost, ...s.itemList!.items);
    });
    return cost;
  });

  readonly remainingCost = computed<ICost | undefined>(() => {
    const inst = this.instance();
    if (!inst?.spirits?.length) { return undefined; }
    const nodes = inst.spirits.flatMap(s => s.tree ? TreeHelper.getNodes(s.tree) : []);
    const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    const remaining = CostHelper.add(CostHelper.create(), ...locked);
    inst.shops?.filter(s => s.itemList?.items?.length).forEach(s => {
      const lockedItems = s.itemList!.items.filter(i => i.item && !i.item.unlocked);
      CostHelper.add(remaining, ...lockedItems);
    });
    return remaining;
  });

  selectEvent(): void {
    const e = this.event();
    if (e) { this.eventSelected.emit(e); }
  }

  onCheckin(event: MouseEvent): void {
    this.checkinToggle.emit(event);
  }
}
