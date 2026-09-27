import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { QuickStartTab } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore } from '../quick-start.store';
import { SCREENSHOT_ACCEPT } from './closet-files';

@Component({
  selector: 'app-quick-start-closet-check',
  templateUrl: './closet-check.component.html',
  styleUrl: './closet-check.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class ClosetCheckComponent {
  readonly store = inject(QuickStartStore);
  readonly accept = SCREENSHOT_ACCEPT;

  readonly tab = input.required<QuickStartTab>();

  readonly state = computed(() => this.store.tab(this.tab().key)());
  readonly closetTabs = this.store.tabs.filter(t => t.kind === 'closet');

  onFiles(input: HTMLInputElement): void {
    if (input.files?.length) { this.store.addFiles(this.tab().key, Array.from(input.files)); }
    input.value = '';
  }

  onMove(event: Event): void {
    this.store.moveShots(this.tab().key, (event.target as HTMLSelectElement).value);
  }
}
