import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ICost } from '@app/interfaces/cost.interface';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { DateHelper } from '@app/helpers/date-helper';
import { ISeason } from '@app/interfaces/season.interface';
import { IEventInstance } from '@app/interfaces/event.interface';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  constructor(
    private readonly _storageService: StorageService
  ) {
  }

  /**
   * Adds an ICost using the context of a spirit tree.
   * The season/event cost is added to the respective currency only if it's ongoing.
   * @remarks The cost should be inverted to subtract it!
   */
  addTreeCost(cost: ICost, tree: ISpiritTree): void {
    const eventInstance = tree?.eventInstanceSpirit?.eventInstance;
    const season = tree?.spirit?.season;
    this.addCost(cost, season, eventInstance);
  }

  addCost(cost: ICost, season?: ISeason, eventInstance?: IEventInstance): void {
    const value = this._storageService.getCurrencies();
    if (cost.c) {
      value.candles += cost.c;
      value.candles = this.clamp(value.candles);
    }
    if (cost.h) {
      value.hearts += cost.h;
      value.hearts = this.clamp(value.hearts);
    }
    if (cost.ac) {
      value.ascendedCandles += cost.ac;
      value.ascendedCandles = this.clamp(value.ascendedCandles);
    }
    let changed = !!(cost.c || cost.h || cost.ac);

    // Event currency
    if (cost.ec && eventInstance && DateHelper.isActive(eventInstance.date, eventInstance.endDate)) {
      const guid = eventInstance.guid;
      const cur = value.eventCurrencies[guid] ?? { tickets: 0 };
      value.eventCurrencies[guid] = cur;
      cur.tickets = this.clamp((value.eventCurrencies[guid].tickets ?? 0) + cost.ec);
      changed = true;
    }

    // Season currency.
    if (cost.sc && season && DateHelper.isActive(season.date, season.endDate)) {
      const guid = season.guid;
      const cur = value.seasonCurrencies[guid] ?? { candles: 0 };
      value.seasonCurrencies[guid] = cur;
      cur.candles = this.clamp(cur.candles + (cost.sc || 0));
      changed = true;
    }

    // Update currencies if changed.
    changed && this._storageService.setCurrencies(value);
  }

  setRegularCost(cost: ICost): void {
    const value = this._storageService.getCurrencies();
    let changed = false;
    if (cost.c !== undefined) { value.candles = this.clamp(cost.c); changed = true; }
    if (cost.h !== undefined) { value.hearts = this.clamp(cost.h); changed = true; }
    if (cost.ac !== undefined) { value.ascendedCandles = this.clamp(cost.ac); changed = true; }
    changed && this._storageService.setCurrencies(value);
  }

  addGiftPasses(value: number): void {
    if (!value) { return; }
    const currencies = this._storageService.getCurrencies();
    currencies.giftPasses += value;
    currencies.giftPasses = this.clamp(currencies.giftPasses);
    this._storageService.setCurrencies(currencies);
  }

  addSeasonCurrency(seasonGuid: string | undefined, candles?: number): void {
    if (!seasonGuid) { return; }
    candles ??= 0;
    const value = this._storageService.getCurrencies();
    const seasonCurrency = value.seasonCurrencies[seasonGuid] ?? { candles: 0 };
    value.seasonCurrencies[seasonGuid] = seasonCurrency;
    seasonCurrency.candles = this.clamp((seasonCurrency.candles ?? 0) + candles);
    this._storageService.setCurrencies(value);
  }

  setSeasonCurrency(seasonGuid: string | undefined, candles?: number): void {
    if (!seasonGuid) { return; }
    candles ??= 0;
    const value = this._storageService.getCurrencies();
    const seasonCurrency = value.seasonCurrencies[seasonGuid] ?? { candles: 0 };
    value.seasonCurrencies[seasonGuid] = seasonCurrency;
    seasonCurrency.candles = this.clamp(candles);
    this._storageService.setCurrencies(value);
  }

  addEventCurrency(eventGuid: string, value: number): void {
    if (!eventGuid) { return; }
    value ??= 0;
    const currencies = this._storageService.getCurrencies();
    const eventCurrencies = currencies.eventCurrencies[eventGuid] ?? { tickets: 0 };
    currencies.eventCurrencies[eventGuid] = eventCurrencies;
    eventCurrencies.tickets = this.clamp((eventCurrencies.tickets ?? 0) + value);
    this._storageService.setCurrencies(currencies);
  }

  setEventCurrency(eventGuid: string, value?: number): void {
    if (!eventGuid) { return; }
    value ??= 0;
    const currencies = this._storageService.getCurrencies();
    const eventCurrencies = currencies.eventCurrencies[eventGuid] ?? { tickets: 0 };
    currencies.eventCurrencies[eventGuid] = eventCurrencies;
    eventCurrencies.tickets = this.clamp(value);
    this._storageService.setCurrencies(currencies);
  }

  animateCurrencyGained(evt: MouseEvent, value: number): void {
    if (!value) { return; }
    const span = document.createElement('span');
    span.classList.add('currency-gained');
    span.textContent = value >= 0 ? `+${value}` : `${value}`;
    span.style.top = `${evt.clientY}px`;
    span.style.left = `${evt.clientX}px`;
    span.classList.add(value < 0 ? 'c-old' : 'c-new');
    document.body.appendChild(span);
    const interval = setInterval(() => {
      const top = parseInt(span.style.top, 10);
      span.style.top =  `${top - 1}px`;
      const opacity = parseFloat(span.style.opacity || '1');
      span.style.opacity = `${Math.max(0, opacity - 0.02)}`;
    }, 20);
    setTimeout(() => {
      clearInterval(interval);
      span.remove();
    }, 1000);
  }

  clamp(value: number): number {
    return Math.min(99999, Math.max(0, value));
  }
}
