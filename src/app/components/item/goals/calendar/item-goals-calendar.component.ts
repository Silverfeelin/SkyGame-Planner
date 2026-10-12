import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { CALENDAR_ACTIVITY_KINDS, CalendarActivityKind, CalendarHelper, ICalendarActivity } from '@app/helpers/calendar-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { GOAL_DAY_FORMAT, GoalBucketKey, GoalHelper, IGoalBucketPlan, IGoalProjection } from '@app/helpers/goal-helper';
import { DataService } from '@app/services/data.service';
import { GoalService } from '@app/services/goal.service';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';

interface ICalendarDay {
  date: DateTime;
  key: string;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  skipped: boolean;
  collecting: boolean;
  affordable: Array<IGoalProjection>;
  leaving: Array<IGoalProjection>;
  /** Per lane: whether an activity covers the day, and whether one starts or ends on it. */
  lanes: Array<{ kind: CalendarActivityKind; active: boolean; start: boolean; end: boolean }>;
}

interface IDayCollection {
  plan: IGoalBucketPlan;
  label: string;
  icon: string;
  collect: number;
  saved: number;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BUCKET_LABELS: Record<GoalBucketKey, { label: string; icon: string }> = {
  c: { label: 'Candles', icon: 'candle' },
  h: { label: 'Hearts', icon: 'heart' },
  ac: { label: 'Ascended candles', icon: 'ascended-candle' }
};

@Component({
  selector: 'app-item-goals-calendar',
  templateUrl: './item-goals-calendar.component.html',
  styleUrl: './item-goals-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, TooltipDirective, ItemIconComponent]
})
export class ItemGoalsCalendarComponent {
  private readonly _dataService = inject(DataService);
  private readonly _goalService = inject(GoalService);

  readonly goals = input.required<ReadonlyArray<IGoalProjection>>();
  readonly buckets = input.required<ReadonlyArray<IGoalBucketPlan>>();
  readonly today = input.required<DateTime>();
  readonly selected = model.required<DateTime>();
  readonly goalClicked = output<IGoalProjection>();

  readonly ACTIVITY_KINDS = CALENDAR_ACTIVITY_KINDS;
  readonly WEEKDAYS = WEEKDAYS;
  readonly skipped = this._goalService.skipped;
  readonly shownKinds = signal<ReadonlySet<CalendarActivityKind>>(new Set(CALENDAR_ACTIVITY_KINDS.map(k => k.kind)));

  readonly month = computed(() => this.selected().startOf('month'));

  private readonly _activities: ReadonlyArray<ICalendarActivity> = CalendarHelper.getActivities(this._dataService);

  private readonly _monthActivities = computed(() => {
    const start = this.month().startOf('week');
    const end = this.month().endOf('month').endOf('week');
    const shown = this.shownKinds();
    return [...this._activities, ...CalendarHelper.getExpectedTravelingSpirits(this._dataService, end)]
      .filter(a => shown.has(a.kind) && a.date <= end && a.endDate >= start);
  });

  /** Goals keyed by the day they become affordable, and limited goals keyed by the day they leave. */
  private readonly _goalDays = computed(() => {
    const affordable = new Map<string, Array<IGoalProjection>>();
    const leaving = new Map<string, Array<IGoalProjection>>();
    for (const goal of this.goals()) {
      if (goal.status === 'owned') { continue; }
      if (goal.date) {
        const key = goal.date.toFormat(GOAL_DAY_FORMAT);
        affordable.set(key, [...(affordable.get(key) ?? []), goal]);
      }
      const end = goal.source && GoalHelper.windowEnd(goal.source.window);
      if (end) {
        const key = end.toFormat(GOAL_DAY_FORMAT);
        leaving.set(key, [...(leaving.get(key) ?? []), goal]);
      }
    }
    return { affordable, leaving };
  });

  /** Last day on which any currency still needs collecting. */
  private readonly _lastCollectDay = computed(() => {
    let last: DateTime | undefined;
    for (const plan of this.buckets()) {
      const end = this.collectEnd(plan);
      if (end && (!last || end > last)) { last = end; }
    }
    return last;
  });

