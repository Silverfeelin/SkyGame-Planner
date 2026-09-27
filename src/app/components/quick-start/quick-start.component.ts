import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { QuickStartStore } from './quick-start.store';
import { StartStepComponent } from './steps/start-step.component';
import { ClosetStepComponent } from './steps/closet-step.component';
import { WingedLightStepComponent } from './steps/winged-light-step.component';
import { QuickStartReviewComponent } from './review/quick-start-review.component';

@Component({
  selector: 'app-quick-start',
  templateUrl: './quick-start.component.html',
  styleUrl: './quick-start.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuickStartStore],
  imports: [MatIcon, StartStepComponent, ClosetStepComponent, WingedLightStepComponent, QuickStartReviewComponent]
})
export class QuickStartComponent {
  readonly store = inject(QuickStartStore);

  readonly steps = ['When you started', 'Closet', 'Winged light', 'Check and save'];

  /** Furthest step opened so far; every step up to it can be revisited from the stepper. */
  readonly reached = signal(0);

  private readonly _top = viewChild.required<ElementRef<HTMLElement>>('top');
  private _firstStep = true;

  constructor() {
    effect(() => {
      const step = this.store.step();
      untracked(() => {
        this.reached.update(r => Math.max(r, step));
        if (this._firstStep) { this._firstStep = false; return; }
        const top = this._top().nativeElement;
        if (top.getBoundingClientRect().top < 0) { top.scrollIntoView({ block: 'start' }); }
      });
    });
  }

  goTo(step: number): void {
    if (step > this.reached()) { return; }
    this.store.step.set(step);
  }
}
