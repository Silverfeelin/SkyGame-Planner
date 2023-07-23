import { Component } from '@angular/core';
import dayjs from 'dayjs';
import { DateHelper } from 'src/app/helpers/date-helper';
import { IEvent, IEventInstance } from 'src/app/interfaces/event.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less']
})
export class EventsComponent {
  recurring!: Array<IEvent>;
  old!: Array<IEvent>;
  lastInstances: { [eventGuid: string]: IEventInstance | undefined } = {};
  currentEvents: { [eventGuid: string]: boolean } = {};

  constructor(
    private readonly _dataService: DataService
  ) {}

  ngOnInit(): void {
    this.recurring = [];
    this.old = [];

    this._dataService.eventConfig.items.forEach(event => {
      if (event.recurring) {
        this.recurring.push(event);
      } else {
        this.old.push(event);
      }

      if (event.instances) {
        const instances = [...event.instances];
        const reverseInstances = [...instances].reverse();

        // Mark active if one of the last two instances is active.
        this.currentEvents[event.guid] = instances.slice(-2).find(i => DateHelper.isActive(i.date, i.endDate)) ? true : false;

        // Find last instance based on event.date.
        const now = dayjs();
        const lastInstance = instances.find(i => DateHelper.isActive(i.date, i.endDate)) ?? reverseInstances.find(i => i.date.isBefore(now));
        this.lastInstances[event.guid] = lastInstance;
      }
    });

    this.old.reverse();
  }
}
