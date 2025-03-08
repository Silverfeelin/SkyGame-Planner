import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { IEvent } from '@app/interfaces/event.interface';
import { DataService } from '@app/services/data.service';
import { SearchService } from '@app/services/search.service';
import { CardComponent, CardFoldEvent } from "../../../layout/card/card.component";

@Component({
    selector: 'app-item-unlock-calculator-events',
    imports: [CardComponent],
    templateUrl: './item-unlock-calculator-events.component.html',
    styleUrl: './item-unlock-calculator-events.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemUnlockCalculatorEventsComponent {
  @Output() readonly eventSelected = new EventEmitter<IEvent>();
  @Output() readonly closed = new EventEmitter<void>();

  events: Array<IEvent>;

  constructor(
    private readonly _dataService: DataService,
    private readonly _searchService: SearchService
  ) {
    this.events = this._dataService.eventConfig.items;
  }

  onBeforeFold(evt: CardFoldEvent): void {
    if (!evt.fold) { return; }
    this.closed.emit();
  }

  onEventSelected(event: IEvent) {
    this.eventSelected.emit(event);
  }
}
