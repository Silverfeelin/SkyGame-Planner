import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
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
  private readonly location = inject(Location);

  readonly drawerOpen = signal(false);
  /** Enabled only after a second navigation, so back never leaves the site. */
  readonly canGoBack = signal(false);
  private navigations = 0;

  readonly mainNav = withSeasonIcon(REDESIGN_NAV, inject(DataService).seasonConfig.items.at(-1)?.iconUrl);
  readonly footNav = REDESIGN_FOOT_NAV;

  constructor() {
    inject(Router).events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      if (++this.navigations > 1) { this.canGoBack.set(true); }
    });
  }

  goBack(): void {
    if (!this.canGoBack()) { return; }
    this.closeDrawer();
    this.location.back();
  }

  toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
