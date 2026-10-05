import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 * Draft-content warning. Drop this on any page that renders draft data
 * (seasons, events, returning spirits, calculators) to show a consistent
 * "we're still working on this" notice.
 */
@Component({
  selector: 'app-draft-warning',
  templateUrl: './draft-warning.component.html',
  styleUrl: './draft-warning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class DraftWarningComponent {
  readonly message = input<string>(`We're still working on this content. Thank you for your patience.`);
}
