import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';

/**
 * Full-screen image viewer. Unlike {@link OverlayComponent} it has no card, no
 * padding and no dismiss button: the image gets the whole viewport and a click
 * anywhere closes it. Projected `[overlayAction]` content sits at the top, clear
 * of the artist credit most preview images carry along their bottom edge.
 *
 * It is a native modal `<dialog>` so the browser renders it in the top layer:
 * `.atmos-main` is a stacking context below the sidebar and topbar, so a plain
 * fixed-position element would be drawn behind the menu no matter its z-index.
 */
@Component({
  selector: 'app-image-overlay',
  templateUrl: './image-overlay.component.html',
  styleUrl: './image-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageOverlayComponent implements AfterViewInit {
  readonly src = input.required<string>();
  readonly alt = input<string>('');

  readonly close = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  onClose(event: Event): void {
    event.stopImmediatePropagation();
    this.close.emit();
  }

  /** Escape and the browser's own dismiss gesture. */
  onCancel(event: Event): void {
    event.preventDefault();
    this.close.emit();
  }
}
