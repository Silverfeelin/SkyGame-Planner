import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { IEventInstance } from 'skygame-data';
import { filter } from 'rxjs';
import { DailyHelper } from '@app/helpers/daily-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { SubscriptionBag } from '@app/helpers/subscription-bag';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { DailyCheckinService } from '@app/services/daily-checkin.service';
import { EventCheckinService } from '@app/services/event-checkin.service';
import { DAILY_TASKS, IDailyTask } from '@app/components/daily/daily-tasks';
import { DateTimePipe } from '@app/pipes/date-time.pipe';
import {
  DailyCardComponent,
  DailyTaskComponent,
  EventCardComponent,
  SeasonCardComponent
} from '@app/components/shared/shared-widgets';
import { DailyQuickActionsComponent } from './quick-actions/daily-quick-actions.component';

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
  imports: [
    RouterLink,
    MatIcon,
    DateTimePipe,
    DailyCardComponent,
    DailyTaskComponent,
    EventCardComponent,
    SeasonCardComponent,
    DailyQuickActionsComponent
  ]
})
export class DailyComponent implements OnInit, OnDestroy {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _dailyCheckinService = inject(DailyCheckinService);
  private readonly _eventCheckinService = inject(EventCheckinService);
  private readonly _eventService = inject(EventService);

  readonly activeSeason = DateHelper.getActive(this._dataService.seasonConfig.items);
  readonly dailyRealm = DailyHelper.getDailyRealm(this._dataService.guidMap);
  readonly activeEvents = this._eventCheckinService.getActiveInstances();

  readonly tasks = DAILY_TASKS;
  readonly dailyFixed = this.tasks.filter(t => t.cadence === 'daily');
  readonly dailyVariable = this.tasks.filter(t => t.cadence === 'daily-variable');
  readonly timed = this.tasks.filter(t => t.cadence === 'timed');
  readonly weekly = this.tasks.filter(t => t.cadence === 'weekly');

  readonly state = signal<IDailyTaskState>(createEmptyState('', ''));
  readonly now = signal<DateTime>(DateTime.now());
  readonly checkedIn = signal<boolean>(false);
  /** Event guid -> checked in today. */
  readonly eventCheckedIn = signal<ReadonlyMap<string, boolean>>(new Map());

  readonly checkedDaily = computed(() => new Set(this.state().dailyChecked));
  readonly checkedWeekly = computed(() => new Set(this.state().weeklyChecked));
  readonly hiddenTasks = computed(() => new Set(this.state().hiddenTasks ?? []));

  /** Task id -> why it cannot be done today. Re-evaluated on every tick so it follows the sky day. */
  readonly disabledReasons = computed(() => {
    const now = this.now();
    const reasons = new Map<string, string>();
    for (const task of this.tasks) {
      const reason = task.disabledFn?.(now);
      if (reason) { reasons.set(task.id, reason); }
    }
    return reasons;
  });

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
  private readonly _subs = new SubscriptionBag();

  constructor() {
    this._subs.add(this._eventService.storageChanged
      .pipe(filter(e => e.key?.startsWith(EventCheckinService.keyPrefix) === true))
      .subscribe(() => this._updateEventCheckins()));

    this._subs.add(this._eventService.storageChanged
      .pipe(filter(e => e.key === DailyCheckinService.key))
      .subscribe(() => this._updateCheckin()));
  }

  ngOnInit(): void {
    this._loadState();
    this._updateCheckin();
    this._updateEventCheckins();

    this._tickInterval = window.setInterval(() => {
      this.now.set(DateTime.now());
      this._refreshIfRolledOver();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this._tickInterval) { window.clearInterval(this._tickInterval); }
    this._subs.unsubscribe();
  }

  disabledReason(task: IDailyTask): string { return this.disabledReasons().get(task.id) ?? ''; }

  toggleDaily(task: IDailyTask): void {
    if (this.disabledReason(task)) { return; }
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

  onCheckin(evt: MouseEvent): void {
    this.checkedIn.set(this._dailyCheckinService.toggle(evt, this.activeSeason));
  }

  onEventCheckin(instance: IEventInstance, evt: MouseEvent): void {
    this._eventCheckinService.toggle(evt, instance);
    this._updateEventCheckins();
  }

  isEventCheckedIn(instance: IEventInstance): boolean {
    return this.eventCheckedIn().get(instance.event.guid) ?? false;
  }

  private _updateCheckin(): void {
    this.checkedIn.set(this._dailyCheckinService.isCheckedIn());
  }

  private _updateEventCheckins(): void {
    this.eventCheckedIn.set(new Map(this.activeEvents.map(i =>
      [i.event.guid, this._eventCheckinService.isCheckedIn(i.event.guid)])));
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
      this._updateEventCheckins();
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
