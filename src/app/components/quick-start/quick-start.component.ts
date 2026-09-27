import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, untracked, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { QuickStartStore } from './quick-start.store';
import { QuickStartSession } from './quick-start-session.service';
import { StartStepComponent } from './steps/start-step.component';
import { ClosetStepComponent } from './steps/closet-step.component';
import { QuickStartReviewComponent } from './review/quick-start-review.component';

@Component({
  selector: 'app-quick-start',
  templateUrl: './quick-start.component.html',
  styleUrl: './quick-start.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: QuickStartStore, useFactory: () => inject(QuickStartSession).acquire() }],
  imports: [MatIcon, StartStepComponent, ClosetStepComponent, QuickStartReviewComponent]
})
export class QuickStartComponent {
  readonly store = inject(QuickStartStore);
  readonly restarted = inject(QuickStartSession).restarted;

  readonly steps = ['When you started', 'Closet', 'Check and save'];
  readonly reportUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSchGuK36-UMWdZYmn9BE9tpMdiHMifAkCx8EsfCnINehK6_yA/viewform?usp=header';

  private readonly _top = viewChild.required<ElementRef<HTMLElement>>('top');
  private _firstStep = true;

  constructor() {
    effect(() => {
      const step = this.store.step();
      untracked(() => {
        this.store.reached.update(r => Math.max(r, step));
        if (this._firstStep) { this._firstStep = false; return; }
        const top = this._top().nativeElement;
        if (top.getBoundingClientRect().top < 0) { top.scrollIntoView({ block: 'start' }); }
      });
    });
  }

  goTo(step: number): void {
    if (step > this.store.reached()) { return; }
    this.store.step.set(step);
  }
}
