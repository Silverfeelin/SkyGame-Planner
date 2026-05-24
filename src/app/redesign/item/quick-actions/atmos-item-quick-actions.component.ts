import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'atmos-item-quick-actions',
  templateUrl: './atmos-item-quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon]
})
export class AtmosItemQuickActionsComponent {
  /** 'table' → show "View as table" (grid page only). 'grid' → show "Back to grid" (everywhere else). */
  readonly firstAction = input<'table' | 'grid'>('grid');
}
