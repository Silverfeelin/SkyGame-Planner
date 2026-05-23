import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { INavItem, REDESIGN_FOOT_NAV, REDESIGN_NAV } from './nav-items';

@Component({
  selector: 'app-atmospheric-topbar',
  templateUrl: './atmospheric-topbar.component.html',
  styleUrl: './atmospheric-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon]
})
export class AtmosphericTopbarComponent {
  readonly drawerOpen = signal(false);

  readonly nav: ReadonlyArray<INavItem> = [
    ...REDESIGN_NAV,
    REDESIGN_FOOT_NAV.find(n => n.link === '/r/settings')!
  ];

  toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
