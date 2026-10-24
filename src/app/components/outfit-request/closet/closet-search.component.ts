import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import fuzzysort from 'fuzzysort';
import { IItem } from 'skygame-data';
import { ClosetStateService } from './closet-state.service';
import { getClosetItemInfo } from './closet-item-info';

interface ISearchEntry {
  item: IItem;
  name: string;
  spirit?: string;
  season?: string;
  event?: string;
  realm?: string;
}

const SEARCH_KEYS = ['name', 'spirit', 'season', 'event', 'realm'];
const MIN_QUERY_LENGTH = 2;
// Real matches score well above this; letters scattered across unrelated names score far below it.
const SEARCH_THRESHOLD = -1000;

/** Search field for the closet. The matches are shown by the grid, in its Results view. */
@Component({
  selector: 'app-closet-search',
  templateUrl: './closet-search.component.html',
  styleUrl: './closet-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon]
})
export class ClosetSearchComponent {
  readonly state = inject(ClosetStateService);

  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  readonly query = signal('');

  readonly hasQuery = computed(() => this.query().trim().length >= MIN_QUERY_LENGTH);

  private readonly _entries = computed<ISearchEntry[]>(() => this.state.allItems()
    .filter(item => item.order !== -1)
    .map(item => {
      const info = getClosetItemInfo(item);
      return {
        item, name: item.name,
        spirit: info.spirit?.name, season: info.season?.name, event: info.event?.name, realm: info.realm?.name
      };
    }));

  search(text: string): void {
    this.query.set(text);
    const state = this.state;
    if (!this.hasQuery()) {
      state.searchResults.set(undefined);
      return;
    }

    const matches = fuzzysort.go(text.trim(), this._entries(), { keys: SEARCH_KEYS, threshold: SEARCH_THRESHOLD });
    state.searchResults.set(matches.reduce((m, r) => (m[r.obj.item.guid] = r.obj.item, m), {} as Record<string, IItem>));
  }

  clear(): void {
    this.search('');
    this.input().nativeElement.focus();
  }

  onEscape(evt: Event): void {
    // Search inputs clear themselves on Escape; keep the query so the results stay.
    evt.preventDefault();
    this.input().nativeElement.blur();
  }
}
