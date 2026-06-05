import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ISeason } from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { CurrencyService } from '@app/services/currency.service';
import { SettingService } from '@app/services/setting.service';
import { IconComponent } from '@app/components/icon/icon.component';
import { AtmosSeasonCardComponent } from '@app/redesign/shared/atmos-shared-widgets';

interface IYearGroup {
  readonly year: number;
  readonly seasons: ReadonlyArray<ISeason>;
}

const CHECKIN_KEY = 'season.checkin';

@Component({
  selector: 'app-atmos-seasons',
  templateUrl: './atmos-seasons.component.html',
  styleUrl: './atmos-seasons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, NgbTooltip, IconComponent, AtmosSeasonCardComponent]
})
export class AtmosSeasonsComponent {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _settingService = inject(SettingService);

  readonly seasons: ReadonlyArray<ISeason> = this._dataService.seasonConfig.items;
  readonly reverseSeasons: ReadonlyArray<ISeason> = this.seasons.slice().reverse();
  readonly currentSeason = DateHelper.getActive(this._dataService.seasonConfig.items);

  readonly yearGroups = computed<ReadonlyArray<IYearGroup>>(() => {
    const map = new Map<number, ISeason[]>();
    for (let i = this.seasons.length - 1; i >= 0; i--) {
      const season = this.seasons[i];
      if (!map.has(season.year)) { map.set(season.year, []); }
      map.get(season.year)!.push(season);
    }
    return [...map.entries()]
      .sort((a, b) => b[0] - a[0])
      .map<IYearGroup>(([year, seasons]) => ({ year, seasons }));
  });

  /** Mirrors legacy SeasonCardComponent check-in: writes a per-season key
   *  and applies the candle currency delta via CurrencyService. */
  onSeasonCheckin(season: ISeason, event: MouseEvent): void {
    const key = `${CHECKIN_KEY}.${season.guid}`;
    const checked = this.isCheckedIn(season);
    const next = !checked;
    if (next) {
      localStorage.setItem(key, DateHelper.todaySky().toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(key);
    }

    const dailyCurrency = this._storageService.hasSeasonPass(season.guid) ? 6 : 5;
    const delta = next ? dailyCurrency : -dailyCurrency;
    this._currencyService.addSeasonCurrency(season.guid, delta);

    const candleAmount = this._settingService.dailyCandleAmount;
    let candleDelta = 0;
    if (candleAmount) {
      candleDelta = next ? candleAmount : -candleAmount;
      this._currencyService.addCost({ c: candleDelta });
    }

    this._currencyService.animateCurrencyGained(event, delta, candleDelta);
  }

  isCheckedIn(season: ISeason): boolean {
    const stored = localStorage.getItem(`${CHECKIN_KEY}.${season.guid}`);
    if (!stored) { return false; }
    return stored === DateHelper.todaySky().toFormat('yyyy-MM-dd');
  }
}
