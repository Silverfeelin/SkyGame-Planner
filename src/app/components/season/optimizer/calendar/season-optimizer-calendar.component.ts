import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { IItem } from 'skygame-data';
import { ISeasonGoal } from '@app/helpers/season-goal-helper';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';

interface ICalendarDay {
  date: DateTime;
  key: string;
  inMonth: boolean;
  inSeason: boolean;
  isToday: boolean;
  isPast: boolean;
  planned: boolean;
  isLastDay: boolean;
  buys: Array<ISeasonGoal>;
  accompanyIcon?: IItem;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@Component({
  selector: 'app-season-optimizer-calendar',
  templateUrl: './season-optimizer-calendar.component.html',
  styleUrls: ['../../../item/goals/calendar/item-goals-calendar.component.scss', './season-optimizer-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TooltipDirective, ItemIconComponent]
})
export class SeasonOptimizerCalendarComponent {
  readonly goals = input.required<ReadonlyArray<ISeasonGoal>>();
  /** Tree that needs accompanying per day, keyed by ISO date. */
  readonly accompanies = input.required<ReadonlyMap<string, number>>();
  readonly spiritNames = input.required<ReadonlyArray<string>>();
  /** Accompany item per tree, used as the spirit's icon. */
  readonly spiritIcons = input.required<ReadonlyArray<IItem | undefined>>();
  readonly today = input.required<DateTime>();
  /** First day to play: today, or the start of an upcoming season. */
  readonly start = input.required<DateTime>();
  readonly end = input.required<DateTime>();
  readonly candlesPerDay = input.required<number>();
  readonly checkedIn = input.required<boolean>();
  /** Tree accompanied today, once logged. */
  readonly accompaniedTree = input.required<number | undefined>();
  readonly selected = model.required<DateTime>();
  readonly checkIn = output<MouseEvent>();
  readonly accompany = output<number>();
  readonly bought = output<ISeasonGoal>();

  readonly WEEKDAYS = WEEKDAYS;

  readonly month = computed(() => this.selected().startOf('month'));

  private readonly _buyDays = computed(() => {
    const days = new Map<string, Array<ISeasonGoal>>();
    for (const goal of this.goals()) {
      if (!goal.date) { continue; }
      const key = goal.date.toISODate()!;
      days.set(key, [...(days.get(key) ?? []), goal]);
    }
    return days;
  });

  /** Last day with an accompany or purchase planned. */
  private readonly _lastPlanned = computed(() => {
    const keys = [...this._buyDays().keys(), ...this.accompanies().keys()];
    return keys.length ? keys.reduce((a, b) => a > b ? a : b) : undefined;
  });

  readonly days = computed<Array<ICalendarDay>>(() => {
    const month = this.month();
    const today = this.today();
    const start = this.start().startOf('day');
    const end = this.end();
    const lastPlanned = this._lastPlanned();
    const buyDays = this._buyDays();
    const accompanies = this.accompanies();
    const icons = this.spiritIcons();
    const accompaniedTree = this.accompaniedTree();

    const days: Array<ICalendarDay> = [];
    const last = month.endOf('month').endOf('week');
    for (let date = month.startOf('week'); date <= last; date = date.plus({ days: 1 })) {
      const key = date.toISODate()!;
      const inSeason = date >= start && date <= end;
      const isToday = date.hasSame(today, 'day');
      const iTree = (isToday ? accompaniedTree : undefined) ?? accompanies.get(key);
      days.push({
        date, key, inSeason,
        inMonth: date.month === month.month,
        isToday,
        isPast: date < today.startOf('day'),
        planned: inSeason && !!lastPlanned && key <= lastPlanned,
        isLastDay: date.hasSame(end, 'day'),
        buys: buyDays.get(key) ?? [],
        accompanyIcon: iTree !== undefined ? icons[iTree] : undefined
      });
    }
    return days;
  });

  readonly selectedKey = computed(() => this.selected().toISODate()!);
  readonly selectedIsToday = computed(() => this.selected().hasSame(this.today(), 'day'));
  readonly selectedInSeason = computed(() => this.selected() >= this.start().startOf('day') && this.selected() <= this.end());
  readonly selectedIsLastDay = computed(() => this.selected().hasSame(this.end(), 'day'));
  readonly selectedAccompanied = computed(() => this.selectedIsToday() ? this.accompaniedTree() : undefined);
  readonly selectedAccompany = computed(() => this.accompanies().get(this.selectedKey()));
  /** Accompanying is still possible on the day, but no goal needs it. */
  readonly selectedOptionalAccompany = computed(() => this.selectedAccompany() === undefined
    && this.selectedAccompanied() === undefined
    && this.selected() >= this.today().startOf('day'));
  readonly selectedCollect = computed(() => this.selectedIsToday() && this.selectedInSeason());
  readonly selectedBuys = computed(() => this._buyDays().get(this.selectedKey()) ?? []);

  select(day: ICalendarDay): void {
    this.selected.set(day.date);
  }

  shiftMonth(offset: number): void {
    const target = this.month().plus({ months: offset });
    // Stay on today when moving back to the current month.
    this.selected.set(target.hasSame(this.today(), 'month') ? this.today() : target);
  }

  goToToday(): void {
    this.selected.set(this.today());
  }

  dayLabel(day: ICalendarDay): string {
    const parts = [day.date.toFormat('cccc d LLLL')];
    if (day.buys.length) { parts.push(`${day.buys.length} to buy`); }
    if (day.isLastDay) { parts.push('last day of the season'); }
    return parts.join(', ');
  }
}
