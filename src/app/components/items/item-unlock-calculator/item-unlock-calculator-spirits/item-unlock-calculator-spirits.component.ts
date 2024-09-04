import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CardComponent } from "../../../layout/card/card.component";
import { DataService } from '@app/services/data.service';
import { ISearchItem, SearchService } from '@app/services/search.service';
import { MatIcon } from '@angular/material/icon';
import { ISpirit } from '@app/interfaces/spirit.interface';
import { SpiritCardComponent } from "../../../spirit-card/spirit-card.component";
import { ISeason } from '@app/interfaces/season.interface';

@Component({
  selector: 'app-item-unlock-calculator-spirits',
  standalone: true,
  imports: [CardComponent, MatIcon, SpiritCardComponent],
  templateUrl: './item-unlock-calculator-spirits.component.html',
  styleUrl: './item-unlock-calculator-spirits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemUnlockCalculatorSpiritsComponent {
  @Output() readonly spiritSelected = new EventEmitter<ISpirit>();
  @Output() readonly closed = new EventEmitter<void>();

  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;

  value?: string;
  results?: Array<ISearchItem<ISpirit>>;

  constructor(
    private readonly _dataService: DataService,
    private readonly _searchService: SearchService
  ) {}

  onBeforeFold(fold: boolean): void {
    if (!fold) { return; }
    this.closed.emit();
  }

  search(): void {
    this.value = this.input.nativeElement.value || '';
    let results = this.value
      ? this._searchService.search(this.value, { types: ['Spirit'], limit: 24 }) as Array<ISearchItem<ISpirit>>
      : undefined;

    results = results?.filter(result => {
      switch (result.data.type) {
        case 'Regular': case 'Elder': case 'Season': case 'Guide': return true;
        default: return false;
      }
    }).slice(0, 12);
    this.results = results as Array<ISearchItem<ISpirit>>;
  }

  onSpiritSelected(spirit: ISpirit) {
    this.spiritSelected.emit(spirit);
  }
}
