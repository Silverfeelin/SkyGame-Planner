import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ICost, ITierNode } from 'skygame-data';
import { NodeComponent } from '@app/components/spirit/node/node.component';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { CostHelper } from '@app/helpers/cost-helper';
import { EventService } from '@app/services/event.service';

interface ILevelCost { icon: string; amount: number; label: string; }

/** Consecutive levels of an entry that unlock in the same tier at the same price. */
interface ILevelGroup {
  tier: number;
  from: number;
  to: number;
  cost?: ILevelCost;
}

/** An emote or feature, placed at the tier of its first level. */
interface IEntry {
  key: string;
  name: string;
  chain: ReadonlyArray<ITierNode>;
  tier: number;
  groups: ReadonlyArray<ILevelGroup>;
}

interface IPip { level: number; on: boolean; cost?: ILevelCost; tooltip: string; }
interface IPipGroup { group: ILevelGroup; pips: ReadonlyArray<IPip>; }

interface IEntryView {
  entry: IEntry;
  level: number;
  max: number;
  /** The current level's node, priced at the next level so the tile shows what's left to buy. */
  node: ITierNode;
  state: 'locked' | 'partial' | 'max';
  rail: ReadonlyArray<IPipGroup>;
}

interface IUpgradeHint { entry: IEntry; group: ILevelGroup; levels: string; done: boolean; }

interface ITierView {
  tier: number;
  /** Rows of up to three entries, top row first. */
  rows: ReadonlyArray<ReadonlyArray<IEntryView>>;
  hints: ReadonlyArray<IUpgradeHint>;
  owned: number;
  total: number;
}

/**
 * Friendship tiers with one tile per entry at its level 1 slot. In game, level nodes appear and
 * shift around as levels are unlocked; here an entry's levels are set from its pip rail instead,
 * and levels unlocking in a later tier show up there as hints.
 */
@Component({
  selector: 'app-friend-tiers',
  templateUrl: './friend-tiers.component.html',
  styleUrl: './friend-tiers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NodeComponent, CostComponent, MatIcon, TooltipDirective]
})
export class FriendTiersComponent {
  /** Every level node of one friend. Level 1 nodes are ordered per tier by slot. */
  readonly nodes = input.required<ReadonlyArray<ITierNode>>();

  readonly changed = output<void>();

  private readonly _eventService = inject(EventService);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Bumped after changing levels, since unlocks are tracked on the nodes themselves. */
  private readonly _refresh = signal(0);
  readonly flashedKey = signal<string | undefined>(undefined);
  private _flashTimeout?: number;

  private readonly _entries = computed<ReadonlyArray<IEntry>>(() => {
    const chains = new Map<string, Array<ITierNode>>();
    for (const node of this.nodes()) {
      const chain = chains.get(node.item!.name) ?? [];
      chain.push(node);
      chains.set(node.item!.name, chain);
    }

    return [...chains.values()].map(chain => {
      chain.sort((a, b) => (a.item!.level ?? 0) - (b.item!.level ?? 0));
      const groups: Array<ILevelGroup> = [];
      chain.forEach((node, i) => {
        const cost = this.getCost(node);
        const last = groups.at(-1);
        if (last && last.tier === node.tier && last.cost?.icon === cost?.icon && last.cost?.amount === cost?.amount) {
          last.to = i + 1;
        } else {
          groups.push({ tier: node.tier!, from: i + 1, to: i + 1, cost });
        }
      });
      return { key: chain[0].guid, name: chain[0].item!.name, chain, tier: chain[0].tier!, groups };
    });
  });

