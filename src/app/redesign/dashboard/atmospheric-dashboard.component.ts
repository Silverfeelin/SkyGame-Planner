import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DateTime } from 'luxon';
import { filter } from 'rxjs';
import { CostHelper } from '@app/helpers/cost-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { SubscriptionBag } from '@app/helpers/subscription-bag';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CurrencyService } from '@app/services/currency.service';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { IEventInstance, ISeason, ISpecialVisit, ISpiritTree, ITravelingSpirit } from 'skygame-data';
import { AtmosClockComponent } from './atmos-clock.component';
import { AtmosSearchBarComponent } from './atmos-search-bar.component';
import {
  AtmosFeatureCardComponent,
  IFeatureCurrency,
  IFeatureLink
} from './atmos-feature-card.component';

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
  selector: 'app-atmospheric-dashboard',
  templateUrl: './atmospheric-dashboard.component.html',
  styleUrl: './atmospheric-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmosClockComponent, AtmosSearchBarComponent, AtmosFeatureCardComponent, RouterLink]
})
export class AtmosphericDashboardComponent implements OnInit, OnDestroy {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _eventService = inject(EventService);

  readonly season = signal<ISeason | undefined>(undefined);
  readonly ts = signal<ITravelingSpirit | undefined>(undefined);
  readonly tsIsFuture = signal(true);
  readonly rs = signal<ISpecialVisit | undefined>(undefined);
  readonly rsIsFuture = signal(false);
  readonly favouriteCount = signal(0);
  readonly eventCards = signal<ReadonlyArray<IEventCard>>([]);

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
      { icon: 'calculate', label: 'Calculator', link: '/season-calculator' },
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
  readonly rsBannerUrl = computed(() => {
    const r = this.rs();
    if (!r) { return undefined; }
    return r.imageUrl || r.spirits.find(s => s.spirit?.imageUrl)?.spirit?.imageUrl;
  });
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
      .pipe(filter(e => e.key?.startsWith('event.checkin.') == true))
      .subscribe(() => this.refreshEventCheckins()));
  }

  ngOnInit(): void {
    const seasonDates = DateHelper.groupByPeriod(this._dataService.seasonConfig.items);
    this.season.set(seasonDates.active?.at(-1));

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

    this.favouriteCount.set(this._storageService.getFavourites().size);

    this.eventCards.set(this.buildEventCards());
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  onEventCheckinToggle(card: IEventCard, evt: MouseEvent): void {
    const event = card.instance.event;
    const now = !card.checked;
    if (now) {
      localStorage.setItem(`event.checkin.${event.guid}`, DateTime.local({ zone: DateHelper.skyTimeZone }).toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(`event.checkin.${event.guid}`);
    }

    let dailyCurrency = card.instance.calculatorData?.dailyCurrencyAmount || 0;
    if (dailyCurrency) {
      if (!now) { dailyCurrency = -dailyCurrency; }
      this._currencyService.addEventCurrency(card.instance.guid, dailyCurrency);
      this._currencyService.animateCurrencyGained(evt, dailyCurrency);
    }

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
      links.push({ icon: 'calculate', label: 'Calculator', link: '/event-calculator', queryParams: { guid: instance.guid } });
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
      checked: isActive && this.isCheckedInToday(event.guid)
    };
  }

  private refreshEventCheckins(): void {
    const updated = this.eventCards().map(c => c.showCheckin
      ? { ...c, checked: this.isCheckedInToday(c.instance.event.guid) }
      : c);
    this.eventCards.set(updated);
  }

  private isCheckedInToday(eventGuid: string): boolean {
    const checkinDate = localStorage.getItem(`event.checkin.${eventGuid}`);
    if (!checkinDate) { return false; }
    const d = DateTime.fromFormat(checkinDate, 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
    return d.hasSame(DateTime.now().setZone(DateHelper.skyTimeZone), 'day');
  }

  private formatPeriod(p: { date?: any; endDate?: any } | undefined): string {
    if (!p?.date || !p?.endDate) { return ''; }
    const start = p.date.toFormat('dd LLL');
    const end = p.endDate.toFormat('dd LLL');
    const days = Math.max(0, Math.ceil(p.endDate.diffNow('days').days));
    return `${start} → ${end} · ${days} day${days === 1 ? '' : 's'} remaining`;
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
