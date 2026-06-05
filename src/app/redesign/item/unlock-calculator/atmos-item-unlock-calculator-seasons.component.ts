import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ISeason } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { IconComponent } from '@app/components/icon/icon.component';

@Component({
  selector: 'app-atmos-item-unlock-calculator-seasons',
  templateUrl: './atmos-item-unlock-calculator-seasons.component.html',
  styleUrl: './atmos-item-unlock-calculator-sub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent]
})
export class AtmosItemUnlockCalculatorSeasonsComponent {
  readonly seasonSelected = output<ISeason>();
  readonly guideSelected = output<ISeason>();

  readonly seasons: ReadonlyArray<ISeason>;

  constructor() {
    const dataService = inject(DataService);
    this.seasons = dataService.seasonConfig.items;
  }

  onSeasonSelected(season: ISeason): void {
    this.seasonSelected.emit(season);
  }

  onGuideSelected(season: ISeason): void {
    this.guideSelected.emit(season);
  }
}
