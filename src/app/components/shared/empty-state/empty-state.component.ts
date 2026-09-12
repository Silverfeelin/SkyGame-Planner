import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 * Empty / no-data placeholder. Drop this anywhere a page or panel has nothing
 * to show — keeps the frosted-card visual language consistent.
 *
 * Replaces the legacy `app-no-data` (`NoDataComponent`).
 */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class EmptyStateComponent {
  readonly title = input<string>('Nothing to show');
  readonly message = input<string>('There\'s no data here yet.');
  readonly icon = input<string>('info');
}
