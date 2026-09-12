import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

export type AtmosCheckboxSize = 'sm' | 'md';

/**
 * Atmospheric tri-state checkbox glyph. Purely presentational — the consumer
 * owns the state and the click target (typically an `.atmos-btn` wrapping this
 * glyph and a label).
 */
@Component({
  selector: 'app-atmos-checkbox',
  templateUrl: './atmos-checkbox.component.html',
  styleUrl: './atmos-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-size]': 'size()', '[attr.data-state]': 'stateAttr()' },
  imports: [MatIcon]
})
export class AtmosCheckboxComponent {
  readonly state = input<boolean | undefined>(undefined);
  /** Renders the `false` state as an indeterminate box instead of an empty one. */
  readonly falseAsIndeterminate = input<boolean>(false);
  /** Tints the glyph green when checked and amber when explicitly unchecked. */
  readonly useColors = input<boolean>(false);
  readonly size = input<AtmosCheckboxSize>('md');

  readonly icon = computed<string>(() => {
    switch (this.state()) {
      case true: return 'check_box';
      case false: return this.falseAsIndeterminate() ? 'indeterminate_check_box' : 'check_box_outline_blank';
      default: return 'check_box_outline_blank';
    }
  });

  readonly stateAttr = computed<string | null>(() => {
    if (!this.useColors()) { return null; }
    switch (this.state()) {
      case true: return 'on';
      case false: return 'off';
      default: return null;
    }
  });
}
