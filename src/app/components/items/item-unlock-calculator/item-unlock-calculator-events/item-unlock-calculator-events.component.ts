import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { IEvent } from '@app/interfaces/event.interface';
import { DataService } from '@app/services/data.service';
import { ISearchItem, SearchService } from '@app/services/search.service';
import { CardComponent } from "../../../layout/card/card.component";
import { EventCardComponent } from '@app/components/event-card/event-card.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-item-unlock-calculator-events',
  standalone: true,
  imports: [CardComponent, EventCardComponent, MatIcon],
  templateUrl: './item-unlock-calculator-events.component.html',
  styleUrl: './item-unlock-calculator-events.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemUnlockCalculatorEventsComponent {
  @Output() readonly eventSelected = new EventEmitter<IEvent>();

  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;

  value?: string;
  results?: Array<ISearchItem<IEvent>>;

  constructor(
    private readonly _dataService: DataService,
    private readonly _searchService: SearchService
  ) {}

  search(): void {
    this.value = this.input.nativeElement.value || '';
    const results = this.value
      ? this._searchService.search(this.value, { types: ['Event'], limit: 24 }) as Array<ISearchItem<IEvent>>
      : undefined;
    this.results = results as Array<ISearchItem<IEvent>>;
  }

  onEventSelected(event: IEvent) {
    this.eventSelected.emit(event);
  }
}
