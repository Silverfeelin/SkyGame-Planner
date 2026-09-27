import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { QuickStartTab } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore } from '../quick-start.store';

@Component({
  selector: 'app-quick-start-closet-matching',
  templateUrl: './closet-matching.component.html',
  styleUrl: './closet-matching.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class ClosetMatchingComponent {
  readonly store = inject(QuickStartStore);

  readonly tab = input.required<QuickStartTab>();

  readonly state = computed(() => this.store.tab(this.tab().key)());
  readonly done = computed(() => Math.floor(this.state().progress));
  readonly percent = computed(() => {
    const total = this.state().shots.length;
    return total ? Math.min(100, this.state().progress / total * 100) : 0;
  });
}
