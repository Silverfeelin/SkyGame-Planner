import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IItem, ISeason, ISpirit } from 'skygame-data';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { EmoteEntry, EmoteSolution } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore } from '../quick-start.store';

interface EmoteMeta {
  group: string;
  /** Regular spirits first, then seasons in order, then everything else. */
  order: number;
  subtitle: string;
  /** Lowercase emote and spirit name. */
  search: string;
}

interface LevelChip {
  level: number;
  on: boolean;
  locked: boolean;
  open: boolean;
  title: string;
}

interface EmoteRow {
  index: number;
  key: string;
  item: IItem;
  name: string;
  subtitle: string;
  note: string;
  flagged: boolean;
  /** null when there's no dot count to show. */
  dots: Array<boolean> | null;
  unclear: boolean;
  dotsTitle: string;
  chips: Array<LevelChip>;
}

interface EmoteGroup {
  label: string;
  order: number;
  rows: Array<EmoteRow>;
}

const GROUP_REGULAR = 'Regular spirits';
const GROUP_OTHER = 'Other emotes';

@Component({
  selector: 'app-quick-start-emotes',
  templateUrl: './quick-start-emotes.component.html',
  styleUrl: './quick-start-emotes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent, TooltipDirective]
})
export class QuickStartEmotesComponent {
  readonly store = inject(QuickStartStore);

  readonly state = this.store.tab('Emote');
  readonly status = computed(() => this.store.status()['Emote']);

  private readonly _meta = new Map<string, EmoteMeta>();

  readonly groups = computed<Array<EmoteGroup>>(() => {
    const state = this.state();
    const solutions = this.store.emoteSolutions();
    const query = state.search.trim().toLowerCase();

    const groups = new Map<string, EmoteGroup>();
    state.emotes.forEach((entry, index) => {
      const solution = solutions[index];
      if (!solution || !entry.levels.length) { return; }
      const meta = this.meta(entry.levels[0]);
      if (query && !meta.search.includes(query)) { return; }

      let group = groups.get(meta.group);
      if (!group) {
        group = { label: meta.group, order: meta.order, rows: [] };
        groups.set(meta.group, group);
      }
      group.rows.push(this.row(entry, solution, index, meta));
    });

    return [...groups.values()].sort((a, b) => a.order - b.order);
  });

  onSearch(event: Event): void {
    this.store.setSearch('Emote', (event.target as HTMLInputElement).value);
  }

  toggle(row: EmoteRow, chip: LevelChip): void {
    if (chip.locked) { return; }
    this.store.toggleEmoteLevel(row.index, chip.level, !chip.on);
  }

  private row(entry: EmoteEntry, solution: EmoteSolution, index: number, meta: EmoteMeta): EmoteRow {
    const item = entry.levels[0];
    const max = entry.levels.length;
    const flagged = entry.unclear || !solution.resolved;

    let note = '';
    if (entry.unclear) {
      note = 'We couldn\'t count the dots. Pick your levels.';
    } else if (solution.conflict) {
      note = `More levels are needed than the ${entry.dots} dots we counted. Check your levels.`;
    } else if (!solution.resolved) {
      note = `Pick ${solution.need} more level${solution.need === 1 ? '' : 's'}.`;
      if (!solution.tiered && max >= 4) { note += ' Level 4 needs level 3.'; }
    }

    const chips = solution.levels.map<LevelChip>(l => {
      const locked = entry.locked.has(l.level);
      const why = l.why || (locked ? 'already unlocked' : !l.known ? 'might be one of the dots' : '');
      return {
        level: l.level,
        on: l.on,
        locked,
        open: !locked && !l.on && !l.known,
        title: `Level ${l.level}${why ? ': ' + why : ''}`
      };
    });

    const dots = entry.dots === null ? null : Array.from({ length: max }, (_, i) => i < entry.dots!);
    return {
      index,
      key: item.guid,
      item,
      name: item.name,
      subtitle: meta.subtitle,
      note,
      flagged,
      dots,
      unclear: entry.unclear,
      dotsTitle: entry.unclear ? 'The dots couldn\'t be read' : `${entry.dots} of ${max} levels`,
      chips
    };
  }

  /** Grouping and labels only depend on the game data, so they're computed once per emote. */
  private meta(item: IItem): EmoteMeta {
    let meta = this._meta.get(item.guid);
    if (meta) { return meta; }

    const spirit = this.spiritOf(item);
    const season: ISeason | undefined = item.season ?? spirit?.season;
    let group = GROUP_OTHER;
    let order = Number.MAX_SAFE_INTEGER;
    if (season) {
      group = season.name;
      order = season.number;
    } else if (spirit?.type === 'Regular' || spirit?.type === 'Elder') {
      group = GROUP_REGULAR;
      order = -1;
    }

    const subtitle = spirit?.name ?? (item.autoUnlocked ? 'Everyone has this' : '');
    meta = { group, order, subtitle, search: `${item.name}\n${spirit?.name ?? ''}`.toLowerCase() };
    this._meta.set(item.guid, meta);
    return meta;
  }

  private spiritOf(item: IItem): ISpirit | undefined {
    for (const node of item.nodes ?? []) {
      const tree = node.root?.tree ?? node.tree;
      const spirit = tree?.spirit ?? tree?.travelingSpirit?.spirit ?? tree?.specialVisitSpirit?.spirit ?? tree?.eventInstanceSpirit?.spirit;
      if (spirit) { return spirit; }
    }
    return undefined;
  }
}
