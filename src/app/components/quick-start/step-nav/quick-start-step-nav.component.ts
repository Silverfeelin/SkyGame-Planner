import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { QuickStartStore } from '../quick-start.store';

/** Back / Next row at the bottom of a quick start step. */
@Component({
  selector: 'app-quick-start-step-nav',
  templateUrl: './quick-start-step-nav.component.html',
  styleUrl: './quick-start-step-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class QuickStartStepNavComponent {
  readonly store = inject(QuickStartStore);

  readonly nextLabel = input('Next');
  readonly nextIcon = input('arrow_forward');
  readonly nextDisabled = input(false);
  /** Off for hosts that handle Next themselves, e.g. saving on the last step. */
  readonly advance = input(true);

  readonly next = output<void>();

  back(): void {
    this.store.step.update(s => Math.max(0, s - 1));
  }

  forward(): void {
    this.next.emit();
    if (this.advance()) {
      this.store.step.update(s => s + 1);
    }
  }
}
