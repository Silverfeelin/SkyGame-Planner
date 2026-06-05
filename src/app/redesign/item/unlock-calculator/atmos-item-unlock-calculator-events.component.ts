import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { IEvent } from 'skygame-data';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-atmos-item-unlock-calculator-events',
  templateUrl: './atmos-item-unlock-calculator-events.component.html',
  styleUrl: './atmos-item-unlock-calculator-sub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AtmosItemUnlockCalculatorEventsComponent {
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
