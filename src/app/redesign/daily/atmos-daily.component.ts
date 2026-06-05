import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { IRealm } from 'skygame-data';
import { DateHelper } from '@app/helpers/date-helper';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { CurrencyService } from '@app/services/currency.service';
import { SettingService } from '@app/services/setting.service';
import { DAILY_TASKS, IDailyTask } from '@app/components/daily/daily-tasks';
import { DateTimePipe } from '@app/pipes/date-time.pipe';
import {
  AtmosDailyCardComponent,
  AtmosDailyTaskComponent,
  AtmosSeasonCardComponent
} from '@app/redesign/shared/atmos-shared-widgets';

interface IDailyTaskState {
  dailyDate: string;
  dailyChecked: string[];
  weeklyDate: string;
  weeklyChecked: string[];
  hiddenTasks?: string[];
}

const STORAGE_KEY = 'daily.tasks';
const CHECKIN_KEY = 'daily.checkin';

function createEmptyState(dailyDate: string, weeklyDate: string): IDailyTaskState {
  return { dailyDate, dailyChecked: [], weeklyDate, weeklyChecked: [], hiddenTasks: [] };
}

function getWeeklyAnchor(today: DateTime): string {
  const sunday = today.weekday === 7 ? today : today.minus({ days: today.weekday });
  return sunday.toFormat('yyyy-MM-dd');
}

/** Day-of-week realm rotation — pulled out of the legacy DailyCardComponent so the
 *  atmos card stays pure (per Phase 0 contract). */
function resolveDailyRealm(dataService: DataService): IRealm | undefined {
  const datePrairie = DateTime.fromFormat('2024-09-30', 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
  const now = DateTime.now();
  const days = Math.floor(now.diff(datePrairie, 'days').days);
  const realmGuids = ['tuaosLljJS', 'mz64Wq0_df', 'VtkTo1WWuD', 'rAjzHXfPpb', 'y-6n1F5E77'];
  const guid = realmGuids[((days % realmGuids.length) + realmGuids.length) % realmGuids.length];
  return dataService.guidMap.get(guid) as IRealm | undefined;
}

@Component({
  selector: 'app-atmos-daily',
  templateUrl: './atmos-daily.component.html',
  styleUrl: './atmos-daily.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIcon,
    DateTimePipe,
    AtmosDailyCardComponent,
    AtmosDailyTaskComponent,
    AtmosSeasonCardComponent
  ]
})
export class AtmosDailyComponent implements OnInit, OnDestroy {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _settingService = inject(SettingService);

  readonly activeSeason = DateHelper.getActive(this._dataService.seasonConfig.items);
  readonly dailyRealm = resolveDailyRealm(this._dataService);

  readonly tasks = DAILY_TASKS;
  readonly dailyFixed = this.tasks.filter(t => t.cadence === 'daily');
  readonly dailyVariable = this.tasks.filter(t => t.cadence === 'daily-variable');
  readonly timed = this.tasks.filter(t => t.cadence === 'timed');
  readonly weekly = this.tasks.filter(t => t.cadence === 'weekly');

  readonly state = signal<IDailyTaskState>(createEmptyState('', ''));
  readonly now = signal<DateTime>(DateTime.now());
  readonly checkedIn = signal<boolean>(false);

  readonly checkedDaily = computed(() => new Set(this.state().dailyChecked));
  readonly checkedWeekly = computed(() => new Set(this.state().weeklyChecked));
  readonly hiddenTasks = computed(() => new Set(this.state().hiddenTasks ?? []));

  readonly showHidden = signal(false);
  readonly hiddenFixedCount = computed(() => this.dailyFixed.filter(t => this.hiddenTasks().has(t.id)).length);
  readonly hiddenVariableCount = computed(() => this.dailyVariable.filter(t => this.hiddenTasks().has(t.id)).length);
  readonly hiddenTimedCount = computed(() => this.timed.filter(t => this.hiddenTasks().has(t.id)).length);

  readonly remainingLight = computed(() => {
    const checked = this.checkedDaily();
    return this.dailyFixed.reduce((sum, t) => sum + (checked.has(t.id) ? 0 : (t.light ?? 0)), 0);
  });

  readonly totalLight = computed(() =>
    this.dailyFixed.reduce((sum, t) => sum + (t.light ?? 0), 0)
  );

  readonly dailyCountdown = computed(() => this._formatCountdown(this._nextDailyReset()));
  readonly weeklyCountdown = computed(() => this._formatCountdown(this._nextWeeklyReset()));
  readonly nextTimed = computed(() => {
    const nextTask = this._nextTimedEvent();
    return {
      task: nextTask!,
      countdown: this._formatCountdown(nextTask.nextTime!)
    };
  });

  private _tickInterval?: number;

