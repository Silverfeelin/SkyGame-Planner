import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'atmos-season-quick-actions',
  templateUrl: './atmos-season-quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon]
})
export class AtmosSeasonQuickActionsComponent {
  wikiHref = input<string>();
  calendarHref = input<string>();
}
