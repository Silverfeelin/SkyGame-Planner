import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';

export const QUICK_START_DISMISSED_KEY = 'quick-start.dismissed';

@Component({
  selector: 'app-dashboard-quick-start',
  templateUrl: './quick-start-card.component.html',
  styleUrl: './quick-start-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, RouterLink]
})
export class DashboardQuickStartComponent {
  private readonly _data = inject(DataService);
  private readonly _storage = inject(StorageService);

  readonly isVisible = signal(!this._storage.getKey<boolean>(QUICK_START_DISMISSED_KEY) && !this.hasProgress());

  dismiss(): void {
    this._storage.setKey(QUICK_START_DISMISSED_KEY, true);
    this.isVisible.set(false);
  }

  /** Auto-unlocked items can end up in storage without the player doing anything, so they don't count. */
  private hasProgress(): boolean {
    if (this._storage.getWingedLights().size || this._storage.getSeasonPasses().size) { return true; }
    for (const guid of this._storage.getUnlocked()) {
      if (!(this._data.guidMap.get(guid) as IItem | undefined)?.autoUnlocked) { return true; }
    }
    return false;
  }
}
