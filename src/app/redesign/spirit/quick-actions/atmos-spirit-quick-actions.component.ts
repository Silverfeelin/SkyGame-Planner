import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'atmos-spirit-quick-actions',
  templateUrl: './atmos-spirit-quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon]
})
export class AtmosSpiritQuickActionsComponent {

  /** Exact path + query matching so only the active type filter lights up. */
  readonly activeOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'exact',
    matrixParams: 'ignored',
    fragment: 'ignored'
  };
}
