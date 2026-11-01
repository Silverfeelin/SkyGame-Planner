import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@app/pipes/translate.pipe';

/**
 * Daily check-in pill.
 */
@Component({
  selector: 'app-daily-checkin',
  templateUrl: './daily-checkin.component.html',
  styleUrl: './daily-checkin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TranslatePipe]
})
export class DailyCheckinComponent {
  readonly checkedIn = input<boolean>(false);
  readonly label = input<string>('I have done my daily quests.');

  readonly checkin = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.checkin.emit(event);
  }
}
