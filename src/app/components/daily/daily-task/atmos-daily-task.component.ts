import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IDailyTask } from '@app/components/daily/daily-tasks';
import { DateTimePipe } from '@app/pipes/date-time.pipe';

/**
 * Atmospheric daily-task row. Mirrors `DailyTaskComponent` inputs.
 */
@Component({
  selector: 'app-atmos-daily-task',
  templateUrl: './atmos-daily-task.component.html',
  styleUrl: './atmos-daily-task.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, DateTimePipe]
})
export class AtmosDailyTaskComponent {
  readonly task = input.required<IDailyTask>();
  readonly checked = input<boolean>(false);
  readonly showHide = input<boolean>(true);
  readonly hidden = input<boolean>(false);
  readonly light = input<string>('');

  readonly toggle = output<void>();
  readonly toggleHide = output<void>();

  onToggle(): void { this.toggle.emit(); }
  onToggleHide(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleHide.emit();
  }
}
