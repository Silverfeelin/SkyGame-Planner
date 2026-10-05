import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { QuickStartTab } from '@app/services/quick-start/quick-start.model';
import { ImageOverlayComponent } from '@app/components/layout/image-overlay/image-overlay.component';
import { QuickStartStore } from '../quick-start.store';
import { ClosetSketchComponent, ClosetSketchKind } from './closet-sketch.component';
import { PASTE_KEY, SCREENSHOT_ACCEPT } from './closet-files';

interface HowtoStep {
  kind: ClosetSketchKind;
  title: string;
  text: string;
}

@Component({
  selector: 'app-quick-start-closet-add',
  templateUrl: './closet-add.component.html',
  styleUrl: './closet-add.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ClosetSketchComponent, ImageOverlayComponent]
})
export class ClosetAddComponent {
  readonly store = inject(QuickStartStore);
  readonly accept = SCREENSHOT_ACCEPT;
  readonly exampleSrc = 'assets/images/quick-start-closet-example.webp';
  readonly pasteKey = PASTE_KEY;

  readonly tab = input.required<QuickStartTab>();

  readonly dragging = signal(false);
  readonly showExample = signal(false);

  readonly steps = computed<Array<HowtoStep>>(() => {
    const tab = this.tab();
    if (tab.kind === 'stanceCall') {
      return [
        { kind: 'tab', title: '1. Open your stances.', text: 'Open the expression menu on the stance tab. Calls are listed below the stances.' },
        { kind: 'whole', title: '2. Screenshot the whole screen.', text: `Don't crop it.` },
        { kind: 'scroll', title: '3. Scroll if needed.', text: 'On a small screen, scroll down and take another screenshot so every call is fully visible.' }
      ];
    }
    const label = tab.label.toLowerCase();
    return [
      { kind: 'tab', title: '1. Open the tab.', text: `In the game, open your closet on the ${label} tab and scroll to the top.` },
      { kind: 'whole', title: '2. Screenshot the whole screen.', text: `Don't crop it. Items marked as new or equipped are fine.` },
      { kind: 'scroll', title: '3. Scroll and repeat.', text: `Rows that are cut off are skipped, so scroll until they're fully visible. Keep going to the end of the tab.` }
    ];
  });

  onFiles(input: HTMLInputElement): void {
    if (input.files?.length) { this.store.addFiles(this.tab().key, Array.from(input.files)); }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) { return; }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    // dragleave also fires when moving onto a child of the drop zone.
    const zone = event.currentTarget as HTMLElement;
    if (event.relatedTarget instanceof Node && zone.contains(event.relatedTarget)) { return; }
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) { this.store.addFiles(this.tab().key, Array.from(files)); }
  }
}
