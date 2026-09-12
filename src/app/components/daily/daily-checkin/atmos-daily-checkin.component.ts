import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 * Atmospheric daily check-in pill. Mirrors `DailyCheckinComponent` API.
 */
@Component({
  selector: 'app-atmos-daily-checkin',
  templateUrl: './atmos-daily-checkin.component.html',
  styleUrl: './atmos-daily-checkin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class AtmosDailyCheckinComponent {
  readonly checkedIn = input<boolean>(false);
  readonly label = input<string>('I have done my daily quests.');

  readonly checkin = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.checkin.emit(event);
  }
}
