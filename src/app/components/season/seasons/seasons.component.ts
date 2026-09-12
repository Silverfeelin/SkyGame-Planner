import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { ISeason } from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { DataService } from '@app/services/data.service';
import { DailyCheckinService } from '@app/services/daily-checkin.service';
import { IconComponent } from '@app/components/icon/icon.component';
import { SeasonCardComponent } from '@app/components/shared/shared-widgets';
import { SeasonQuickActionsComponent } from '../quick-actions/season-quick-actions.component';

interface IYearGroup {
  readonly year: number;
  readonly seasons: ReadonlyArray<ISeason>;
}

@Component({
  selector: 'app-seasons',
  templateUrl: './seasons.component.html',
  styleUrl: './seasons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TooltipDirective, IconComponent, SeasonCardComponent, SeasonQuickActionsComponent]
})
export class SeasonsComponent {
  private readonly _dataService = inject(DataService);
  private readonly _dailyCheckinService = inject(DailyCheckinService);

  readonly seasons: ReadonlyArray<ISeason> = this._dataService.seasonConfig.items;
  readonly reverseSeasons: ReadonlyArray<ISeason> = this.seasons.slice().reverse();
  readonly currentSeason = DateHelper.getActive(this._dataService.seasonConfig.items);
  readonly checkedIn = signal(this._dailyCheckinService.isCheckedIn());

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

  onSeasonCheckin(season: ISeason, event: MouseEvent): void {
    this.checkedIn.set(this._dailyCheckinService.toggle(event, season));
  }

  /** There is a single daily check-in, so only the ongoing season can be checked in. */
  isCheckedIn(season: ISeason): boolean {
    return season === this.currentSeason && this.checkedIn();
  }
}
