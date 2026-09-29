import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { IItem, ISeason, ISpirit, ItemType } from 'skygame-data';
import { FoldableCardComponent } from '@app/components/shared/foldable-card/foldable-card.component';
import { Attribution, IapChoice, IapQuestion, SeasonState, SeasonSummary, SourceOption, WingBuffQuestion } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore } from '../quick-start.store';
import { QuickStartStepNavComponent } from '../step-nav/quick-start-step-nav.component';

interface SeasonRow {
  guid: string;
  name: string;
  state: SeasonState;
  detail: string;
  spirits: Array<SpiritRow>;
  /** Spirits with an item that doesn't fit. */
  warn: number;
}

interface SpiritRow {
  guid: string;
  name: string;
  detail: string;
  warning?: string;
  options: Array<{ key: string, label: string }>;
  /** Empty when the items came from different visits. */
  selected: string;
  wingBuff?: WingBuffRow;
}

interface IapRow {
  guid: string;
  name: string;
  detail: string;
  removeLabel: string;
  choice?: IapChoice;
}

interface WingBuffRow {
  guid: string;
  name: string;
  detail: string;
  on: boolean;
}

const SEASON_STATES: ReadonlyArray<{ state: SeasonState, label: string }> = [
  { state: 'none', label: 'Not played' },
  { state: 'played', label: 'Played' },
  { state: 'pass', label: 'Season pass' }
];

@Component({
  selector: 'app-quick-start-review',
  templateUrl: './quick-start-review.component.html',
  styleUrl: './quick-start-review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, RouterLink, FoldableCardComponent, QuickStartStepNavComponent]
})
export class QuickStartReviewComponent {
  readonly store = inject(QuickStartStore);

  readonly seasonStates = SEASON_STATES;

  readonly plan = this.store.plan;
  readonly empty = computed(() => this.store.ownedNew().length === 0);

  readonly conflict = computed(() => this.plan().conflict);

  readonly wingBuffs = computed<Array<WingBuffRow>>(() => {
    const on = this.store.wingBuffs();
    return this.plan().wingBuffQuestions.map(q => ({
      guid: q.spirit.guid,
      name: q.spirit.name,
      detail: this.wingBuffDetail(q),
      on: on.has(q.spirit.guid)
    }));
  });

  readonly iapQuestions = computed<Array<IapRow>>(() => this.plan().iapQuestions.map(q => this.iapRow(q)));
  readonly iapOpen = computed(() => this.iapQuestions().filter(q => !q.choice).length);
  readonly canSave = computed(() => !this.empty() && !this.iapOpen());

  readonly seasons = computed<Array<SeasonRow>>(() => {
    const plan = this.plan();
    const wingBuffs = new Map(this.wingBuffs().map(w => [w.guid, w]));
    const bySeason = new Map<ISeason, Map<ISpirit, Array<Attribution>>>();
    for (const a of plan.attributions) {
      if (!a.season || !a.spirit) { continue; }
      const spirits = bySeason.get(a.season) ?? new Map<ISpirit, Array<Attribution>>();
      bySeason.set(a.season, spirits);
      spirits.set(a.spirit, [...(spirits.get(a.spirit) ?? []), a]);
    }
    return plan.seasons.map(s => {
      const order = s.season.spirits ?? [];
      const spirits = [...(bySeason.get(s.season) ?? [])]
        .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
        .map(([spirit, list]) => this.spiritRow(spirit, list, wingBuffs.get(spirit.guid)));
      const later = spirits.length ? [...bySeason.get(s.season)!.values()].flat().filter(a => a.source.key !== 'season').length : 0;
      return {
        guid: s.season.guid,
        name: s.season.name,
        state: s.state,
        detail: this.seasonDetail(s, later),
        spirits,
        warn: spirits.filter(x => x.warning).length
      };
    });
  });
  readonly seasonCounts = computed(() => {
    const seasons = this.seasons();
    return {
      played: seasons.filter(s => s.state !== 'none').length,
      pass: seasons.filter(s => s.state === 'pass').length,
      warn: seasons.reduce((n, s) => n + s.warn, 0)
    };
  });

  readonly onTheWay = computed(() => {
    const list = this.plan().onTheWay;
    return {
      nodes: list.reduce((n, o) => n + o.nodes.length, 0),
      spirits: new Set(list.map(o => o.spirit ?? o.tree)).size
    };
  });

