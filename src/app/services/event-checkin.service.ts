import { Injectable, inject } from '@angular/core';
import { IEventInstance } from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { CurrencyService } from './currency.service';
import { DataService } from './data.service';

const KEY_PREFIX = 'event.checkin.';

/**
 * Daily event currency check-in — "I have collected today's event currency".
 *
 * Keyed per event (not per instance) to stay compatible with the event
 * calculator, which has always written `event.checkin.<event guid>`.
 *
 * Shared by every surface that renders the check-in (dashboard feature card,
 * daily tracker) so the stored key and the currency delta stay identical
 * between them.
 */
@Injectable({ providedIn: 'root' })
export class EventCheckinService {
  private readonly _currencyService = inject(CurrencyService);
  private readonly _dataService = inject(DataService);

  /** Key prefix; use with `EventService.storageChanged` to observe changes. */
  static readonly keyPrefix = KEY_PREFIX;
  static key(eventGuid: string): string { return `${KEY_PREFIX}${eventGuid}`; }

  /** Every event instance running right now. Events may overlap, so this is a list. */
  getActiveInstances(): Array<IEventInstance> {
    const active: Array<IEventInstance> = [];
    for (const event of this._dataService.eventConfig.items) {
      if (!event.instances?.length) { continue; }
      const instance = DateHelper.getActive(event.instances);
      if (instance) { active.push(instance); }
    }
    return active;
  }

  isCheckedIn(eventGuid: string): boolean {
    const stored = localStorage.getItem(EventCheckinService.key(eventGuid));
    return !!stored && stored === DateHelper.todaySky().toFormat('yyyy-MM-dd');
  }

  /** Toggles today's check-in and adds (or reverts) the instance's daily event currency. */
  toggle(event: MouseEvent, instance: IEventInstance): boolean {
    const guid = instance.event.guid;
    const next = !this.isCheckedIn(guid);
    if (next) {
      localStorage.setItem(EventCheckinService.key(guid), DateHelper.todaySky().toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(EventCheckinService.key(guid));
    }

    const daily = instance.calculatorData?.dailyCurrencyAmount || 0;
    if (daily) {
      const delta = next ? daily : -daily;
      this._currencyService.addEventCurrency(instance.guid, delta);
      this._currencyService.animateCurrencyGained(event, delta);
    }
    return next;
  }
}
