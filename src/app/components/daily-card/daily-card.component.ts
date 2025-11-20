import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { DiscordLinkComponent } from '../util/discord-link/discord-link.component';
import { DataService } from '@app/services/data.service';
import { DateHelper } from '@app/helpers/date-helper';
import { RouterLink } from '@angular/router';
import { CurrencyService } from '@app/services/currency.service';
import { IRealm } from 'skygame-data';

@Component({
    selector: 'app-daily-card',
    imports: [DiscordLinkComponent, RouterLink, MatIcon],
    templateUrl: './daily-card.component.html',
    styleUrl: './daily-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyCardComponent {
  checkedIn?: boolean;
  realm?: IRealm;

  constructor(
    private readonly _currencyService: CurrencyService,
    private readonly _dataService: DataService
  ) {
    this.checkRealm();
    this.updateCheckin();
  }

  checkin(evt: MouseEvent): void {
    this.checkedIn = !this.checkedIn;
    if (this.checkedIn) {
      localStorage.setItem('daily.checkin', DateTime.local({ zone: DateHelper.skyTimeZone }).toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem('daily.checkin');
    }

    let dailyCurrency = 4;
    if (!this.checkedIn) { dailyCurrency = -dailyCurrency; }
    this._currencyService.addCost({ c: dailyCurrency });
    this._currencyService.animateCurrencyGained(evt, dailyCurrency);
  }

  private checkRealm(): void {
    const datePrairie = DateTime.fromFormat('2024-09-30', 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
    const now = DateTime.now();
    const days = Math.floor(now.diff(datePrairie, 'days').days);
    const realmGuids = [ 'tuaosLljJS', 'mz64Wq0_df', 'VtkTo1WWuD', 'rAjzHXfPpb', 'y-6n1F5E77' ];
    const realmGuid = realmGuids[days % realmGuids.length];
    this.realm = this._dataService.guidMap.get(realmGuid) as IRealm;
  }

  private updateCheckin(): void {
    const checkinDate = localStorage.getItem('daily.checkin');
    this.checkedIn = false;
    if (!checkinDate) { return; }
    const d = DateTime.fromFormat(checkinDate, 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
    this.checkedIn = d.hasSame(DateTime.now().setZone(DateHelper.skyTimeZone), 'day');
  }
}
