import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ISpirit } from 'skygame-data';
import { ISearchItem, SearchService } from '@app/services/search.service';
import { SpiritCardComponent } from '@app/components/shared/shared-widgets';
import { FoldableCardComponent } from '@app/components/shared/foldable-card/foldable-card.component';

@Component({
  selector: 'app-item-unlock-calculator-spirits',
  templateUrl: './item-unlock-calculator-spirits.component.html',
  styleUrl: './item-unlock-calculator-sub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, SpiritCardComponent, FoldableCardComponent]
})
export class ItemUnlockCalculatorSpiritsComponent {
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;

  private readonly _searchService = inject(SearchService);

  readonly spiritSelected = output<ISpirit>();

  readonly results = signal<ReadonlyArray<ISearchItem<ISpirit>> | undefined>(undefined);

  search(): void {
    const value = this.input.nativeElement.value || '';
    if (!value) { this.results.set(undefined); return; }

    let results = this._searchService.search(value, { types: ['Spirit'], limit: 24 }) as Array<ISearchItem<ISpirit>>;
    results = results?.filter(result => {
      switch (result.data.type) {
        case 'Regular': case 'Elder': case 'Season': case 'Guide': return true;
        default: return false;
      }
    }).slice(0, 12);
    this.results.set(results);
  }

  onSpiritSelected(spirit: ISpirit): void {
    this.spiritSelected.emit(spirit);
  }
}
