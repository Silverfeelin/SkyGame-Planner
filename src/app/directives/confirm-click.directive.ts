import { Directive, input, OnDestroy, output, signal } from '@angular/core';

/**
 * Two-press confirmation for a button, in place of a blocking `confirm()` dialog.
 *
 * The first press arms the button (`is-confirming` class, `armed()` signal) and the second
 * press within `confirmTimeout` ms emits `skyConfirmClick`. Moving focus away disarms it.
 * Read `armed()` through `exportAs: 'skyConfirmClick'` to swap the icon or tooltip while armed.
 */
@Directive({
  selector: '[skyConfirmClick]',
  exportAs: 'skyConfirmClick',
  standalone: true,
  host: {
    '[class.is-confirming]': 'armed()',
    '(click)': 'onClick($event)',
    '(blur)': 'disarm()',
  }
})
export class ConfirmClickDirective implements OnDestroy {
  readonly confirmTimeout = input(3000);
  /** Skips the confirmation step, so the first press emits right away. */
  readonly confirmSkip = input(false);
  readonly skyConfirmClick = output<void>();

  readonly armed = signal(false);
  private _timer?: ReturnType<typeof setTimeout>;

  onClick(event: Event): void {
    // Rows in overlays are often clickable themselves.
    event.stopPropagation();

    if (this.confirmSkip() || this.armed()) {
      this.disarm();
      this.skyConfirmClick.emit();
      return;
    }

    this.armed.set(true);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.disarm(), this.confirmTimeout());
  }

  disarm(): void {
    clearTimeout(this._timer);
    this.armed.set(false);
  }

  ngOnDestroy(): void {
    clearTimeout(this._timer);
  }
}
