import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IconComponent } from '@app/components/icon/icon.component';
import { CardComponent, CardFoldEvent } from '@app/components/layout/card/card.component';
import { SeasonCardComponent } from '@app/components/season-card/season-card.component';
import { ISeason } from '@app/interfaces/season.interface';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-item-unlock-calculator-seasons',
  standalone: true,
  imports: [CardComponent, SeasonCardComponent, MatIcon, IconComponent],
  templateUrl: './item-unlock-calculator-seasons.component.html',
  styleUrl: './item-unlock-calculator-seasons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemUnlockCalculatorSeasonsComponent {
  @Output() readonly seasonSelected = new EventEmitter<ISeason>();
  @Output() readonly guideSelected = new EventEmitter<ISeason>();
  @Output() readonly closed = new EventEmitter<void>();

  seasons: Array<ISeason>;

  constructor(
    private readonly _dataService: DataService
  ) {
    this.seasons = this._dataService.seasonConfig.items;
  }

  onBeforeFold(evt: CardFoldEvent): void {
    if (!evt.fold) { return; }
    this.closed.emit();
  }

  onSeasonSelected(season: ISeason) {
    this.seasonSelected.emit(season);
  }

  onGuideSelected(season: ISeason) {
    this.guideSelected.emit(season);
  }
}
