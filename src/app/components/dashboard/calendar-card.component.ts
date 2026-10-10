import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { map } from 'rxjs';
import { DateTime } from 'luxon';
import { IItem } from 'skygame-data';
import { CALENDAR_ACTIVITY_KINDS, CalendarHelper, ICalendarActivity } from '@app/helpers/calendar-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { GoalHelper } from '@app/helpers/goal-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { ShardInfo, getShardInfo } from '@app/helpers/shard-helper';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { FoldableCardComponent } from '@app/components/shared/foldable-card/foldable-card.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';

type ShardColor = 'red' | 'black';
type ShardStatus = 'scheduled' | 'active' | 'ended';

interface ICalendarDayShard {
  color: ShardColor;
  status: ShardStatus;
}

interface ICalendarDay {
  date: DateTime;
  key: string;
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  isSelected: boolean;
  shard?: ICalendarDayShard;
  leaving: boolean;
  label: string;
}

interface ICalendarBar {
  activity: ICalendarActivity;
  row: number;
  colStart: number;
  colEnd: number;
  clippedStart: boolean;
  clippedEnd: boolean;
  hint: string;
}

/** Favourited items whose last chance from one source falls on the same day. */
interface ICalendarLeaving {
  source: string;
  items: Array<IItem>;
}

const KIND_ORDER = new Map(CALENDAR_ACTIVITY_KINDS.map((k, i) => [k.kind, i]));
const SKY_SHARDS_URL = 'https://sky-shards.pages.dev/en';
const SHARD_IMAGES: Record<ShardColor, string> = {
  red: '/assets/external/wiki-shard-red.webp',
  black: '/assets/external/wiki-shard-black.webp'
};
/** Shard status only changes at a landing or an end, so a coarse tick is enough. */
const NOW_TICK_MS = 30_000;
const FOLDED_KEY = 'dashboard.calendar.folded';
/** Below this width two weeks no longer fit; matches where the dashboard drops to one column. */
const NARROW_QUERY = '(max-width: 639px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/** Horizontal travel before a touch drag counts as a swipe rather than a tap. */
const SWIPE_SLOP = 10;
/** Swipe distance past which releasing moves to the adjacent weeks instead of snapping back. */
const SWIPE_COMMIT = 48;
const SLIDE_IN_PX = 40;
const SLIDE_MS = 200;

@Component({
  selector: 'app-dashboard-calendar',
  templateUrl: './calendar-card.component.html',
  styleUrl: './calendar-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, ItemIconComponent, TooltipDirective, FoldableCardComponent]
})
export class DashboardCalendarComponent {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _eventService = inject(EventService);
  private readonly _breakpointObserver = inject(BreakpointObserver);
  private readonly _zone = inject(NgZone);

  private readonly _timeline = viewChild.required<ElementRef<HTMLElement>>('timeline');
  private readonly _track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly SHARD_IMAGES = SHARD_IMAGES;
  readonly SKY_SHARDS_URL = SKY_SHARDS_URL;

  readonly today = DateHelper.todaySky();
  private readonly _now = signal(DateTime.now());
  readonly page = signal(0);
  readonly selected = signal(this.today);
  readonly folded = signal(localStorage.getItem(FOLDED_KEY) === '1');

  readonly narrow = toSignal(
    this._breakpointObserver.observe(NARROW_QUERY).pipe(map(s => s.matches)),
    { initialValue: this._breakpointObserver.isMatched(NARROW_QUERY) }
  );
  readonly span = computed(() => this.narrow() ? 7 : 14);

  readonly start = computed(() => this.today.startOf('week').plus({ days: this.page() * this.span() }));
  readonly end = computed(() => this.start().plus({ days: this.span() - 1 }));
  readonly rangeLabel = computed(() => {
    const start = this.start();
    const end = this.end();
    if (this.narrow()) {
      return `${start.toFormat(start.hasSame(end, 'month') ? 'd' : 'd LLL')} – ${end.toFormat('d LLL')}`;
    }
    return start.hasSame(end, 'year')
      ? `${start.toFormat('d LLL')} – ${end.toFormat('d LLL yyyy')}`
      : `${start.toFormat('d LLL yyyy')} – ${end.toFormat('d LLL yyyy')}`;
  });

  private readonly _activities = CalendarHelper.getActivities(this._dataService);

  /** Bumped whenever an item is favourited or (un)locked, to re-run the wishlist computeds. */
  private readonly _revision = signal(0);

