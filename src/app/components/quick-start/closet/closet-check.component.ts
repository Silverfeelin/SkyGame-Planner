import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { QuickStartTab } from '@app/services/quick-start/quick-start.model';
import { ImageOverlayComponent } from '@app/components/layout/image-overlay/image-overlay.component';
import { QuickStartShot, QuickStartStore } from '../quick-start.store';
import { PASTE_KEY, SCREENSHOT_ACCEPT } from './closet-files';

@Component({
  selector: 'app-quick-start-closet-check',
  templateUrl: './closet-check.component.html',
  styleUrl: './closet-check.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ImageOverlayComponent]
})
export class ClosetCheckComponent {
  readonly store = inject(QuickStartStore);
  readonly accept = SCREENSHOT_ACCEPT;
  readonly pasteKey = PASTE_KEY;

  readonly tab = input.required<QuickStartTab>();

  readonly state = computed(() => this.store.tab(this.tab().key)());
  readonly closetTabs = this.store.tabs.filter(t => t.kind === 'closet');
  readonly offTab = computed<ReadonlySet<number>>(() => new Set(this.state().result?.offTab));
  readonly allOffTab = computed(() => this.offTab().size === this.state().shots.length);
  readonly preview = signal<QuickStartShot | null>(null);

  onFiles(input: HTMLInputElement): void {
    if (input.files?.length) { this.store.addFiles(this.tab().key, Array.from(input.files)); }
    input.value = '';
  }

  onMove(event: Event): void {
    this.store.moveShots(this.tab().key, (event.target as HTMLSelectElement).value);
  }
}
