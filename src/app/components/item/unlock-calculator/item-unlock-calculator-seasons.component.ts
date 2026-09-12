import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ISeason } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { MatIcon } from '@angular/material/icon';
import { IconComponent } from '@app/components/icon/icon.component';
import { FoldableCardComponent } from '@app/components/shared/foldable-card/foldable-card.component';

@Component({
  selector: 'app-item-unlock-calculator-seasons',
  templateUrl: './item-unlock-calculator-seasons.component.html',
  styleUrl: './item-unlock-calculator-sub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, IconComponent, FoldableCardComponent]
})
export class ItemUnlockCalculatorSeasonsComponent {
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