  ngOnInit(): void {
    this._loadState();
    this._updateCheckin();

    this._tickInterval = window.setInterval(() => {
      this.now.set(DateTime.now());
      this._refreshIfRolledOver();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this._tickInterval) { window.clearInterval(this._tickInterval); }
  }

  toggleDaily(task: IDailyTask): void {
    const s = this.state();
    const set = new Set(s.dailyChecked);
    if (set.has(task.id)) { set.delete(task.id); } else { set.add(task.id); }
    this._writeState({ ...s, dailyChecked: [...set] });
  }

  toggleWeekly(task: IDailyTask): void {
    const s = this.state();
    const set = new Set(s.weeklyChecked);
    if (set.has(task.id)) { set.delete(task.id); } else { set.add(task.id); }
    this._writeState({ ...s, weeklyChecked: [...set] });
  }

  isDailyChecked(id: string): boolean { return this.checkedDaily().has(id); }
  isWeeklyChecked(id: string): boolean { return this.checkedWeekly().has(id); }
  isHidden(id: string): boolean { return this.hiddenTasks().has(id); }

  toggleHide(task: IDailyTask): void {
    const s = this.state();
    const hidden = new Set(s.hiddenTasks ?? []);
    if (hidden.has(task.id)) { hidden.delete(task.id); } else { hidden.add(task.id); }
    this._writeState({ ...s, hiddenTasks: [...hidden] });
  }

  formatLight(task: IDailyTask): string {
    if (task.lightRange) { return `~${task.lightRange[0]}–${task.lightRange[1]}`; }
    if (task.light != null) { return `${task.light}`; }
    return '';
  }

  /** Mirrors legacy DailyCardComponent.checkin — toggles daily check-in
   *  and applies the candle currency delta. */
  onCheckin(evt: MouseEvent): void {
    const next = !this.checkedIn();
    this.checkedIn.set(next);
    if (next) {
      localStorage.setItem(CHECKIN_KEY, DateTime.local({ zone: DateHelper.skyTimeZone }).toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(CHECKIN_KEY);
    }

    const amount = 4 + (this._settingService.dailyCandleAmount ?? 0);
    const delta = next ? amount : -amount;
    this._currencyService.addCost({ c: delta });
    this._currencyService.animateCurrencyGained(evt, delta);
  }

  private _updateCheckin(): void {
    const checkinDate = localStorage.getItem(CHECKIN_KEY);
    if (!checkinDate) { this.checkedIn.set(false); return; }
    const d = DateTime.fromFormat(checkinDate, 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
    this.checkedIn.set(d.hasSame(DateTime.now().setZone(DateHelper.skyTimeZone), 'day'));
  }

  private _loadState(): void {
    const today = DateHelper.todaySky();
    const todayKey = today.toFormat('yyyy-MM-dd');
    const weekKey = getWeeklyAnchor(today);

    const stored = this._storageService.getKey<IDailyTaskState>(STORAGE_KEY);
    if (!stored) {
      this.state.set(createEmptyState(todayKey, weekKey));
      return;
    }

    const dailyExpired = stored.dailyDate !== todayKey;
    const weeklyExpired = !stored.weeklyDate || stored.weeklyDate !== weekKey;

    if (!dailyExpired && !weeklyExpired) {
      this.state.set(stored);
      return;
    }

    const next: IDailyTaskState = {
      ...stored,
      ...(dailyExpired ? { dailyDate: todayKey, dailyChecked: [] } : {}),
      ...(weeklyExpired ? { weeklyDate: weekKey, weeklyChecked: [] } : {})
    };
    this.state.set(next);
    this._storageService.setKey<IDailyTaskState>(STORAGE_KEY, next);
  }

  private _refreshIfRolledOver(): void {
    const today = DateHelper.todaySky();
    const todayKey = today.toFormat('yyyy-MM-dd');
    const weekKey = getWeeklyAnchor(today);
    const s = this.state();
    if (s.dailyDate !== todayKey || s.weeklyDate < weekKey) {
      this._loadState();
      this._updateCheckin();
    }
  }

  private _writeState(next: IDailyTaskState): void {
    this.state.set(next);
    this._storageService.setKey<IDailyTaskState>(STORAGE_KEY, next);
  }

  private _nextDailyReset(): DateTime {
    return DateHelper.todaySky().plus({ days: 1 });
  }

  private _nextWeeklyReset(): DateTime {
    const today = DateHelper.todaySky();
    const daysUntilSunday = today.weekday === 7 ? 7 : 7 - today.weekday;
    return today.plus({ days: daysUntilSunday });
  }

  private _cachedNextTimed?: IDailyTask;
  private _nextTimedEvent(): IDailyTask {
    const now = this.now();

    if (this._cachedNextTimed?.nextTime && this._cachedNextTimed.nextTime > now) {
      return this._cachedNextTimed;
    }

    this.timed.forEach(t => {
      if (!t.nextFn) { return; }
      if (!t.nextTime || t.nextTime < now) {
        t.nextTime = t.nextFn().toLocal();
      }
    });

    const next = this.timed.reduce((a, b) => {
      if (!a.nextTime) { return b; }
      if (!b.nextTime) { return a; }
      return a.nextTime < b.nextTime ? a : b;
    });

    this._cachedNextTimed = next;
    return next;
  }

  private _formatCountdown(target: DateTime): string {
    const duration = target.diff(this.now());
    const days = Math.floor(duration.as('days'));
    const time = duration.minus({ days }).toFormat('hh:mm:ss');
    return days > 0 ? `${days}d ${time}` : time;
  }
}
