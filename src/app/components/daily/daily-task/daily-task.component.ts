import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IDailyTask } from '../daily-tasks';
import { DateTimePipe } from "../../../pipes/date-time.pipe";

@Component({
  selector: 'app-daily-task',
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, DateTimePipe],
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
