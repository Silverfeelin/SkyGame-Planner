import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';
import { StorageService } from '@app/services/storage.service';
import { BroadcastService } from '@app/services/broadcast.service';
import { SubscriptionBag } from '@app/helpers/subscription-bag';
import { DAILY_TASKS, IDailyTask } from './daily-tasks';
import { DailyCardComponent } from "../daily-card/daily-card.component";
import { DataService } from '@app/services/data.service';
import { SeasonCardComponent } from "../season-card/season-card.component";
import { DailyTaskComponent } from './daily-task/daily-task.component';

interface IDailyTaskState {
  /** 'yyyy-MM-dd' of the Sky day the daily checks belong to. */
  dailyDate: string;
  dailyChecked: string[];
  /** 'yyyy-MM-dd' of the Sunday that starts the Eden week the weekly checks belong to. */
  weeklyDate: string;
  weeklyChecked: string[];
  /** Task IDs the user has chosen to hide permanently (survives daily/weekly resets). */
  hiddenTasks?: string[];
}

const STORAGE_KEY = 'daily.tasks';

function emptyState(dailyDate: string, weeklyDate: string): IDailyTaskState {
  return { dailyDate, dailyChecked: [], weeklyDate, weeklyChecked: [], hiddenTasks: [] };
}

function weeklyAnchor(today: DateTime): string {
  const sunday = today.weekday === 7 ? today : today.minus({ days: today.weekday });
  return sunday.toFormat('yyyy-MM-dd');
}

@Component({
  selector: 'app-daily',
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, DailyCardComponent, SeasonCardComponent, DailyTaskComponent],
})
export class DailyComponent implements OnInit, OnDestroy {
  private readonly _storageService = inject(StorageService);
  private readonly _dataService = inject(DataService);
  private readonly _broadcastService = inject(BroadcastService);

  readonly activeSeason = DateHelper.getActive(this._dataService.seasonConfig.items);

  readonly tasks = DAILY_TASKS;

  readonly dailyFixed = this.tasks.filter(t => t.cadence === 'daily');
  readonly dailyVariable = this.tasks.filter(t => t.cadence === 'daily-variable');
  readonly timed = this.tasks.filter(t => t.cadence === 'timed');
  readonly weekly = this.tasks.filter(t => t.cadence === 'weekly');

  readonly state = signal<IDailyTaskState>(emptyState('', ''));
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
      date: this._formatTime(nextTask.nextTime!),
      countdown: this._formatCountdown(nextTask.nextTime!),
    }
  });

  private readonly _subs = new SubscriptionBag();
  private _tickInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this._loadState();

    this._tickInterval = setInterval(() => {
      this.now.set(DateTime.now());
      this._refreshIfRolledOver();
    }, 1000);

    this._subs.add(
      this._broadcastService.subject.subscribe(msg => {
        if (msg.type === 'storage.changed') { this._loadState(); }
      })
    );
  }

  ngOnDestroy(): void {
    clearInterval(this._tickInterval);
    this._subs.unsubscribe();
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
    const weekKey = weeklyAnchor(today);

    const stored = this._storageService.getKey<IDailyTaskState>(STORAGE_KEY);
    if (!stored) {
      this.state.set(emptyState(todayKey, weekKey));
      return;
    }

    let next: IDailyTaskState = { ...stored };
    let dirty = false;
    if (stored.dailyDate !== todayKey) {
      next = { ...next, dailyDate: todayKey, dailyChecked: [] };
      dirty = true;
    }
    if (!stored.weeklyDate || stored.weeklyDate < weekKey) {
      next = { ...next, weeklyDate: weekKey, weeklyChecked: [] };
      dirty = true;
    }

    this.state.set(next);
    if (dirty) {
      this._storageService.setKey<IDailyTaskState>(STORAGE_KEY, next);
    }
  }

  /** Detect day/week rollover while the tab stays open. */
  private _refreshIfRolledOver(): void {
    const today = DateHelper.todaySky();
    const todayKey = today.toFormat('yyyy-MM-dd');
    const weekKey = weeklyAnchor(today);
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

  private _nextTimedEvent(): IDailyTask {
    const now = this.now();
    this.timed.forEach(t => {
      if (!t.nextFn) { return; }
      if (!t.nextTime || t.nextTime < now) {
        t.nextTime = t.nextFn!();
      }
    });

    // TODO: Get the first next event from this.timed based on t.nextTime.
    return this.timed.at(0)!;
  }

  private _formatTime(dt: DateTime): string {
    return dt.toLocal().toFormat(`hh:mm`);
  }

  private _formatCountdown(target: DateTime): string {
    return target.diff(this.now()).toFormat('hh:mm:ss');
  }
}
