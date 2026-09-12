import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 * Atmospheric draft-content warning. Drop this on any page that renders
 * draft data (seasons, events, returning spirits, calculators) to show a
 * consistent "we're still working on this" notice.
 */
@Component({
  selector: 'app-atmos-draft-warning',
  templateUrl: './atmos-draft-warning.component.html',
  styleUrl: './atmos-draft-warning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class AtmosDraftWarningComponent {
  readonly message = input<string>(`We're still working on this content. Thank you for your patience.`);
}
