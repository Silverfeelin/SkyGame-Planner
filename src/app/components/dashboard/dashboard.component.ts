import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { CostHelper } from '@app/helpers/cost-helper';
import { DailyHelper } from '@app/helpers/daily-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { SubscriptionBag } from '@app/helpers/subscription-bag';
import { TreeHelper } from '@app/helpers/tree-helper';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { DailyCheckinService } from '@app/services/daily-checkin.service';
import { EventCheckinService } from '@app/services/event-checkin.service';
import { IEventInstance, IRealm, ISeason, ISpecialVisit, ISpiritTree, ITravelingSpirit } from 'skygame-data';
import { ShardIndicatorComponent } from '@app/components/shared/shared-widgets';
import { ClockComponent } from './clock.component';
import { DashboardFavouritesComponent } from './favourites-card.component';
import { SearchBarComponent } from './search-bar.component';
import {
  FeatureCardComponent,
  IFeatureCurrency,
  IFeatureLink
} from './feature-card.component';

const DISCORD_DAILY_QUEST_LINK: IFeatureLink = {
  imgSrc: '/assets/external/discord-mark-white.svg',
  label: 'Daily quests (Sky:CoTL Infographics)',
  href: 'https://discord.com/channels/736912435654688868/801778605486374943',
  hrefDesktop: 'discord://-/channels/736912435654688868/801778605486374943'
};

const THATSKY_DAILY_QUEST_LINK: IFeatureLink = {
  icon: 'language',
  label: 'Daily quests (thatskyapplication)',
  href: 'https://thatskyapplication.com/daily-guides'
};