  goToStep(step: number): void {
    this.store.step.set(step);
  }

  keepStart(): void {
    this.store.conflictHandled.set(true);
  }

  setSeasonState(row: SeasonRow, state: SeasonState): void {
    this.store.setSeasonState(row.guid, state);
  }

  onSourceChange(row: SpiritRow, event: Event): void {
    this.store.setSpiritSource(row.guid, (event.target as HTMLSelectElement).value);
  }

  setIapChoice(row: IapRow, choice: IapChoice): void {
    this.store.setIapChoice([row.guid], choice);
  }

  unlockAllIaps(): void {
    this.store.setIapChoice(this.iapQuestions().filter(q => !q.choice).map(q => q.guid), 'unlock');
  }

  toggleWingBuff(row: WingBuffRow): void {
    this.store.setWingBuff(row.guid, !row.on);
  }

  save(): void {
    if (!this.canSave()) { return; }
    this.store.save();
  }

  itemName(item: IItem): string {
    return item.type === ItemType.Emote ? `${item.name} (level ${item.level ?? 1})` : item.name;
  }

  plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? '' : 's'}`;
  }

  private seasonDetail(s: SeasonSummary, later: number): string {
    return [
      s.pendant ? 'Pendant found' : '',
      s.items ? `${this.plural(s.items, 'item')} from the season` : '',
      later ? `${this.plural(later, 'item')} from later visits` : '',
      s.ultimates ? this.plural(s.ultimates, 'ultimate gift') : ''
    ].filter(Boolean).join(' · ');
  }

  private spiritRow(spirit: ISpirit, list: Array<Attribution>, wingBuff?: WingBuffRow): SpiritRow {
    const options = new Map<string, SourceOption>();
    list.forEach(a => a.options.forEach(o => { if (!options.has(o.key)) { options.set(o.key, o); } }));
    const sources = new Map<string, Array<string>>();
    list.forEach(a => sources.set(a.source.label, [...(sources.get(a.source.label) ?? []), this.itemName(a.item)]));
    const keys = new Set(list.map(a => a.source.key));
    const warn = list.find(a => a.warn);
    return {
      guid: spirit.guid,
      name: spirit.name,
      detail: sources.size === 1
        ? [...sources.values()][0].join(', ')
        : [...sources].map(([label, names]) => `${names.join(', ')} (${label})`).join(' · '),
      warning: warn ? `${this.itemName(warn.item)}: ${warn.reason}` : undefined,
      options: [...options.values()]
        .sort((a, b) => (a.date?.toMillis() ?? 0) - (b.date?.toMillis() ?? 0))
        .map(o => ({ key: o.key, label: o.label })),
      selected: this.store.spiritSource().get(spirit.guid) ?? (keys.size === 1 ? list[0].source.key : ''),
      wingBuff
    };
  }

  private iapRow(q: IapQuestion): IapRow {
    const names = (items: Array<IItem>) => items.map(i => this.itemName(i)).join(', ');
    const when = [q.where, this.month(q.date)].filter(Boolean).join(', ');
    return {
      guid: q.iap.guid,
      name: q.iap.name ?? names(q.iap.items ?? []),
      detail: `You have ${names(q.owned)}. You should also have ${names(q.missing)}.${when ? ` From ${when}.` : ''}`,
      removeLabel: q.owned.length === 1 ? `Leave out ${this.itemName(q.owned[0])}` : `Leave out ${q.owned.length} items`,
      choice: q.choice
    };
  }

  private wingBuffDetail(q: WingBuffQuestion): string {
    if (q.onVisit) {
      const when = this.month(q.onVisit.date);
      return `You got the ${q.item.name} when ${q.spirit.name} visited${when ? ' in ' + when : ''}. That visit had a wing buff.`;
    }
    const first = this.month(q.later[0]?.date);
    const times = q.later.length === 1 ? 'once' : `${q.later.length} times`;
    return `${q.spirit.name} returned ${times} after the season${first ? ` (first in ${first})` : ''} with a wing buff.`;
  }

  private month(date?: DateTime): string {
    return date ? date.toFormat('LLLL yyyy') : '';
  }
}