  /** Unowned favourites keyed by the sky day they can last be obtained. */
  private readonly _leaving = computed(() => {
    this._revision();
    const byDay = new Map<string, Map<string, Array<IItem>>>();
    for (const guid of this._storageService.getFavourites()) {
      const item = this._dataService.guidMap.get(guid) as IItem | undefined;
      if (!item?.favourited || item.unlocked) { continue; }
      // A permanent source wins, so items that can always be unlocked never show up here.
      const window = GoalHelper.resolveSource(item)?.window;
      if (window?.kind !== 'limited' && window?.kind !== 'upcoming') { continue; }

      const key = window.endDate.setZone(DateHelper.skyTimeZone).toISODate()!;
      const sources = byDay.get(key) ?? new Map<string, Array<IItem>>();
      sources.set(window.label, [...(sources.get(window.label) ?? []), item]);
      byDay.set(key, sources);
    }

    const result = new Map<string, Array<ICalendarLeaving>>();
    byDay.forEach((sources, key) => result.set(key, [...sources].map(([source, items]) => {
      ItemHelper.sortItems(items);
      return { source, items };
    })));
    return result;
  });

  readonly days = computed<Array<ICalendarDay>>(() => {
    const start = this.start();
    const selected = this.selected();
    const leaving = this._leaving();
    const now = this._now();
    return Array.from({ length: this.span() }, (_, i) => {
      const date = start.plus({ days: i });
      const key = date.toISODate()!;
      const shard = this.getShard(date, now);
      const isLeaving = leaving.has(key);
      const label = [date.toFormat('cccc d LLLL'), shard ? `${shard.color} shard ${shard.status}` : 'no shard'];
      if (isLeaving) { label.push('wishlist items leave'); }
      return {
        date, key,
        isToday: date.hasSame(this.today, 'day'),
        isPast: date < this.today,
        isWeekend: date.weekday >= 6,
        isSelected: date.hasSame(selected, 'day'),
        shard,
        leaving: isLeaving,
        label: label.join(', ')
      };
    });
  });

  /** Activities overlapping the visible days, packed into rows so no two bars overlap. */
  readonly bars = computed<Array<ICalendarBar>>(() => {
    const start = this.start();
    const span = this.span();
    const visible = this.activitiesUntil(this.end().endOf('day'))
      .map(activity => ({ activity, from: this.dayIndex(activity.date, start), to: this.dayIndex(activity.endDate, start) }))
      .filter(b => b.to >= 0 && b.from < span)
      .sort((a, b) => KIND_ORDER.get(a.activity.kind)! - KIND_ORDER.get(b.activity.kind)! || a.from - b.from);

    const rowEnds: Array<number> = [];
    return visible.map(({ activity, from, to }) => {
      let row = rowEnds.findIndex(end => end < from);
      if (row < 0) { row = rowEnds.push(to) - 1; } else { rowEnds[row] = to; }
      return {
        activity,
        row: row + 1,
        colStart: Math.max(from, 0) + 1,
        colEnd: Math.min(to, span - 1) + 2,
        clippedStart: from < 0,
        clippedEnd: to >= span,
        hint: to >= span ? `${activity.detail} · until ${activity.endDate.toFormat('d LLL')}` : activity.detail
      };
    });
  });

  readonly detail = computed(() => {
    const date = this.selected();
    const dayEnd = date.endOf('day');
    const activities = this.activitiesUntil(dayEnd)
      .filter(a => a.date <= dayEnd && a.endDate >= date)
      .sort((a, b) => KIND_ORDER.get(a.kind)! - KIND_ORDER.get(b.kind)! || a.date.toMillis() - b.date.toMillis())
      .map(activity => ({
        activity,
        dates: `${activity.date.toFormat(DateHelper.displayFormat)} – ${activity.endDate.toFormat(DateHelper.displayFormat)}`,
        tag: activity.expected ? 'Expected'
          : activity.date.hasSame(date, 'day') ? 'Starts'
          : activity.endDate.hasSame(date, 'day') ? 'Last day' : ''
      }));
    return {
      date,
      isToday: date.hasSame(this.today, 'day'),
      shard: this.getShard(date, this._now()),
      activities,
      leaving: this._leaving().get(date.toISODate()!) ?? []
    };
  });

