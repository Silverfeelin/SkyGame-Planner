import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, input, isDevMode, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';
import { getShardInfo } from '@app/helpers/shard-helper';
import { TooltipDirective } from '@app/directives/tooltip.directive';

export type ShardState = 'none' | 'upcoming' | 'active' | 'over';

const SKY_SHARDS_URL = 'https://sky-shards.pages.dev/en';
const _DEBUG_OFFSET = isDevMode() ? { hour: 0, minute: 0, second: 0 } : {};

@Component({
  selector: 'app-shard-indicator',
  imports: [TooltipDirective, MatIconModule],
  templateUrl: './shard-indicator.component.html',
  styleUrl: './shard-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShardIndicatorComponent implements OnInit, OnDestroy {
  /**
   * 'chip' shows icon + text, 'icon' shows the shard glyph only (tight rows),
   * 'tile' renders a card matching the /daily countdown tiles.
   */
  readonly variant = input<'chip' | 'icon' | 'tile'>('chip');

  readonly href = SKY_SHARDS_URL;

  private readonly _now = signal<DateTime>(DateTime.now().plus(_DEBUG_OFFSET));
  /**
   * A sky day's landing times never change once known, so the helper is only
   * consulted when the sky day rolls over; every tick in between just counts
   * down against the cached occurrences.
   */
  private readonly _info = signal(getShardInfo(DateTime.now().plus(_DEBUG_OFFSET)));
  private _infoDay = DateHelper.todaySky().toISODate();
  private _interval?: number;

  readonly isRed = computed(() => this._info().isRed);

  readonly state = computed<ShardState>(() => {
    const now = this._now();
    const info = this._info();
    if (!info.hasShard) { return 'none'; }
    if (info.occurrences.some(o => now >= o.land && now < o.end)) { return 'active'; }
    if (info.occurrences.some(o => now < o.land)) { return 'upcoming'; }
    return 'over';
  });

  readonly imgSrc = computed(() =>
    this.isRed() ? '/assets/external/wiki-shard-red.webp' : '/assets/external/wiki-shard-black.webp');

  /** The occurrence that drives the label: the running one, else the next one to land. */
  private readonly _relevant = computed(() => {
    const now = this._now();
    const occurrences = this._info().occurrences;
    return occurrences.find(o => now >= o.land && now < o.end)
      ?? occurrences.find(o => now < o.land);
  });

  /** The moment the countdown runs towards: the next landing, or the end of the running shard. */
  private readonly _target = computed(() => {
    const relevant = this._relevant();
    if (!relevant) { return undefined; }
    return this.state() === 'active' ? relevant.end : relevant.land;
  });

  readonly shardName = computed(() => this.isRed() ? 'Red' : 'Black');

  /** hh:mm until the next landing; only meaningful while state is 'upcoming'. */
  readonly countdown = computed(() => {
    const relevant = this._relevant();
    if (!relevant) { return ''; }
    const diff = relevant.land.diff(this._now());
    const hours = Math.floor(diff.as('hours'));
    const minutes = Math.floor(diff.as('minutes')) % 60;
    return hours > 0 ? `in ${hours}h ${minutes}m` : `in ${minutes}m`;
  });

  readonly label = computed(() => {
    switch (this.state()) {
      case 'none': return 'No shard today';
      case 'active': return `${this.shardName()} shard · active`;
      case 'upcoming': return `${this.shardName()} shard · ${this.countdown()}`;
      case 'over': return `${this.shardName()} shard · done for today`;
    }
  });

  /** Tile variant: the caption, phrased like the other countdown tiles. */
  readonly tileLabel = computed(() => {
    switch (this.state()) {
      case 'none': return 'Shards';
      case 'active': return `${this.shardName()} shard ends in`;
      case 'upcoming': return `${this.shardName()} shard lands in`;
      case 'over': return `${this.shardName()} shard`;
    }
  });

  /** Tile variant: the large value line, matching the other tiles' `[Nd ]hh:mm:ss`. */
  readonly tileValue = computed(() => {
    switch (this.state()) {
      case 'none': return 'None today';
      case 'over': return 'Done for today';
      default: return this.formatCountdown(this._target()!);
    }
  });

  readonly tooltip = computed(() => {
    const relevant = this._relevant();
    switch (this.state()) {
      case 'none': return 'No shard eruption today. Open Sky Shards for the full schedule.';
      case 'active': return `A ${this.shardName().toLowerCase()} shard is active until ${relevant!.end.toFormat('HH:mm')}. Open Sky Shards for the location.`;
      case 'upcoming': return `Next ${this.shardName().toLowerCase()} shard lands at ${relevant!.land.toFormat('HH:mm')}. Open Sky Shards for the location.`;
      case 'over': return 'Today\'s shards have all ended. Open Sky Shards for the full schedule.';
    }
  });

  ngOnInit(): void {
    this._interval = window.setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this._interval) { window.clearInterval(this._interval); }
  }

  private tick(): void {
    const now = DateTime.now().plus(_DEBUG_OFFSET);
    this._now.set(now);

    const day = now.setZone(DateHelper.skyTimeZone).toISODate();
    if (day !== this._infoDay) {
      this._infoDay = day;
      this._info.set(getShardInfo(now));
    }
  }

  private formatCountdown(target: DateTime): string {
    const duration = target.diff(this._now());
    const days = Math.floor(duration.as('days'));
    const time = duration.minus({ days }).toFormat('hh:mm:ss');
    return days > 0 ? `${days}d ${time}` : time;
  }
}
