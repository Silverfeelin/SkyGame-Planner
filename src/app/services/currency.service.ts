import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ICost } from '@app/interfaces/cost.interface';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  constructor(
    private readonly _storageService: StorageService
  ) {
  }

  addCost(cost: ICost): void {
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
    this._storageService.setCurrencies(value);
  }

  subtractCost(cost: ICost): void {
    const value = this._storageService.getCurrencies();
    if (cost.c) {
      value.candles -= cost.c;
      value.candles = this.clamp(value.candles);
    }
    if (cost.h) {
      value.hearts -= cost.h;
      value.hearts = this.clamp(value.hearts);
    }
    if (cost.ac) {
      value.ascendedCandles -= cost.ac;
      value.ascendedCandles = this.clamp(value.ascendedCandles);
    }
    this._storageService.setCurrencies(value);
  }

  addGiftPasses(value: number): void {
    if (!value) { return; }
    const currencies = this._storageService.getCurrencies();
    currencies.giftPasses += value;
    currencies.giftPasses = this.clamp(currencies.giftPasses);
    this._storageService.setCurrencies(currencies);
  }

  addSeasonCurrency(seasonGuid: string, candles: number, hearts: number): void {
    if (!seasonGuid || (!candles && !hearts)) { return; }
    const value = this._storageService.getCurrencies();
    const seasonCurrency = value.seasonCurrencies[seasonGuid] ?? { candles: 0, hearts: 0 };
    value.seasonCurrencies[seasonGuid] = seasonCurrency;
    seasonCurrency.candles += candles;
    seasonCurrency.candles = this.clamp(seasonCurrency.candles);
    seasonCurrency.hearts += hearts;
    seasonCurrency.hearts = this.clamp(seasonCurrency.hearts);
    this._storageService.setCurrencies(value);
  }

  addEventCurrency(eventGuid: string, value: number): void {
    if (!eventGuid || !value) { return; }
    const currencies = this._storageService.getCurrencies();
    currencies.eventCurrencies[eventGuid] = this.clamp((currencies.eventCurrencies[eventGuid] ?? 0) + value);
    this._storageService.setCurrencies(currencies);
  }

  animateCurrencyGained(evt: MouseEvent, value: number): void {
    if (!value) { return; }
    const span = document.createElement('span');
    span.style.position = 'fixed';
    span.classList.add('currency-gained');
    span.textContent = value >= 0 ? `+${value}` : `${value}`;
    span.style.top = `${evt.clientY}px`;
    span.style.left = `${evt.clientX}px`;
    span.style.transform = 'translate(-50%, -50%)';
    span.style.lineHeight = '24px';
    span.style.fontSize = '24px';
    span.style.color = '#fff';
    span.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 1)';
    span.style.pointerEvents = 'none';
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

  private clamp(value: number): number {
    return Math.min(99999, Math.max(0, value));
  }
}
