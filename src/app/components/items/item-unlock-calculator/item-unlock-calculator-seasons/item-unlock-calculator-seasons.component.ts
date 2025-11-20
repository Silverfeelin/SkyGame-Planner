import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CardComponent, CardFoldEvent } from '@app/components/layout/card/card.component';
import { DataService } from '@app/services/data.service';
import { ISeason } from 'skygame-data';

@Component({
    selector: 'app-item-unlock-calculator-seasons',
    imports: [CardComponent],
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
