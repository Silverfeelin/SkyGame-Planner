import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Output } from '@angular/core';

const ignoreKeys = new Set(['Control', 'Shift', 'Alt', 'Meta']);

@Component({
    selector: 'app-keyboard-shortcuts',
    imports: [],
    templateUrl: './keyboard-shortcuts.component.html',
    styleUrl: './keyboard-shortcuts.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyboardShortcutsComponent {
  @Output() readonly close = new EventEmitter<void>();

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (ignoreKeys.has(event.key)) { return; }
    this.close.emit();
  }

  constructor() {
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
  }
}
