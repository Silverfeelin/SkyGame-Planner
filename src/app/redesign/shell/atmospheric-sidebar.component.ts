import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { REDESIGN_FOOT_NAV, REDESIGN_NAV, withSeasonIcon } from './nav-items';

@Component({
  selector: 'app-atmospheric-sidebar',
  templateUrl: './atmospheric-sidebar.component.html',
  styleUrl: './atmospheric-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon]
})
export class AtmosphericSidebarComponent {
  readonly mainNav = withSeasonIcon(REDESIGN_NAV, inject(DataService).seasonConfig.items.at(-1)?.iconUrl);
  readonly footNav = REDESIGN_FOOT_NAV;
}
