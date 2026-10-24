import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ItemType } from 'skygame-data';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { ClosetGroupBy, ClosetStateService } from './closet-state.service';
import { CLOSET_TYPE_ICONS, CLOSET_TYPES } from './closet-groups';

@Component({
  selector: 'app-closet-browse',
  templateUrl: './closet-browse.component.html',
  styleUrl: './closet-browse.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon, ItemTypePipe]
})
export class ClosetBrowseComponent {
  readonly state = inject(ClosetStateService);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly requesting = input(false);

  readonly viewOptions: Array<{ value: ClosetGroupBy; label: string }> = [
    { value: 'type', label: 'Closet' },
    { value: 'season', label: 'Season' },
    { value: 'event', label: 'Event' },
    { value: 'realm', label: 'Realm' }
  ];
  readonly types = CLOSET_TYPES;
  readonly typeIcons = CLOSET_TYPE_ICONS;

  readonly filtering = computed(() => this.state.view() !== 'type');

  /** Items per type that the grid shows, or that match the search while searching. */
  readonly counts = computed(() => {
    const state = this.state;
    const results = state.searchResults();
    const requesting = this.requesting();
    const counts: Record<string, number> = {};
    for (const type of this.types) {
      counts[type] = (state.items()[type] ?? []).filter(item => item.order !== -1
        && (!results || results[item.guid])
        && !state.isHiddenFromCloset(item, requesting)).length;
    }
    return counts;
  });

  setView(view: ClosetGroupBy): void {
    const state = this.state;
    if (view !== 'type' && state.groupBy() === view) {
      state.setAllGroupsOpen(!state.allGroupsOpen());
      return;
    }
    if (view === 'type') { state.activeType.set(undefined); }
    state.groupBy.set(view);
    state.persistPrefs();
  }

  pickType(type: ItemType): void {
    const state = this.state;
    if (this.filtering()) {
      state.activeType.update(t => t === type ? undefined : type);
      return;
    }

    if (state.typeFolded()[type]) {
      state.typeFolded.update(m => { const n = { ...m }; delete n[type]; return n; });
    }
    // Wait for an unfolded section to render before measuring it.
    requestAnimationFrame(() => this._jumpTo(type));
  }

  private _jumpTo(type: ItemType): void {
    const card = this._host.nativeElement.closest('.atmos-card') ?? document;
    const section = card.querySelector<HTMLElement>(`.atmos-closet-items[data-type="${type}"]`);
    if (!section) { return; }

    // Land below the sticky header, whose height depends on how its contents wrap.
    const header = this._host.nativeElement.closest<HTMLElement>('.header-sticky');
    if (header) {
      const stickyTop = parseFloat(getComputedStyle(header).top) || 0;
      section.style.scrollMarginTop = `${stickyTop + header.offsetHeight + 8}px`;
    }

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start', inline: 'nearest' });
  }
}
