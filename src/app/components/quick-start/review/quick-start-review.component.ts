import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { IItem, ItemType } from 'skygame-data';
import { Attribution, OnTheWay, SeasonSummary, WingBuffQuestion } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore } from '../quick-start.store';
import { QuickStartStepNavComponent } from '../step-nav/quick-start-step-nav.component';

interface SeasonRow {
  guid: string;
  name: string;
  pass: boolean;
  detail: string;
}

interface WingBuffRow {
  guid: string;
  name: string;
  detail: string;
  on: boolean;
}

interface OnTheWayRow {
  key: string;
  name: string;
  count: number;
  detail: string;
}

const WING_BUFFS_SHOWN = 6;
const ON_THE_WAY_SHOWN = 5;

@Component({
  selector: 'app-quick-start-review',
  templateUrl: './quick-start-review.component.html',
  styleUrl: './quick-start-review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, NgTemplateOutlet, RouterLink, QuickStartStepNavComponent]
})
export class QuickStartReviewComponent {
  readonly store = inject(QuickStartStore);

  readonly wingBuffsShown = WING_BUFFS_SHOWN;
  readonly onTheWayShown = ON_THE_WAY_SHOWN;

  readonly plan = this.store.plan;
  readonly empty = computed(() => this.store.ownedNew().length === 0 && this.store.wingedLightRealms().size === 0);

  /** Hidden once the player chose to keep their start, even before the engine reruns. */
  readonly conflict = computed(() => this.store.conflictHandled() ? undefined : this.plan().conflict);

  readonly seasons = computed<Array<SeasonRow>>(() => [...this.plan().seasons]
    .sort((a, b) => a.season.date.toMillis() - b.season.date.toMillis())
    .map(s => ({ guid: s.season.guid, name: s.season.name, pass: s.pass, detail: this.seasonDetail(s) })));

  readonly attributions = computed<Array<Attribution>>(() =>
    this.plan().attributions.filter(a => a.source.kind !== 'season' || a.warn));

  readonly wingBuffs = computed<Array<WingBuffRow>>(() => {
    const on = this.store.wingBuffs();
    return this.plan().wingBuffQuestions.map(q => ({
      guid: q.spirit.guid,
      name: q.spirit.name,
      detail: this.wingBuffDetail(q),
      on: on.has(q.spirit.guid)
    }));
  });
  readonly allWingBuffsOn = computed(() => this.wingBuffs().every(q => q.on));

  readonly onTheWay = computed<Array<OnTheWayRow>>(() => this.plan().onTheWay.map(o => this.onTheWayRow(o)));

  goToStep(step: number): void {
    this.store.step.set(step);
  }

  keepStart(): void {
    this.store.conflictHandled.set(true);
  }

  onSourceChange(attribution: Attribution, event: Event): void {
    this.store.setSource(attribution.item.guid, (event.target as HTMLSelectElement).value);
  }

  toggleWingBuff(row: WingBuffRow): void {
    this.store.setWingBuff(row.guid, !row.on);
  }

  toggleAllWingBuffs(): void {
    const on = !this.allWingBuffsOn();
    this.wingBuffs().forEach(q => this.store.setWingBuff(q.guid, on));
  }

  save(): void {
    if (this.empty()) { return; }
    this.store.save();
  }

  itemName(item: IItem): string {
    return item.type === ItemType.Emote ? `${item.name} (level ${item.level ?? 1})` : item.name;
  }

  plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? '' : 's'}`;
  }

  private seasonDetail(s: SeasonSummary): string {
    return [
      s.pass ? 'Pendant found' : '',
      s.items ? `${this.plural(s.items, 'item')} from the season` : '',
      s.ultimates ? this.plural(s.ultimates, 'ultimate gift') : ''
    ].filter(Boolean).join(' · ');
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

  private onTheWayRow(o: OnTheWay): OnTheWayRow {
    const name = o.spirit?.name ?? o.tree.name ?? 'Spirit tree';
    return {
      key: `${o.tree.guid}:${o.before.guid}`,
      name,
      count: o.nodes.length,
      detail: `${this.plural(o.nodes.length, 'node')} before ${o.before.name}`
    };
  }

  private month(date?: DateTime): string {
    return date ? date.toFormat('LLLL yyyy') : '';
  }
}
