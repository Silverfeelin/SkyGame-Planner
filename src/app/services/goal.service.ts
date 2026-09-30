import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StorageService } from './storage.service';
import { DateHelper } from '@app/helpers/date-helper';
import { GOAL_DAY_FORMAT } from '@app/helpers/goal-helper';

export interface IGoalIncome {
  c: number;
  h: number;
  ac: number;
}

export interface IStorageGoals {
  /** Item guids, highest priority first. */
  items: Array<string>;
  income: IGoalIncome;
  /** Future days on which no currencies will be collected, as yyyy-MM-dd in Sky time. */
  skipped?: Array<string>;
}

const STORAGE_KEY = 'goals';
/** Roughly what a full daily candle run yields. */
const DEFAULT_INCOME: IGoalIncome = { c: 15, h: 0, ac: 0 };

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly _storageService = inject(StorageService);

  readonly items = signal<ReadonlyArray<string>>([]);
  readonly income = signal<IGoalIncome>({ ...DEFAULT_INCOME });
  readonly skipped = signal<ReadonlySet<string>>(new Set());

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
    this.save([...current, ...added], this.income());
  }

  remove(...guids: Array<string>): void {
    const remove = new Set(guids);
    this.save(this.items().filter(g => !remove.has(g)), this.income());
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
    this.save(items, this.income());
  }

  setIncome(income: IGoalIncome): void {
    this.save([...this.items()], income);
  }

  toggleSkipped(day: string): void {
    const skipped = new Set(this.skipped());
    skipped.has(day) ? skipped.delete(day) : skipped.add(day);
    this.save([...this.items()], this.income(), skipped);
  }

  clearSkipped(): void {
    this.save([...this.items()], this.income(), new Set());
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
  }

  private save(items: Array<string>, income: IGoalIncome, skipped = this.skipped()): void {
    skipped = this.futureDays(skipped);
    this.items.set(items);
    this.income.set(income);
    this.skipped.set(skipped);
    this._storageService.setKey<IStorageGoals>(STORAGE_KEY, { items, income, skipped: [...skipped].sort() });
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
