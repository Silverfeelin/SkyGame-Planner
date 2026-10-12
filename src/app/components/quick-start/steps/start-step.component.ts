import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ISeason } from 'skygame-data';
import { QuickStartStore } from '../quick-start.store';
import { QuickStartStepNavComponent } from '../step-nav/quick-start-step-nav.component';

interface YearTick {
  year: number;
  /** Position along the slider, 0–100. */
  pct: number;
}

@Component({
  selector: 'app-quick-start-start-step',
  templateUrl: './start-step.component.html',
  styleUrl: './start-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QuickStartStepNavComponent]
})
export class StartStepComponent {
  readonly store = inject(QuickStartStore);

  readonly max = Math.max(0, this.store.seasons.length - 1);
  readonly season = computed<ISeason | undefined>(() => this.store.seasons[this.store.startIndex()]);

  /** One tick per year, under the first season that started in it. */
  readonly ticks: Array<YearTick> = (() => {
    const ticks: Array<YearTick> = [];
    this.store.seasons.forEach((s, i) => {
      if (ticks.at(-1)?.year === s.date.year) { return; }
      ticks.push({ year: s.date.year, pct: this.max ? i / this.max * 100 : 0 });
    });
    return ticks;
  })();

  onSlide(event: Event): void {
    const season = this.store.seasons[+(event.target as HTMLInputElement).value];
    if (season) { this.store.useStart(season); }
  }

  onUnsure(event: Event): void {
    this.store.startUnsure.set((event.target as HTMLInputElement).checked);
  }
}
