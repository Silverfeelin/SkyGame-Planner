import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { IItem } from 'skygame-data';
import { DataService } from './data.service';
import { StorageService } from './storage.service';
import { DateHelper } from '@app/helpers/date-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { GOAL_DAY_FORMAT, GoalBucketKey, GoalHelper, GoalTarget, IGoalBucket, IGoalPlan, IGoalSavings } from '@app/helpers/goal-helper';

export interface IGoalIncome {
  c: number;
  h: number;
  ac: number;
}

export interface IStorageGoals {
  /** Item guids and savings ids, highest priority first. */
  items: Array<string>;
  income: IGoalIncome;
  /** Future days on which no currencies will be collected, as yyyy-MM-dd in Sky time. */
  skipped?: Array<string>;
  savings?: Array<IGoalSavings>;
}

interface IGoalState {
  items: ReadonlyArray<string>;
  income: IGoalIncome;
  skipped: ReadonlySet<string>;
  savings: ReadonlyArray<IGoalSavings>;
}

const STORAGE_KEY = 'goals';
/** Roughly what a full daily candle run yields. */
const DEFAULT_INCOME: IGoalIncome = { c: 15, h: 0, ac: 0 };

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);

  readonly items = signal<ReadonlyArray<string>>([]);
  readonly income = signal<IGoalIncome>({ ...DEFAULT_INCOME });
  readonly skipped = signal<ReadonlySet<string>>(new Set());
  readonly savings = signal<ReadonlyArray<IGoalSavings>>([]);

  constructor() {
    this.load();
    // Picks up Dropbox syncs and changes from other tabs.
    this._storageService.events.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  has(guid: string): boolean {
    return this.items().includes(guid);
  }

  add(...guids: Array<string>): void {
    const current = this.items();
    const added = guids.filter((g, i) => !current.includes(g) && guids.indexOf(g) === i);
    if (!added.length) { return; }
    this.save({ items: [...current, ...added] });
  }

  remove(...guids: Array<string>): void {
    const remove = new Set(guids);
    this.save({ items: this.items().filter(g => !remove.has(g)) });
  }

  toggle(guid: string): void {
    this.has(guid) ? this.remove(guid) : this.add(guid);
  }

  move(guid: string, offset: number): void {
    const items = [...this.items()];
    const from = items.indexOf(guid);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= items.length) { return; }
    items.splice(to, 0, ...items.splice(from, 1));
    this.save({ items });
  }

  /** Puts the given goals in this order, in the positions they already take up between the other goals. */
  setOrder(guids: ReadonlyArray<string>): void {
    const moved = new Set(guids);
    const queue = [...guids];
    const items = this.items().map(g => moved.has(g) ? queue.shift()! : g);
    this.save({ items });
  }

  setIncome(income: IGoalIncome): void {
    this.save({ income });
  }

  toggleSkipped(day: string): void {
    const skipped = new Set(this.skipped());
    skipped.has(day) ? skipped.delete(day) : skipped.add(day);
    this.save({ skipped });
  }

  clearSkipped(): void {
    this.save({ skipped: new Set() });
  }

  /** Adds a savings line at the top, so it is paid for before every other goal. */
  addSavings(): void {
    const savings: IGoalSavings = { id: nanoid(10), name: 'Rainy day savings', c: 0, h: 0, ac: 0 };
    this.save({ items: [savings.id, ...this.items()], savings: [...this.savings(), savings] });
  }

  updateSavings(id: string, patch: Partial<Omit<IGoalSavings, 'id'>>): void {
    this.save({ savings: this.savings().map(s => s.id === id ? { ...s, ...patch } : s) });
  }

  /** The item or savings line stored under the id. */
  resolve(id: string): GoalTarget | undefined {
    return (this._dataService.guidMap.get(id) as IItem | undefined) ?? this.savings().find(s => s.id === id);
  }

  /** Projects goals against the stored balance. Items with a {@link GoalHelper.limitedCurrency} should be left out. */
  project(targets: ReadonlyArray<GoalTarget>, today: DateTime): IGoalPlan {
    const balance = this._storageService.getCurrencies();
    const income = this.income();
    const buckets = new Map<GoalBucketKey, IGoalBucket>([
      ['c', { balance: balance.candles, perDay: income.c }],
      ['h', { balance: balance.hearts, perDay: income.h }],
      ['ac', { balance: balance.ascendedCandles, perDay: income.ac }]
    ]);
    const estimate = (item: IItem) => ItemHelper.estimateCost(item, this._dataService.itemConfig.items);
    return GoalHelper.project(targets, buckets, today, this.skipped(), estimate);
  }

  private load(): void {
    const stored = this._storageService.getKey<IStorageGoals>(STORAGE_KEY);
    const items = stored?.items ?? [];
    const income = { ...DEFAULT_INCOME, ...stored?.income };
    if (!this.sameItems(items)) { this.items.set(items); }
    const cur = this.income();
    if (cur.c !== income.c || cur.h !== income.h || cur.ac !== income.ac) { this.income.set(income); }
    const skipped = this.futureDays(stored?.skipped ?? []);
    if (!this.sameSkipped(skipped)) { this.skipped.set(skipped); }
    const savings = stored?.savings ?? [];
    if (JSON.stringify(savings) !== JSON.stringify(this.savings())) { this.savings.set(savings); }
  }

  private save(patch: Partial<IGoalState>): void {
    const items = [...(patch.items ?? this.items())];
    const income = patch.income ?? this.income();
    const skipped = this.futureDays(patch.skipped ?? this.skipped());
    const savings = (patch.savings ?? this.savings()).filter(s => items.includes(s.id));
    this.items.set(items);
    this.income.set(income);
    this.skipped.set(skipped);
    this.savings.set(savings);
    this._storageService.setKey<IStorageGoals>(STORAGE_KEY, { items, income, skipped: [...skipped].sort(), savings });
  }

  /** Past skipped days no longer affect anything, so they are dropped. */
  private futureDays(days: Iterable<string>): ReadonlySet<string> {
    const today = DateHelper.todaySky().toFormat(GOAL_DAY_FORMAT);
    return new Set([...days].filter(d => d > today));
  }

  private sameSkipped(skipped: ReadonlySet<string>): boolean {
    const cur = this.skipped();
    return cur.size === skipped.size && [...skipped].every(d => cur.has(d));
  }

  private sameItems(items: ReadonlyArray<string>): boolean {
    const cur = this.items();
    return cur.length === items.length && cur.every((g, i) => g === items[i]);
  }
}
