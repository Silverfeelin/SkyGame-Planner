import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { QuickStartTab } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore } from '../quick-start.store';

/** "Next: <tab>" button pointing at the first unfinished tab after the active one. */
@Component({
  selector: 'app-quick-start-next-tab',
  template: `
    @if (next(); as tab) {
      <button type="button" class="atmos-btn atmos-btn--sm" (click)="open(tab)">
        Next: {{ tab.label }}<mat-icon>arrow_forward</mat-icon>
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class NextTabComponent {
  readonly store = inject(QuickStartStore);

  readonly next = computed<QuickStartTab | undefined>(() => {
    const tabs = this.store.tabs;
    const status = this.store.status();
    const start = tabs.findIndex(t => t.key === this.store.activeTab());
    for (let i = 1; i < tabs.length; i++) {
      const tab = tabs[(start + i) % tabs.length];
      const s = this.store.tab(tab.key)();
      // Emotes and music sheets open straight in the picker, so they're unfinished until something is marked.
      const unfinished = tab.kind === 'emote' || tab.kind === 'music'
        ? !status[tab.key].fresh && !status[tab.key].open
        : s.stage !== 'confirm';
      if (unfinished) { return tab; }
    }
    return undefined;
  });

  /** Focus follows to the new tab, since this button goes away with the old panel. */
  open(tab: QuickStartTab): void {
    if (!this.store.confirmUnsure([this.store.activeTab()])) { return; }
    this.store.activeTab.set(tab.key);
    document.getElementById('qs-tab-' + tab.key)?.focus();
  }
}
