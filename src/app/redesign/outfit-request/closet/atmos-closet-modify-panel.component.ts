import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ClosetStateService } from './closet-state.service';

@Component({
  selector: 'atmos-closet-modify-panel',
  templateUrl: './atmos-closet-modify-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon]
})
export class AtmosClosetModifyPanelComponent {
  readonly state = inject(ClosetStateService);

  setColumns(n: number): void {
    this.state.columns.set(n);
    localStorage.setItem('closet.columns', `${n}`);
  }

  toggleOngoing(): void {
    this.state.showOngoing.update(v => !v);
    localStorage.setItem('closet.show-ongoing', this.state.showOngoing() ? '1' : '0');
  }

  toggleSync(): void {
    const next = !this.state.shouldSync();
    if (next) {
      if (Object.keys(this.state.hidden()).length &&
          !confirm('Syncing from your tracked items will overwrite any changes made on this page. Are you sure?')) {
        return;
      }
      this._syncUnlocked();
    }
    this.state.shouldSync.set(next);
    localStorage.setItem('closet.sync', next ? '1' : '0');
  }

  resetSync(): void {
    if (!confirm('This will show all items in your closet. Are you sure?')) { return; }
    this.state.hidden.set({});
    this.state.shouldSync.set(false);
    this.state.lastLink.set(undefined);
    localStorage.setItem('closet.sync', '0');
    this.state.persistHidden();
  }

  closePanel(): void {
    this.state.modifyingCloset.set(false);
  }

  private _syncUnlocked(): void {
    const hidden: Record<string, boolean> = {};
    const allItems = this.state.allItems();
    for (const item of allItems) {
      if (!item.unlocked) { hidden[item.guid] = true; }
    }
    this.state.hidden.set(hidden);
    this.state.lastLink.set(undefined);
    this.state.persistHidden();
  }
}
