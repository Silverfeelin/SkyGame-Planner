import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { REDESIGN_FOOT_NAV, REDESIGN_NAV, withSeasonIcon } from './nav-items';
import { TooltipDirective } from '@app/directives/tooltip.directive';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, RouterLink, RouterLinkActive, MatIcon],
  host: { '[class.is-collapsed]': 'collapsed()' }
})
export class SidebarComponent {
  private readonly location = inject(Location);

  /**
   * Desktop only — below 1024px the sidebar is hidden entirely and the topbar's
   * drawer takes over. Expanded is the base state, so the only width transition
   * that ever runs is one the user asked for by clicking the toggle.
   */
  readonly collapsed = signal(false);

  toggleCollapsed(): void {
    this.collapsed.update(v => !v);
  }

  readonly mainNav = withSeasonIcon(REDESIGN_NAV, inject(DataService).seasonConfig.items.at(-1)?.iconUrl);
  readonly footNav = REDESIGN_FOOT_NAV;

  goBack(): void {
    this.location.back();
  }
}