interface IEventCard {
  instance: IEventInstance;
  kicker: string;
  title: string;
  bannerUrl?: string;
  bannerHue: number;
  timeRow: string;
  links: ReadonlyArray<IFeatureLink>;
  currency: ReadonlyArray<IFeatureCurrency>;
  showCheckin: boolean;
  checked: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClockComponent, ShardIndicatorComponent, SearchBarComponent, DashboardFavouritesComponent, FeatureCardComponent, RouterLink]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly _dataService = inject(DataService);
  private readonly _eventService = inject(EventService);
  private readonly _dailyCheckinService = inject(DailyCheckinService);
  private readonly _eventCheckinService = inject(EventCheckinService);

  readonly season = signal<ISeason | undefined>(undefined);
  readonly ts = signal<ITravelingSpirit | undefined>(undefined);
  readonly tsIsFuture = signal(true);
  readonly rs = signal<ISpecialVisit | undefined>(undefined);
  readonly rsIsFuture = signal(false);
  readonly eventCards = signal<ReadonlyArray<IEventCard>>([]);
  readonly checkedIn = signal(false);
  readonly dailyRealm = signal<IRealm | undefined>(undefined);

  /** Only what is obtainable today; the upcoming-event card and future TS/RS are excluded. */
  readonly activeEventInstances = computed<ReadonlyArray<IEventInstance>>(() =>
    this.eventCards().filter(c => c.showCheckin).map(c => c.instance));
  readonly activeTs = computed(() => this.tsIsFuture() ? undefined : this.ts());
  readonly activeRs = computed(() => this.rsIsFuture() ? undefined : this.rs());

  readonly dailyLinks = computed<ReadonlyArray<IFeatureLink>>(() => {
    const links: Array<IFeatureLink> = [
      { icon: 'list_alt', label: 'Daily tracker', link: '/daily' }
    ];
    const realm = this.dailyRealm();
    if (realm) { links.push({ icon: 'landscape', label: realm.name, link: `/realm/${realm.guid}` }); }
    links.push(DISCORD_DAILY_QUEST_LINK);
    links.push(THATSKY_DAILY_QUEST_LINK);
    return links;
  });

  readonly seasonKicker = computed(() => {
    const s = this.season();
    return s ? `Season · #${s.number}` : '';
  });

  readonly seasonTimeRow = computed(() => this.formatPeriod(this.season()));
  readonly seasonCurrency = computed<ReadonlyArray<IFeatureCurrency>>(() => {
    const s = this.season();
    if (!s) { return []; }
    return this.deriveSeasonCurrency(s);
  });

  readonly seasonLinks = computed<ReadonlyArray<IFeatureLink>>(() => {
    const s = this.season();
    if (!s) { return []; }
    return [
      { icon: 'dashboard',  label: 'Overview',   link: `/season/${s.guid}` },
      { icon: 'calculate', label: 'Calculator', link: '/season/calculator' },
      DISCORD_DAILY_QUEST_LINK,
      THATSKY_DAILY_QUEST_LINK
    ];
  });

  readonly tsKicker = computed(() => {
    const t = this.ts();
    return t ? `Traveling spirit · #${t.number}` : '';
  });

  readonly tsTitle = computed(() => this.tsIsFuture() ? 'Traveling Spirit' : (this.ts()?.spirit?.name ?? ''));
  readonly tsTimeRow = computed(() => this.formatPeriod(this.ts()));
  readonly tsBannerUrl = computed(() => this.ts()?.spirit?.imageUrl);
  readonly tsCurrency = computed<ReadonlyArray<IFeatureCurrency>>(() => {
    const t = this.ts();
    if (!t) { return []; }
    return this.deriveTreeCurrency(t.tree);
  });

  readonly tsLinks = computed<ReadonlyArray<IFeatureLink>>(() => {
    const t = this.ts();
    if (!t) { return []; }
    return [
      { icon: 'dashboard',  label: 'Overview', link: `/spirit/${t.spirit.guid}` }
    ];
  });

  readonly rsKicker = computed(() => this.rs() ? 'Special visit' : '');
  readonly rsTitle = computed(() => {
    const r = this.rs();
    if (!r) { return ''; }
    return r.name || r.spirits.map(s => s.spirit?.name).filter(Boolean).join(', ') || 'Special Visit';
  });
  readonly rsTimeRow = computed(() => this.formatPeriod(this.rs()));
  readonly rsBannerUrl = signal<string | undefined>(undefined);
  readonly rsBannerContain = computed(() => !this.rs()?.imageUrl);
  readonly rsLinks = computed<ReadonlyArray<IFeatureLink>>(() => {
    const r = this.rs();
    if (!r) { return []; }
    return [
      { icon: 'dashboard', label: 'Overview', link: `/rs/${r.guid}` }
    ];
  });
  readonly rsCurrency = computed<ReadonlyArray<IFeatureCurrency>>(() => {
    const r = this.rs();
    if (!r) { return []; }
    const nodes = r.spirits.flatMap(sp => TreeHelper.getNodes(sp.tree));
    const total = CostHelper.add(CostHelper.create(), ...nodes);
    const lockedNodes = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    const remaining = CostHelper.add(CostHelper.create(), ...lockedNodes);
    const out: IFeatureCurrency[] = [];
    this.pushIfPositive(out, 'candle',   total.c,  remaining.c);
    this.pushIfPositive(out, 'heart',    total.h,  remaining.h);
    this.pushIfPositive(out, 'ascended', total.ac, remaining.ac);
    return out;
  });

  private readonly _subs = new SubscriptionBag();

  constructor() {
    this._subs.add(this._eventService.storageChanged
      .pipe(filter(e => e.key?.startsWith(EventCheckinService.keyPrefix) === true))
      .subscribe(() => this.refreshEventCheckins()));

    this._subs.add(this._eventService.storageChanged
      .pipe(filter(e => e.key === DailyCheckinService.key))
      .subscribe(() => this.checkedIn.set(this._dailyCheckinService.isCheckedIn())));

    effect(() => {
      const r = this.rs();
      if (!r) { this.rsBannerUrl.set(undefined); return; }
      if (r.imageUrl) { this.rsBannerUrl.set(r.imageUrl); return; }

      const urls = r.spirits.map(sp => sp.spirit?.imageUrl).filter((u): u is string => !!u);
      if (urls.length <= 1) { this.rsBannerUrl.set(urls[0]); return; }

      this.rsBannerUrl.set(undefined);
      this.mergeImagesSideBySide(urls).then(url => this.rsBannerUrl.set(url));
    });
  }

  ngOnInit(): void {
    const seasonDates = DateHelper.groupByPeriod(this._dataService.seasonConfig.items);
    this.season.set(seasonDates.active?.at(-1));
    this.checkedIn.set(this._dailyCheckinService.isCheckedIn());
    this.dailyRealm.set(DailyHelper.getDailyRealm(this._dataService.guidMap));

    const tsDates = DateHelper.groupByPeriod(this._dataService.travelingSpiritConfig.items);
    const activeTs = tsDates.active?.at(-1);
    const futureTs = !activeTs ? tsDates.future?.at(0) : undefined;
    this.ts.set(activeTs ?? futureTs);
    this.tsIsFuture.set(!activeTs && !!futureTs);

    const rsDates = DateHelper.groupByPeriod(this._dataService.returningSpiritsConfig.items);
    const activeRs = rsDates.active?.at(-1);
    const futureRs = !activeRs ? rsDates.future?.at(0) : undefined;
    this.rs.set(activeRs ?? futureRs);
    this.rsIsFuture.set(!activeRs && !!futureRs);

    this.eventCards.set(this.buildEventCards());
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  onDailyCheckinToggle(evt: MouseEvent): void {
    this.checkedIn.set(this._dailyCheckinService.toggle(evt));
  }

  onSeasonCheckinToggle(season: ISeason, evt: MouseEvent): void {
    this.checkedIn.set(this._dailyCheckinService.toggle(evt, season));
  }

  onEventCheckinToggle(card: IEventCard, evt: MouseEvent): void {
    this._eventCheckinService.toggle(evt, card.instance);
    this.refreshEventCheckins();
  }

  private buildEventCards(): ReadonlyArray<IEventCard> {
    const active: Array<IEventInstance> = [];
    const futureWithin21: Array<IEventInstance> = [];

    for (const ev of this._dataService.eventConfig.items) {
      if (!ev.instances) { continue; }
      const periods = DateHelper.groupByPeriod(ev.instances);
      if (periods.active.length) {
        active.push(periods.active.at(-1)!);
      } else if (periods.future.length) {
        const next = periods.future.at(0)!;
        if (next.date.diffNow('days').days <= 21) { futureWithin21.push(next); }
      }
    }
    futureWithin21.sort((a, b) => a.date.diff(b.date).as('milliseconds'));
    const futureInstance = futureWithin21.at(0);

    const cards: Array<IEventCard> = [];
    active.forEach(i => cards.push(this.toEventCard(i, true)));
    if (futureInstance) { cards.push(this.toEventCard(futureInstance, false)); }
    return cards;
  }

  private toEventCard(instance: IEventInstance, isActive: boolean): IEventCard {
    const event = instance.event;
    const links: Array<IFeatureLink> = [
      { icon: 'dashboard', label: 'Overview', link: `/event-instance/${instance.guid}` },
      { icon: 'list',      label: 'List',     link: `/event/${event.guid}` }
    ];
    if (isActive && instance.calculatorData) {
      links.push({ icon: 'calculate', label: 'Calculator', link: '/event/calculator', queryParams: { guid: instance.guid } });
    }
    if (isActive) {
      links.push(DISCORD_DAILY_QUEST_LINK);
      links.push(THATSKY_DAILY_QUEST_LINK);
    }

    return {
      instance,
      kicker: 'Event',
      title: instance.name ?? event.name,
      bannerUrl: event.imageUrl,
      bannerHue: 280,
      timeRow: this.formatPeriod(instance),
      links,
      currency: this.deriveEventCurrency(instance),
      showCheckin: isActive,
      checked: isActive && this._eventCheckinService.isCheckedIn(event.guid)
    };
  }

  private refreshEventCheckins(): void {
    const updated = this.eventCards().map(c => c.showCheckin
      ? { ...c, checked: this._eventCheckinService.isCheckedIn(c.instance.event.guid) }
      : c);
    this.eventCards.set(updated);
  }

  private formatPeriod(p: { date?: any; endDate?: any } | undefined): string {
    if (!p?.date || !p?.endDate) { return ''; }
    const start = p.date.toFormat('dd LLL');
    const end = p.endDate.toFormat('dd LLL');
    const days = Math.max(0, Math.ceil(p.endDate.diffNow('days').days));
    return `${start} → ${end} · ${days} day${days === 1 ? '' : 's'} remaining`;
  }

  private async mergeImagesSideBySide(urls: ReadonlyArray<string>): Promise<string | undefined> {
    const images = (await Promise.all(urls.map(url => this.loadImage(url))))
      .filter((img): img is HTMLImageElement => !!img);
    if (!images.length) { return undefined; }

    const height = Math.max(...images.map(img => img.naturalHeight || img.height));
    const scaled = images.map(img => {
      const imgHeight = img.naturalHeight || img.height || height;
      const imgWidth = img.naturalWidth || img.width || imgHeight;
      return { img, width: imgWidth * (height / imgHeight) };
    });
    const totalWidth = scaled.reduce((sum, s) => sum + s.width, 0);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(totalWidth);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext('2d');
    if (!ctx) { return undefined; }

    let x = 0;
    for (const { img, width } of scaled) {
      ctx.drawImage(img, x, 0, width, height);
      x += width;
    }
    return canvas.toDataURL('image/png');
  }

  private loadImage(url: string): Promise<HTMLImageElement | undefined> {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(undefined);
      img.src = url;
    });
  }

  private deriveSeasonCurrency(s: ISeason): ReadonlyArray<IFeatureCurrency> {
    const nodes = (s.spirits ?? []).flatMap(sp => TreeHelper.getNodes(sp.tree));
    const total = CostHelper.add(CostHelper.create(), ...nodes);
    const lockedNodes = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    const remaining = CostHelper.add(CostHelper.create(), ...lockedNodes);

    const out: IFeatureCurrency[] = [];
    this.pushIfPositive(out, 'candle', total.c, remaining.c);
    this.pushIfPositive(out, 'season', total.sc, remaining.sc);
    this.pushIfPositive(out, 'heart',  total.h,  remaining.h);
    return out;
  }

  private deriveTreeCurrency(tree: ISpiritTree | undefined): ReadonlyArray<IFeatureCurrency> {
    if (!tree) { return []; }
    const nodes = TreeHelper.getNodes(tree);
    const total = CostHelper.add(CostHelper.create(), ...nodes);
    const lockedNodes = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    const remaining = CostHelper.add(CostHelper.create(), ...lockedNodes);

    const out: IFeatureCurrency[] = [];
    this.pushIfPositive(out, 'candle',   total.c,  remaining.c);
    this.pushIfPositive(out, 'heart',    total.h,  remaining.h);
    this.pushIfPositive(out, 'ascended', total.ac, remaining.ac);
    return out;
  }

  private deriveEventCurrency(instance: IEventInstance): ReadonlyArray<IFeatureCurrency> {
    const nodes = (instance.spirits ?? []).flatMap(sp => TreeHelper.getNodes(sp.tree));
    const total = CostHelper.add(CostHelper.create(), ...nodes);
    const lockedNodes = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    const remaining = CostHelper.add(CostHelper.create(), ...lockedNodes);

    instance.shops?.filter(s => s.itemList?.items?.length).forEach(s => {
      CostHelper.add(total, ...s.itemList!.items);
      const locked = s.itemList!.items.filter(i => i.item && !i.item.unlocked);
      CostHelper.add(remaining, ...locked);
    });

    const out: IFeatureCurrency[] = [];
    this.pushIfPositive(out, 'candle',   total.c,  remaining.c);
    this.pushIfPositive(out, 'heart',    total.h,  remaining.h);
    this.pushIfPositive(out, 'ticket',   total.ec, remaining.ec);
    this.pushIfPositive(out, 'ascended', total.ac, remaining.ac);
    return out;
  }

  private pushIfPositive(
    out: IFeatureCurrency[],
    kind: IFeatureCurrency['kind'],
    total?: number,
    remaining?: number
  ): void {
    const t = total ?? 0;
    if (t <= 0) { return; }
    const owned = Math.max(0, t - (remaining ?? 0));
    out.push({ kind, owned, total: t });
  }
}
