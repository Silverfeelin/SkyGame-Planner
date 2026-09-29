import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ItemType } from 'skygame-data';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { QuickStartTab, QuickStartTile } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore } from '../quick-start.store';
import { NextTabComponent } from './next-tab.component';

interface TileEntry {
  tile: QuickStartTile;
  /** Index in the tab's tiles, which the store's tile actions take. */
  index: number;
  label: string;
}

interface TileGroup {
  label?: string;
  entries: Array<TileEntry>;
}

const STATE_LABEL: Record<QuickStartTile['state'], string> = {
  owned: 'owned',
  no: 'not owned',
  unsure: 'low confidence match',
  lock: 'already unlocked'
};

@Component({
  selector: 'app-quick-start-closet-confirm',
  templateUrl: './closet-confirm.component.html',
  styleUrl: './closet-confirm.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent, TooltipDirective, NextTabComponent]
})
export class ClosetConfirmComponent {
  readonly store = inject(QuickStartStore);

  readonly tab = input.required<QuickStartTab>();

  readonly state = computed(() => this.store.tab(this.tab().key)());
  readonly fresh = computed(() => this.store.status()[this.tab().key]?.fresh ?? 0);
  readonly lockCount = computed(() => this.state().tiles.filter(t => t.state === 'lock').length);
  readonly unsureCount = computed(() => this.state().tiles.filter(t => t.state === 'unsure').length);
  readonly missedShots = computed(() => this.state().result?.shots.filter(s => !s).length ?? 0);

  readonly groups = computed<Array<TileGroup>>(() => {
    const entries = this.state().tiles.map((tile, index) => {
      const status = tile.guess ? `probably ${STATE_LABEL[tile.state]}` : STATE_LABEL[tile.state];
      return { tile, index, label: `${tile.item.name}: ${status}` };
    });
    if (this.tab().kind !== 'stanceCall') { return [{ entries }]; }
    return [
      { label: 'Stances', entries: entries.filter(e => e.tile.item.type === ItemType.Stance) },
      { label: 'Calls', entries: entries.filter(e => e.tile.item.type === ItemType.Call) }
    ];
  });
}
