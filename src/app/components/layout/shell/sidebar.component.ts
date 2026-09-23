import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { REDESIGN_FOOT_NAV, REDESIGN_NAV, withSeasonIcon } from './nav-items';
import { TooltipDirective } from '@app/directives/tooltip.directive';

const collapsedKey = 'menu.collapsed';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, RouterLink, RouterLinkActive, MatIcon],
  host: {
    '[class.is-collapsed]': 'collapsed()',
    '[class.is-animated]': 'animated()'
  }
})
export class SidebarComponent {
  private readonly location = inject(Location);

  /**
   * Below 1024px the sidebar is hidden and the topbar's drawer takes over,
   * unless the user forced the sidebar via the menu setting.
   */
  readonly collapsed = signal(localStorage.getItem(collapsedKey) === '1');
  /** The host class lands after first layout, so an always-on width transition would animate the restored state. */
  readonly animated = signal(false);

  toggleCollapsed(): void {
    this.animated.set(true);
    this.collapsed.update(v => !v);
    localStorage.setItem(collapsedKey, this.collapsed() ? '1' : '0');
  }

  readonly mainNav = withSeasonIcon(REDESIGN_NAV, inject(DataService).seasonConfig.items.at(-1)?.iconUrl);
  readonly footNav = REDESIGN_FOOT_NAV;

  goBack(): void {
    this.location.back();
  }
}
