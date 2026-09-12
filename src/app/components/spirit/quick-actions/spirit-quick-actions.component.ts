import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { QuickActionsComponent } from '@app/components/shared/quick-actions/quick-actions.component';

@Component({
  selector: 'app-spirit-quick-actions',
  templateUrl: './spirit-quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon, QuickActionsComponent]
})
export class SpiritQuickActionsComponent {

  /** Exact path + query matching so only the active type filter lights up. */
  readonly activeOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'exact',
    matrixParams: 'ignored',
    fragment: 'ignored'
  };
}