  readonly days = computed<Array<ICalendarDay>>(() => {
    const month = this.month();
    const today = this.today();
    const skipped = this.skipped();
    const lastCollect = this._lastCollectDay();
    const activities = this._monthActivities();
    const { affordable, leaving } = this._goalDays();
    const shown = this.shownKinds();

    const days: Array<ICalendarDay> = [];
    const end = month.endOf('month').endOf('week');
    for (let date = month.startOf('week'); date <= end; date = date.plus({ days: 1 })) {
      const key = date.toFormat(GOAL_DAY_FORMAT);
      const dayEnd = date.endOf('day');
      const isSkipped = skipped.has(key);
      days.push({
        date, key,
        inMonth: date.month === month.month,
        isToday: date.hasSame(today, 'day'),
        isPast: date < today,
        skipped: isSkipped,
        collecting: !isSkipped && date > today && !!lastCollect && date <= lastCollect,
        affordable: affordable.get(key) ?? [],
        leaving: leaving.get(key) ?? [],
        lanes: CALENDAR_ACTIVITY_KINDS.filter(k => shown.has(k.kind)).map(({ kind }) => {
          const covering = activities.filter(a => a.kind === kind && a.date <= dayEnd && a.endDate >= date);
          return {
            kind,
            active: covering.length > 0,
            start: covering.some(a => a.date.hasSame(date, 'day')),
            end: covering.some(a => a.endDate.hasSame(date, 'day'))
          };
        })
      });
    }
    return days;
  });

  readonly selectedKey = computed(() => this.selected().toFormat(GOAL_DAY_FORMAT));
  readonly selectedIsToday = computed(() => this.selected().hasSame(this.today(), 'day'));
  readonly selectedIsFuture = computed(() => this.selected() > this.today() && !this.selectedIsToday());
  readonly selectedSkipped = computed(() => this.skipped().has(this.selectedKey()));

  readonly selectedCollections = computed<Array<IDayCollection>>(() => {
    const date = this.selected();
    const today = this.today();
    const skipped = this.skipped();
    if (date <= today) { return []; }

    return this.buckets().flatMap(plan => {
      const end = this.collectEnd(plan);
      if (!end || date > end) { return []; }
      const days = GoalHelper.collectDaysUntil(today, date, skipped);
      const saved = Math.min(plan.needed, plan.balance + plan.perDay * days);
      const before = Math.min(plan.needed, plan.balance + plan.perDay * Math.max(0, days - 1));
      return [{
        plan,
        ...BUCKET_LABELS[plan.key],
        collect: skipped.has(this.selectedKey()) ? 0 : this.round(saved - before),
        saved: this.round(saved)
      }];
    });
  });

  readonly selectedAffordable = computed(() => this._goalDays().affordable.get(this.selectedKey()) ?? []);
  readonly selectedLeaving = computed(() => this._goalDays().leaving.get(this.selectedKey()) ?? []);

  readonly selectedActivities = computed(() => {
    const date = this.selected();
    const dayEnd = date.endOf('day');
    return [...this._activities, ...CalendarHelper.getExpectedTravelingSpirits(this._dataService, dayEnd)]
      .filter(a => a.date <= dayEnd && a.endDate >= date);
  });

  readonly skippedCount = computed(() => this.skipped().size);

  select(day: ICalendarDay): void {
    this.selected.set(day.date);
  }

  toggleSkip(date: DateTime): void {
    if (date <= this.today()) { return; }
    this._goalService.toggleSkipped(date.toFormat(GOAL_DAY_FORMAT));
  }

  clearSkipped(): void {
    if (!confirm(`Collect on all ${this.skippedCount()} skipped days again?`)) { return; }
    this._goalService.clearSkipped();
  }

  shiftMonth(offset: number): void {
    const target = this.month().plus({ months: offset });
    // Stay on today when moving back to the current month.
    this.selected.set(target.hasSame(this.today(), 'month') ? this.today() : target);
  }

  goToToday(): void {
    this.selected.set(this.today());
  }

  toggleKind(kind: CalendarActivityKind): void {
    this.shownKinds.update(kinds => {
      const next = new Set(kinds);
      next.has(kind) ? next.delete(kind) : next.add(kind);
      return next;
    });
  }

  activityDates(activity: ICalendarActivity): string {
    return `${activity.date.toFormat(DateHelper.displayFormat)} – ${activity.endDate.toFormat(DateHelper.displayFormat)}`;
  }

  dayLabel(day: ICalendarDay): string {
    const parts = [day.date.toFormat('cccc d LLLL')];
    if (day.skipped) { parts.push('skipped'); }
    if (day.affordable.length) { parts.push(`${day.affordable.length} affordable`); }
    if (day.leaving.length) { parts.push(`${day.leaving.length} leaving`); }
    return parts.join(', ');
  }

  private collectEnd(plan: IGoalBucketPlan): DateTime | undefined {
    if (plan.perDay <= 0 || plan.needed <= plan.balance) { return undefined; }
    return plan.doneDate;
  }

  private round(value: number): number {
    return Math.round(value * 10) / 10;
  }
}
