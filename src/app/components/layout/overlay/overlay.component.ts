import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { EventService } from '@app/services/event.service';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverlayComponent {
  @Input() title?: string;
  @Input() dismissable = true;
  @Input() closeText = 'Dismiss';
  @Input() closeOnClickOut = true;

  @Output() readonly close = new EventEmitter<void>();

  constructor(
    private readonly _eventService: EventService
  ) {
    _eventService.keydown.pipe(takeUntilDestroyed()).subscribe(evt => { this.onKeydown(evt); });
  }

  onKeydown(evt: KeyboardEvent) {
    if (evt.key === 'Escape') { this.onClose(evt); }
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
