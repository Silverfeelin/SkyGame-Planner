import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { REDESIGN_FOOT_NAV, REDESIGN_NAV } from './nav-items';

@Component({
  selector: 'app-atmospheric-sidebar',
  templateUrl: './atmospheric-sidebar.component.html',
  styleUrl: './atmospheric-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon]
})
export class AtmosphericSidebarComponent {
  readonly mainNav = REDESIGN_NAV;
  readonly footNav = REDESIGN_FOOT_NAV;
}
