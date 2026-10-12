import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { QuickStartTile } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore } from '../quick-start.store';
import { NextTabComponent } from './next-tab.component';

const KEY = 'Music';

interface SheetEntry {
  tile: QuickStartTile;
  index: number;
}

interface SheetGroup {
  label: string;
  order: number;
  entries: Array<SheetEntry>;
}

@Component({
  selector: 'app-quick-start-music-panel',
  templateUrl: './music-panel.component.html',
  styleUrl: './music-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, NextTabComponent]
})
export class MusicPanelComponent {
  readonly store = inject(QuickStartStore);
  readonly key = KEY;

  readonly state = computed(() => this.store.tab(KEY)());
  readonly selected = computed(() => this.store.status()[KEY]?.fresh ?? 0);

  /** Regular spirits first, then seasons in order, then events and shops. */
  readonly groups = computed<Array<SheetGroup>>(() => {
    const query = this.state().search.trim().toLowerCase();
    const seasonOrder = new Map(this.store.seasons.map((s, i) => [s.guid, i]));
    const groups = new Map<string, SheetGroup>();
    this.state().tiles.forEach((tile, index) => {
      if (query && !tile.item.name.toLowerCase().includes(query)) { return; }
      const { key, label, order } = this.groupOf(tile.item, seasonOrder);
      let group = groups.get(key);
      if (!group) { group = { label, order, entries: [] }; groups.set(key, group); }
      group.entries.push({ tile, index });
    });
    return [...groups.values()].sort((a, b) => a.order - b.order);
  });

  onSearch(event: Event): void {
    this.store.setSearch(KEY, (event.target as HTMLInputElement).value);
  }

  private groupOf(item: IItem, seasonOrder: Map<string, number>): { key: string, label: string, order: number } {
    const spiritType = item.nodes?.[0]?.root?.tree?.spirit?.type;
    if (spiritType === 'Regular' || spiritType === 'Elder') { return { key: 'regular', label: 'Regular spirits', order: -1 }; }
    if (item.season) {
      return { key: item.season.guid, label: item.season.name, order: seasonOrder.get(item.season.guid) ?? item.season.number };
    }
    return { key: 'other', label: 'Events and shops', order: Number.MAX_SAFE_INTEGER };
  }
}