  constructor() {
    const tick = window.setInterval(() => this._now.set(DateTime.now()), NOW_TICK_MS);
    const listeners = new AbortController();
    inject(DestroyRef).onDestroy(() => {
      window.clearInterval(tick);
      listeners.abort();
    });
    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(() => this._revision.update(v => v + 1));
    this._eventService.itemFavourited.pipe(takeUntilDestroyed()).subscribe(() => this._revision.update(v => v + 1));

    // Pointer moves would otherwise run change detection on every frame of a drag.
    afterNextRender(() => this._zone.runOutsideAngular(() => this.bindSwipe(listeners.signal)));
  }

  shiftPage(offset: number): void {
    this.page.update(page => page + offset);
    this.animateTrack([{ translate: `${Math.sign(offset) * SLIDE_IN_PX}px 0`, opacity: 0 }, { translate: '0 0', opacity: 1 }]);
  }

  goToToday(): void {
    this.page.set(0);
    this.selected.set(this.today);
  }

  onFoldedChange(folded: boolean): void {
    this.folded.set(folded);
    localStorage.setItem(FOLDED_KEY, folded ? '1' : '0');
  }

  barTooltip(bar: ICalendarBar): string {
    const a = bar.activity;
    return `${a.title} · ${a.date.toFormat(DateHelper.displayFormat)} – ${a.endDate.toFormat(DateHelper.displayFormat)}`;
  }

  /** Touch drags across the timeline move it with the finger and page through the weeks on release. */
  private bindSwipe(signal: AbortSignal): void {
    const timeline = this._timeline().nativeElement;
    const track = this._track().nativeElement;
    let drag: { id: number; x: number; y: number; dx: number; swiping: boolean } | undefined;
    // Browsers may still fire a click when a swipe is released, which would select a day or open a bar.
    let swallowClick = false;

    const release = (commit: boolean) => {
      const dx = drag?.swiping ? drag.dx : 0;
      drag = undefined;
      if (!dx) { return; }

      swallowClick = true;
      track.style.translate = '';
      if (commit && Math.abs(dx) >= SWIPE_COMMIT) {
        this._zone.run(() => this.shiftPage(dx < 0 ? 1 : -1));
      } else {
        this.animateTrack([{ translate: `${dx}px 0` }, { translate: '0 0' }]);
      }
    };

    timeline.addEventListener('pointerdown', e => {
      swallowClick = false;
      if (e.pointerType === 'mouse' || drag) { return; }
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, swiping: false };
    }, { signal });

    timeline.addEventListener('pointermove', e => {
      if (e.pointerId !== drag?.id) { return; }
      const dx = e.clientX - drag.x;
      if (!drag.swiping) {
        if (Math.abs(dx) < SWIPE_SLOP) { return; }
        if (Math.abs(dx) < Math.abs(e.clientY - drag.y)) { drag = undefined; return; }
        drag.swiping = true;
        timeline.setPointerCapture(e.pointerId);
      }
      drag.dx = dx;
      track.style.translate = `${dx}px 0`;
    }, { signal });

    timeline.addEventListener('pointerup', e => { if (e.pointerId === drag?.id) { release(true); } }, { signal });
    timeline.addEventListener('pointercancel', e => { if (e.pointerId === drag?.id) { release(false); } }, { signal });
    timeline.addEventListener('click', e => {
      if (!swallowClick) { return; }
      swallowClick = false;
      e.preventDefault();
      e.stopPropagation();
    }, { signal, capture: true });
  }

  private animateTrack(keyframes: Array<Keyframe>): void {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) { return; }
    this._track().nativeElement.animate(keyframes, { duration: SLIDE_MS, easing: 'ease-out' });
  }

  private activitiesUntil(until: DateTime): Array<ICalendarActivity> {
    return [...this._activities, ...CalendarHelper.getExpectedTravelingSpirits(this._dataService, until)];
  }

  private dayIndex(date: DateTime, start: DateTime): number {
    return Math.round(date.setZone(DateHelper.skyTimeZone).startOf('day').diff(start, 'days').days);
  }

  private getShard(date: DateTime, now: DateTime): ICalendarDayShard | undefined {
    const info = getShardInfo(date);
    if (!info.hasShard) { return undefined; }
    return { color: info.isRed ? 'red' : 'black', status: this.getShardStatus(info.occurrences, now) };
  }

  /** Same rule as the shard indicator: a shard counts as active from landing until it ends. */
  private getShardStatus(occurrences: ShardInfo['occurrences'], now: DateTime): ShardStatus {
    if (occurrences.some(o => now >= o.land && now < o.end)) { return 'active'; }
    return occurrences.some(o => now < o.land) ? 'scheduled' : 'ended';
  }
}
