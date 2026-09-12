import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { IEvent } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { MatIcon } from '@angular/material/icon';
import { FoldableCardComponent } from '@app/components/shared/foldable-card/foldable-card.component';

@Component({
  selector: 'app-item-unlock-calculator-events',
  templateUrl: './item-unlock-calculator-events.component.html',
  styleUrl: './item-unlock-calculator-sub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, FoldableCardComponent]
})
export class ItemUnlockCalculatorEventsComponent {
  readonly eventSelected = output<IEvent>();

  readonly events: ReadonlyArray<IEvent>;

  constructor() {
    const dataService = inject(DataService);
    this.events = dataService.eventConfig.items;
  }

  onEventSelected(event: IEvent): void {
    this.eventSelected.emit(event);
  }
}