  readonly tiers = computed<ReadonlyArray<ITierView>>(() => {
    this._refresh();
    const entries = this._entries();
    const levels = new Map(entries.map(e => [e, this.getLevel(e)]));
    const tierNumbers = [...new Set(this.nodes().map(n => n.tier!))].sort((a, b) => b - a);

    return tierNumbers.map(tier => {
      const tierNodes = this.nodes().filter(n => n.tier === tier);
      return {
        tier,
        rows: this.toRows(entries.filter(e => e.tier === tier).map(e => this.createEntryView(e, levels.get(e)!))),
        hints: entries.flatMap(e => e.groups
          .filter(g => g.tier === tier && e.tier !== tier)
          .map(group => ({
            entry: e,
            group,
            levels: group.to > group.from ? `Lv${group.from}–${group.to}` : `Lv${group.from}`,
            done: levels.get(e)! >= group.to
          }))),
        owned: tierNodes.filter(n => n.unlocked).length,
        total: tierNodes.length
      };
    });
  });

  readonly totalCost = computed<ICost>(() => CostHelper.add(CostHelper.create(), ...this.nodes()));

  readonly remainingCost = computed<ICost>(() => {
    this._refresh();
    return CostHelper.add(CostHelper.create(), ...this.nodes().filter(n => !n.unlocked));
  });

  /** Clicking the highest unlocked pip lowers the level by one, so every level can be cleared. */
  pipClicked(view: IEntryView, level: number): void {
    this.setLevel(view.entry, view.level === level ? level - 1 : level);
  }

  tileClicked(view: IEntryView): void {
    this.setLevel(view.entry, view.level >= view.max ? 0 : view.level + 1);
  }

  hintClicked(hint: IUpgradeHint): void {
    const tile = this._elementRef.nativeElement.querySelector(`[data-entry="${hint.entry.key}"]`);
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    tile?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });

    clearTimeout(this._flashTimeout);
    this.flashedKey.set(hint.entry.key);
    this._flashTimeout = window.setTimeout(() => this.flashedKey.set(undefined), 1400);
  }

  private setLevel(entry: IEntry, level: number): void {
    entry.chain.forEach((node, i) => {
      const unlocked = i < level;
      if (!!node.unlocked === unlocked) { return; }
      node.unlocked = unlocked;
      node.item!.unlocked = unlocked;
      this._eventService.itemToggled.next(node.item!);
    });
    this._refresh.update(v => v + 1);
    this.changed.emit();
  }

  /** Slots fill rows from the bottom up, like the in-game tiers. */
  private toRows(views: ReadonlyArray<IEntryView>): Array<ReadonlyArray<IEntryView>> {
    const rows: Array<ReadonlyArray<IEntryView>> = [];
    for (let i = 0; i < views.length; i += 3) {
      rows.unshift(views.slice(i, i + 3));
    }
    return rows;
  }

  private getLevel(entry: IEntry): number {
    let level = 0;
    entry.chain.forEach((n, i) => { if (n.unlocked) { level = i + 1; } });
    return level;
  }

  private createEntryView(entry: IEntry, level: number): IEntryView {
    const max = entry.chain.length;
    const rail = max < 2 ? [] : entry.groups.map(group => {
      const pips: Array<IPip> = [];
      for (let l = group.from; l <= group.to; l++) {
        const cost = group.cost ? `${group.cost.amount} ${group.cost.label}` : 'Free';
        pips.push({ level: l, on: level >= l, cost: group.cost, tooltip: `Level ${l} · ${cost} · Tier ${group.tier}` });
      }
      return { group, pips };
    });

    const current = entry.chain[Math.max(level, 1) - 1];
    const priced = entry.chain[Math.min(level, max - 1)];
    return {
      entry, level, max, rail,
      node: { ...current, c: priced.c, ac: priced.ac, h: priced.h },
      state: level === 0 ? 'locked' : level >= max ? 'max' : 'partial'
    };
  }

  private getCost(node: ITierNode): ILevelCost | undefined {
    if (node.ac) { return { icon: 'ascended-candle', amount: node.ac, label: 'ascended candles' }; }
    if (node.h) { return { icon: 'heart', amount: node.h, label: 'hearts' }; }
    if (node.c) { return { icon: 'candle', amount: node.c, label: 'candles' }; }
    return undefined;
  }
}
