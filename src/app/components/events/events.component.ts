import { Component } from '@angular/core';
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
        const instances = [...event.instances].reverse();
        // find last instance based on event.date before current date
        const now = new Date();
        const lastInstance = instances.find(instance => instance.date < now);
        this.lastInstances[event.guid] = lastInstance;
      }
    });

    this.old.reverse();
  }
}
