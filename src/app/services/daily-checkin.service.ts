import { Injectable, inject } from '@angular/core';
import { ISeason } from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { CurrencyService } from './currency.service';
import { SettingService } from './setting.service';
import { StorageService } from './storage.service';

const CHECKIN_KEY = 'daily.checkin';

/** Regular candles from a full set of daily quests, outside a season. */
const DAILY_CANDLES = 4;

/**
 * Daily check-in — "I have done my dailies".
 *
 * There is one check-in per day, stored under a single key: doing your dailies
 * during a season and outside one are the same activity, so the season card and
 * the daily card are never shown together. Only the reward differs — season
 * candles during a season, regular candles outside one — and both add the
 * `dailyCandleAmount` bonus from settings on top.
 *
 * Shared by every surface that renders the check-in (dashboard feature card,
 * daily tracker, seasons list) so the stored key and the currency deltas stay
 * identical between them.
 */
@Injectable({ providedIn: 'root' })
export class DailyCheckinService {
  private readonly _currencyService = inject(CurrencyService);
  private readonly _settingService = inject(SettingService);
  private readonly _storageService = inject(StorageService);

  /** Storage key; use with `EventService.storageChanged` to observe changes. */
  static readonly key = CHECKIN_KEY;

  isCheckedIn(): boolean {
    const stored = localStorage.getItem(CHECKIN_KEY);
    return !!stored && stored === DateHelper.todaySky().toFormat('yyyy-MM-dd');
  }

  /**
   * Toggles today's check-in and applies (or reverts) the reward.
   * Pass the ongoing season to be paid in season candles instead of regular ones.
   */
  toggle(event: MouseEvent, season?: ISeason): boolean {
    const next = !this.isCheckedIn();
    if (next) {
      localStorage.setItem(CHECKIN_KEY, DateHelper.todaySky().toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(CHECKIN_KEY);
    }

    const sign = next ? 1 : -1;
    let seasonDelta = 0;
    let candleDelta = sign * this._settingService.dailyCandleAmount;

    if (season) {
      seasonDelta = sign * (this._storageService.hasSeasonPass(season.guid) ? 6 : 5);
      this._currencyService.addSeasonCurrency(season.guid, seasonDelta);
    } else {
      candleDelta += sign * DAILY_CANDLES;
    }

    if (candleDelta) { this._currencyService.addCost({ c: candleDelta }); }
    this._currencyService.animateCurrencyGained(
      event,
      season ? seasonDelta : candleDelta,
      season ? candleDelta : 0
    );
    return next;
  }
}
