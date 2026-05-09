import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-daily-checkin',
  imports: [MatIcon],
  templateUrl: './daily-checkin.component.html',
  styleUrl: './daily-checkin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyCheckinComponent {
  readonly checkedIn = input<boolean>();
  readonly label = input('I have done my dailies.');
  readonly checkin = output<MouseEvent>();

  onCheckinClick(evt: MouseEvent): void {
    this.checkin.emit(evt);
  }
}
