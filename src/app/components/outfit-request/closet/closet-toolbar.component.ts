import { ChangeDetectionStrategy, Component, computed, inject, output, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ClosetStateService, RequestColor } from './closet-state.service';
import { PASTE_KEY, SCREENSHOT_ACCEPT } from '@app/components/quick-start/closet/closet-files';

const COLORS: Array<{ color: RequestColor; label: string }> = [
  { color: 'r', label: 'Red' },
  { color: 'y', label: 'Yellow' },
  { color: 'g', label: 'Green' },
  { color: 'b', label: 'Blue' }
];

@Component({
  selector: 'app-closet-toolbar',
  templateUrl: './closet-toolbar.component.html',
  styleUrl: './closet-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  host: {
    '(document:click)': 'onDocumentClick($event)'
  },
  imports: [MatIcon]
})
export class ClosetToolbarComponent {
  readonly state = inject(ClosetStateService);

  readonly isRequesting = input(false);
  readonly pasteKey = PASTE_KEY;
  readonly imageAccept = SCREENSHOT_ACCEPT;
  readonly colors = COLORS;
  readonly colorLabel = computed(() => COLORS.find(c => c.color === this.state.color())?.label ?? 'Eraser');

  readonly resetRequest = output<void>();
  readonly randomRequest = output<void>();
  readonly copyLinkRequest = output<void>();
  readonly copyImageRequest = output<string>();
  readonly shareImageRequest = output<string>();
  readonly imageRequest = output<File>();

  pickImage(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (file) { this.imageRequest.emit(file); }
  }

  setColor(color: RequestColor | undefined): void {
    this.state.color.set(color);
    this.state.showingColorPicker.set(false);
    this.state.modifyingCloset.set(false);
  }

  toggleColorPicker(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.state.showingColorPicker.update(v => !v);
  }

  onDocumentClick(evt: MouseEvent): void {
    if (!this.state.showingColorPicker()) { return; }
    if ((evt.target as Element | null)?.closest('.atmos-color-picker')) { return; }
    this.state.showingColorPicker.set(false);
  }

  toggleItemSize(): void {
    this.state.itemSize.update(v => v === 'small' ? 'default' : 'small');
    localStorage.setItem('closet.item-size', this.state.itemSize());
  }

  toggleIap(): void {
    this.state.hideIap.update(v => !v);
  }

  toggleCloset(): void {
    this.state.closetMode.update(v => v === 'all' ? 'closet' : 'all');
    if (this.state.closetMode() !== 'closet') {
      this.state.modifyingCloset.set(false);
    }
    localStorage.setItem('closet.show-mode', this.state.closetMode());
  }

  modifyCloset(): void {
    this.state.modifyingCloset.update(v => !v);
    if (this.state.modifyingCloset()) {
      this.state.closetMode.set('closet');
    }
  }

  showBackgroundPicker(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.state.showingBackgroundPicker.update(v => !v);
  }
}
