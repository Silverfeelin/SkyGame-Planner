import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IRealm } from 'skygame-data';
import { DailyCheckinComponent } from '../daily-checkin/daily-checkin.component';

export type DailyCardSection = 'img' | 'realm' | 'dailies' | 'checkin';

export interface DailyCardOptions {
  show?: ReadonlyArray<DailyCardSection>;
}

/**
 * Daily summary card. Day-of-week realm rotation is intentionally NOT
 * performed here — pass the resolved `realm` from the parent so this widget
 * stays pure.
 */
@Component({
  selector: 'app-daily-card',
  templateUrl: './daily-card.component.html',
  styleUrl: './daily-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, DailyCheckinComponent]
})
export class DailyCardComponent {
  readonly options = input<DailyCardOptions>({ show: ['img', 'realm', 'dailies', 'checkin'] });
  readonly realm = input<IRealm | undefined>(undefined);
  readonly checkedIn = input<boolean>(false);

  readonly checkinToggle = output<MouseEvent>();

  readonly imageStyle = computed<string | undefined>(() => {
    const url = this.realm()?.imageUrl;
    return url ? `url('${url}')` : undefined;
  });

  readonly sections = computed<Record<string, boolean>>(() => {
    const show = this.options().show ?? [];
    const map: Record<string, boolean> = {};
    for (const s of show) { map[s] = true; }
    return map;
  });

  onCheckin(event: MouseEvent): void {
    this.checkinToggle.emit(event);
  }
}
