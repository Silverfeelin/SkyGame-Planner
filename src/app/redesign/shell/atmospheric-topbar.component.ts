import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { REDESIGN_FOOT_NAV, REDESIGN_NAV, withSeasonIcon } from './nav-items';

@Component({
  selector: 'app-atmospheric-topbar',
  templateUrl: './atmospheric-topbar.component.html',
  styleUrl: './atmospheric-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon]
})
export class AtmosphericTopbarComponent {
  readonly drawerOpen = signal(false);

  readonly mainNav = withSeasonIcon(REDESIGN_NAV, inject(DataService).seasonConfig.items.at(-1)?.iconUrl);
  readonly footNav = REDESIGN_FOOT_NAV;

  toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
