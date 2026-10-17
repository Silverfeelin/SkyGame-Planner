import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventService } from '@app/services/event.service';

/**
 * A native modal `<dialog>` so the browser renders it in the top layer:
 * `.atmos-main` is a stacking context below the sidebar and topbar, so a plain
 * fixed-position element would be drawn behind the menu no matter its z-index.
 */
@Component({
    selector: 'app-overlay',
    imports: [],
    templateUrl: './overlay.component.html',
    styleUrl: './overlay.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverlayComponent implements AfterViewInit {
  @Input() title?: string;
  @Input() dismissable = true;
  @Input() closeText = 'Dismiss';
  @Input() closeOnClickOut = true;

  @Output() readonly close = new EventEmitter<void>();

  @ViewChild('dialog', { static: true }) private readonly _dialog!: ElementRef<HTMLDialogElement>;

  constructor(
    private readonly _eventService: EventService
  ) {
    _eventService.keydown.pipe(takeUntilDestroyed()).subscribe(evt => { this.onKeydown(evt); });
  }

  ngAfterViewInit(): void {
    this._dialog.nativeElement.showModal();
  }

  onKeydown(evt: KeyboardEvent) {
    if (evt.key !== 'Escape') { return; }
    // Keeps the browser from closing the dialog itself; the parent owns that state.
    evt.preventDefault();
    this.onClose(evt);
  }

  /** The browser's own dismiss gesture, such as the Android back button. */
  onCancel(event: Event): void {
    event.preventDefault();
    this.onClose(event);
  }

  onClose(event: Event): void {
    if (!this.dismissable) { return; }
    event.stopImmediatePropagation();
    this.close.emit();
  }

  onClickOut(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.overlay-body')) { return; }
    if (!this.closeOnClickOut) { return; }
    this.onClose(event);
  }
}
