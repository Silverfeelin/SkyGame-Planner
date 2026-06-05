import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IRealm } from 'skygame-data';
import { AtmosDailyCheckinComponent } from '../daily-checkin/atmos-daily-checkin.component';

export type AtmosDailyCardSection = 'img' | 'realm' | 'dailies' | 'checkin';

export interface AtmosDailyCardOptions {
  show?: ReadonlyArray<AtmosDailyCardSection>;
}

/**
 * Atmospheric daily summary card. Mirrors `DailyCardComponent` inputs.
 * Day-of-week realm rotation is intentionally NOT performed here — pass the
 * resolved `realm` from the parent so this widget stays pure.
 */
@Component({
  selector: 'app-atmos-daily-card',
  templateUrl: './atmos-daily-card.component.html',
  styleUrl: './atmos-daily-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, AtmosDailyCheckinComponent]
})
export class AtmosDailyCardComponent {
  readonly options = input<AtmosDailyCardOptions>({ show: ['img', 'realm', 'dailies', 'checkin'] });
  readonly realm = input<IRealm | undefined>(undefined);
  readonly checkedIn = input<boolean>(false);

  readonly checkinToggle = output<MouseEvent>();

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
