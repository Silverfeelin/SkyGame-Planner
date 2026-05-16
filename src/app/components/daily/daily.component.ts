import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';
import { StorageService } from '@app/services/storage.service';
import { DAILY_TASKS, IDailyTask } from './daily-tasks';
import { DailyCardComponent } from "../daily-card/daily-card.component";
import { DataService } from '@app/services/data.service';
import { SeasonCardComponent } from "../season-card/season-card.component";
import { DailyTaskComponent } from './daily-task/daily-task.component';
import { DateTimePipe } from "../../pipes/date-time.pipe";

interface IDailyTaskState {
  dailyDate: string;
  dailyChecked: string[];
  weeklyDate: string;
  weeklyChecked: string[];
  hiddenTasks?: string[];
}

const STORAGE_KEY = 'daily.tasks';

function createEmptyState(dailyDate: string, weeklyDate: string): IDailyTaskState {
  return { dailyDate, dailyChecked: [], weeklyDate, weeklyChecked: [], hiddenTasks: [] };
}

function getWeeklyAnchor(today: DateTime): string {
  const sunday = today.weekday === 7 ? today : today.minus({ days: today.weekday });
  return sunday.toFormat('yyyy-MM-dd');
}

@Component({
  selector: 'app-daily',
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, DailyCardComponent, SeasonCardComponent, DailyTaskComponent, DateTimePipe],
})
export class DailyComponent implements OnInit, OnDestroy {
  private readonly _storageService = inject(StorageService);
  private readonly _dataService = inject(DataService);

  readonly activeSeason = DateHelper.getActive(this._dataService.seasonConfig.items);

  readonly tasks = DAILY_TASKS;

  readonly dailyFixed = this.tasks.filter(t => t.cadence === 'daily');
  readonly dailyVariable = this.tasks.filter(t => t.cadence === 'daily-variable');
  readonly timed = this.tasks.filter(t => t.cadence === 'timed');
  readonly weekly = this.tasks.filter(t => t.cadence === 'weekly');

  readonly state = signal<IDailyTaskState>(createEmptyState('', ''));
  readonly now = signal<DateTime>(DateTime.now());

  readonly checkedDaily = computed(() => new Set(this.state().dailyChecked));
  readonly checkedWeekly = computed(() => new Set(this.state().weeklyChecked));
  readonly hiddenTasks = computed(() => new Set(this.state().hiddenTasks ?? []));

  readonly showHidden = signal(false);
  readonly hiddenFixedCount = computed(() => this.dailyFixed.filter(t => this.hiddenTasks().has(t.id)).length);
  readonly hiddenVariableCount = computed(() => this.dailyVariable.filter(t => this.hiddenTasks().has(t.id)).length);
  readonly hiddenTimedCount = computed(() => this.timed.filter(t => this.hiddenTasks().has(t.id)).length);

  /** Total light remaining today (fixed-reward only — variable rewards skipped to avoid misleading totals). */
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
      countdown: this._formatCountdown(nextTask.nextTime!),
    }
  });

  private _tickInterval?: number;

  ngOnInit(): void {
    this._loadState();

    this._tickInterval = window.setInterval(() => {
      this.now.set(DateTime.now());
      this._refreshIfRolledOver();
    }, 1000);
  }

  ngOnDestroy(): void {
    window.clearInterval(this._tickInterval);
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
      ...(weeklyExpired ? { weeklyDate: weekKey, weeklyChecked: [] } : {}),
    };
    this.state.set(next);
    this._storageService.setKey<IDailyTaskState>(STORAGE_KEY, next);
  }

  /** Detect day/week rollover while the tab stays open. */
  private _refreshIfRolledOver(): void {
    const today = DateHelper.todaySky();
    const todayKey = today.toFormat('yyyy-MM-dd');
    const weekKey = getWeeklyAnchor(today);
    const s = this.state();
    if (s.dailyDate !== todayKey || s.weeklyDate < weekKey) {
      this._loadState();
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

    // Reuse cached.
    if (this._cachedNextTimed?.nextTime && this._cachedNextTimed.nextTime > now) {
      return this._cachedNextTimed;
    }

    // Update nextTime.
    this.timed.forEach(t => {
      if (!t.nextFn) { return; }
      if (!t.nextTime || t.nextTime < now) {
        t.nextTime = t.nextFn().toLocal();
      }
    });

    // Find next task.
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
    return days > 0
      ? `${days}d ${time}`
      : time;
  }
}
