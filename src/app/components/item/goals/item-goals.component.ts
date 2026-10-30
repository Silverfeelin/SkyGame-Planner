import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LowerCasePipe, NgTemplateOutlet } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ICost, IEventInstance, IItem } from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { SeasonHelper } from '@app/helpers/season-helper';
import { INavigationTarget, NavigationHelper } from '@app/helpers/navigation-helper';
import { GoalBucketKey, GoalHelper, GoalTarget, IGoalPlan, IGoalProjection, IGoalSavings } from '@app/helpers/goal-helper';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { GoalService, IGoalIncome } from '@app/services/goal.service';
import { StorageService } from '@app/services/storage.service';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { DateTimePipe } from '@app/pipes/date-time.pipe';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';
import { ItemGridLayoutComponent, ITEM_GRID_TYPES } from '@app/components/item/grid/item-grid-layout.component';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { ItemGoalsCalendarComponent } from './calendar/item-goals-calendar.component';

const CURRENCY_NAMES: Record<GoalBucketKey, string> = {
  c: 'candles', h: 'hearts', ac: 'ascended candles'
};

@Component({
  selector: 'app-item-goals',
  templateUrl: './item-goals.component.html',
  styleUrl: './item-goals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, LowerCasePipe, CdkDropList, CdkDrag, CdkDragHandle, RouterLink, MatIcon, TooltipDirective, DateTimePipe, CostComponent, ItemIconComponent, ItemGridLayoutComponent, SectionQuickActionsComponent, ItemGoalsCalendarComponent]
})
export class ItemGoalsComponent {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _eventService = inject(EventService);
  private readonly _goalService = inject(GoalService);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly reportUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSchGuK36-UMWdZYmn9BE9tpMdiHMifAkCx8EsfCnINehK6_yA/viewform?usp=header';
  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly pickerItems: ReadonlyArray<IItem> = this._dataService.itemConfig.items.filter(i => ITEM_GRID_TYPES.has(i.type));

  readonly showAddItems = signal(false);
  readonly showSeasonItems = signal(false);
  readonly showEventItems = signal(false);
  readonly income = this._goalService.income;
  readonly today = DateHelper.todaySky();
  readonly selectedDay = signal(this.today);
  readonly focusedGoal = signal<string | undefined>(undefined);
  readonly quickSorting = signal(false);
  /** Goal ids picked during a quick sort, in the order they were clicked. */
  readonly quickSortPicks = signal<ReadonlyArray<string>>([]);

  private readonly _calendar = viewChild('calendar', { read: ElementRef });

  /** Bumped when currencies or unlocks change, since those live outside signals. */
  private readonly _revision = signal(0);

  readonly goalSet = computed(() => new Set(this._goalService.items()));

  readonly targets = computed<ReadonlyArray<GoalTarget>>(() => this._goalService.items()
    .map(id => this._goalService.resolve(id))
    .filter((t): t is GoalTarget => !!t));

  readonly itemSources = computed(() => {
    this._revision();
    const items = this.targets().filter((t): t is IItem => !GoalHelper.isSavings(t));
    return new Map<string, INavigationTarget | undefined>(items.map(i => [i.guid, NavigationHelper.getItemSource(i)]));
  });

  /** Season and event items are kept apart since they have their own calculators. */
  private readonly _split = computed(() => {
    this._revision();
    const regular: Array<GoalTarget> = [];
    const season: Array<IItem> = [];
    const event: Array<IItem> = [];
    const eventInstances = new Set<IEventInstance>();
    for (const item of this.targets()) {
      if (GoalHelper.isSavings(item)) { regular.push(item); continue; }
      const limited = GoalHelper.limitedCurrency(item);
      if (!limited) { regular.push(item); continue; }
      if (limited.kind === 'season') { season.push(item); continue; }
      event.push(item);
      const instance = limited.eventInstanceGuid && this._dataService.guidMap.get(limited.eventInstanceGuid) as IEventInstance | undefined;
      if (instance) { eventInstances.add(instance); }
    }
    return { regular, season, event, eventInstances: [...eventInstances] };
  });

  readonly seasonItems = computed(() => this._split().season);
  readonly seasonPlanner = SeasonHelper.getPlanner(SeasonHelper.getPlannedSeason(this._dataService.seasonConfig.items));
  readonly eventItems = computed(() => this._split().event);
  readonly eventInstances = computed(() => this._split().eventInstances);

  readonly balance = computed(() => {
    this._revision();
    return this._storageService.getCurrencies();
  });

  readonly balanceCost = computed<ICost>(() => {
    const b = this.balance();
    return { c: b.candles, h: b.hearts, ac: b.ascendedCandles };
  });

  readonly plan = computed<IGoalPlan>(() => {
    this._revision();
    return this._goalService.project(this._split().regular, this.today);
  });

  readonly goals = computed<ReadonlyArray<IGoalProjection>>(() => this.plan().goals);

  readonly totalCost = computed<ICost>(() => {
    const total = CostHelper.create();
    this.goals().forEach(g => CostHelper.add(total, g.cost));
    return total;
  });

  readonly totalPrice = computed(() => this.goals()
    .filter(g => g.status === 'purchase')
    .reduce((sum, g) => sum + g.price, 0));

  readonly ownedCount = computed(() => this.goals().filter(g => g.status === 'owned').length);

  constructor() {
    const bump = () => this._revision.update(v => v + 1);
    this._storageService.events.pipe(takeUntilDestroyed()).subscribe(bump);
    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(bump);
  }

