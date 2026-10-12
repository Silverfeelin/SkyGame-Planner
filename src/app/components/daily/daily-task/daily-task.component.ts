import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IDailyTask } from '@app/components/daily/daily-tasks';
import { TimePipe } from '@app/pipes/time.pipe';
import { TooltipDirective } from '@app/directives/tooltip.directive';

/**
 * Daily-task row.
 */
@Component({
  selector: 'app-daily-task',
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, RouterLink, MatIcon, TimePipe]
})
export class DailyTaskComponent {
  readonly task = input.required<IDailyTask>();
  readonly checked = input<boolean>(false);
  readonly showHide = input<boolean>(true);
  readonly hidden = input<boolean>(false);
  readonly light = input<string>('');
  /** Reason the task cannot be done today; empty when it can. */
  readonly disabledReason = input<string>('');

  readonly toggle = output<void>();
  readonly toggleHide = output<void>();

  onToggle(): void {
    if (this.disabledReason()) { return; }
    this.toggle.emit();
  }
  onToggleHide(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleHide.emit();
  }
}
