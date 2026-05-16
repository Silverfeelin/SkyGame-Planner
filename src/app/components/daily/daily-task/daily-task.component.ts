import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IDailyTask } from '../daily-tasks';

@Component({
  selector: 'app-daily-task',
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'task',
    '[class.task-checked]': 'checked()',
    '[class.task-hidden]': 'hidden()',
    '(click)': 'toggle.emit()',
  },
  imports: [RouterLink, MatIcon],
})
export class DailyTaskComponent {
  readonly task = input.required<IDailyTask>();
  readonly checked = input<boolean>(false);
  readonly showHide = input<boolean>(true);
  readonly hidden = input<boolean>(false);
  readonly light = input<string>('');
  readonly toggle = output<void>();
  readonly toggleHide = output<void>();
}