  toggleAddItems(): void {
    this.showAddItems.update(v => !v);
  }

  onPickerItemClicked(item: IItem): void {
    this._goalService.toggle(item.guid);
  }

  addFavourites(): void {
    const guids = [...this._storageService.getFavourites()].filter(guid => {
      const item = this._dataService.guidMap.get(guid) as IItem | undefined;
      return item && !item.unlocked;
    });
    if (!guids.length) { return alert('You have no wishlist items that you do not own yet.'); }
    this._goalService.add(...guids);
  }

  addSavings(): void {
    this._goalService.addSavings();
  }

  setSavingsName(goal: IGoalProjection, evt: Event): void {
    const name = (evt.target as HTMLInputElement).value.trim();
    this._goalService.updateSavings(goal.id, { name: name || 'Rainy day savings' });
  }

  setSavingsAmount(goal: IGoalProjection, key: keyof Omit<IGoalSavings, 'id' | 'name'>, evt: Event): void {
    const value = Math.max(0, parseFloat((evt.target as HTMLInputElement).value) || 0);
    this._goalService.updateSavings(goal.id, { [key]: value });
  }

  moveUp(goal: IGoalProjection): void { this.moveTo(goal, this.goals().indexOf(goal) - 1); }
  moveDown(goal: IGoalProjection): void { this.moveTo(goal, this.goals().indexOf(goal) + 1); }
  onGoalDropped(evt: CdkDragDrop<unknown, unknown, IGoalProjection>): void { this.moveTo(evt.item.data, evt.currentIndex); }
  remove(goal: IGoalProjection): void { this._goalService.remove(goal.id); }
  removeItem(item: IItem): void { this._goalService.remove(item.guid); }

  /** Moves the goal to a position in the shown list, stepping over the season and event items stored between goals. */
  private moveTo(goal: IGoalProjection, index: number): void {
    const neighbour = this.goals()[index];
    if (!neighbour || neighbour === goal) { return; }
    const stored = this._goalService.items();
    this._goalService.move(goal.id, stored.indexOf(neighbour.id) - stored.indexOf(goal.id));
  }

  clearOwned(): void {
    this._goalService.remove(...this.goals().filter(g => g.status === 'owned').map(g => g.id));
  }

  askClearAll(): void {
    if (!confirm('Remove all goals?')) { return; }
    this._goalService.remove(...this.goals().map(g => g.id));
  }

  startQuickSort(): void {
    this.quickSortPicks.set([]);
    this.quickSorting.set(true);
  }

  cancelQuickSort(): void {
    this.quickSorting.set(false);
  }

  toggleQuickSortPick(id: string): void {
    this.quickSortPicks.update(picks => picks.includes(id) ? picks.filter(g => g !== id) : [...picks, id]);
  }

  /** Moves the picked goals to the front in the order they were picked; the rest keep their order behind them. */
  applyQuickSort(): void {
    const picks = this.quickSortPicks();
    const rest = this.goals().map(g => g.id).filter(g => !picks.includes(g));
    this._goalService.setOrder([...picks, ...rest]);
    this.quickSorting.set(false);
  }

  setIncome(key: keyof IGoalIncome, evt: Event): void {
    const value = Math.max(0, parseFloat((evt.target as HTMLInputElement).value) || 0);
    this._goalService.setIncome({ ...this.income(), [key]: value });
  }

  goalName(goal: IGoalProjection): string {
    return GoalHelper.goalName(goal);
  }

  windowLabel(goal: IGoalProjection): string | undefined {
    if (goal.status === 'owned') { return undefined; }
    const window = goal.source?.window;
    switch (window?.kind) {
      case 'limited': return `${window.label} · until ${window.endDate.toFormat(DateHelper.displayFormat)}`;
      case 'upcoming': return `${window.label} · ${window.startDate.toFormat(DateHelper.displayFormat)} – ${window.endDate.toFormat(DateHelper.displayFormat)}`;
      case 'unavailable': return window.label;
      default: return undefined;
    }
  }

  blockedLabel(goal: IGoalProjection): string {
    const names = (goal.blockedBy ?? []).map(key => CURRENCY_NAMES[key]);
    return `Set how many ${names.join(' and ')} you earn per day`;
  }

  beforeHigherLabel(goal: IGoalProjection): string {
    const end = goal.source && GoalHelper.windowEnd(goal.source.window);
    const first = goal.beforeHigher?.[0];
    return `Unavailable after ${end?.toFormat(DateHelper.displayFormat)}. You might want to move this item above ${first && GoalHelper.goalName(first)}.`;
  }

  showInCalendar(goal: IGoalProjection): void {
    if (!goal.date) { return; }
    this.selectedDay.set(goal.date);
    this._calendar()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  showInList(goal: IGoalProjection): void {
    const row = this._elementRef.nativeElement.querySelector(`[data-goal="${goal.id}"]`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Reset first so clicking the same goal again replays the highlight.
    this.focusedGoal.set(undefined);
    requestAnimationFrame(() => this.focusedGoal.set(goal.id));
  }

  /** Only candles, hearts and ascended candles are saved up; other currencies don't delay the goals below. */
  holdsBack(goal: IGoalProjection): boolean {
    return !!(goal.cost.c || goal.cost.h || goal.cost.ac);
  }

  /** Whole days the goal overshoots its availability window by. */
  daysLate(goal: IGoalProjection): number {
    const end = goal.source && GoalHelper.windowEnd(goal.source.window);
    if (!goal.date || !end) { return 0; }
    return DateHelper.daysBetween(end, goal.date);
  }
}
