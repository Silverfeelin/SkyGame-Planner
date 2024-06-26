import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';
import { IEvent, IEventInstance } from 'src/app/interfaces/event.interface';
import { DataService } from 'src/app/services/data.service';
import { EventCardComponent } from '../event-card/event-card.component';
import { NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.less'],
    standalone: true,
    imports: [WikiLinkComponent, RouterLink, MatIcon, NgFor, EventCardComponent]
})
export class EventsComponent {
  recurring!: Array<IEvent>;
  old!: Array<IEvent>;
  lastInstances: { [eventGuid: string]: IEventInstance | undefined } = {};
  eventMap: { [eventGuid: string]: IEvent } = {};

  constructor(
    private readonly _dataService: DataService
  ) {}

  ngOnInit(): void {
    this.recurring = [];
    this.old = [];

    this._dataService.eventConfig.items.forEach(event => {
      this.eventMap[event.guid] = event;

      if (event.recurring) {
        this.recurring.push(event);
      } else {
        this.old.push(event);
      }

      if (event.instances) {
        const instances = [...event.instances];
        const reverseInstances = [...instances].reverse();

        // Find last instance based on event.date.
        const now = DateTime.now();
        const lastInstance = DateHelper.getActive(instances) ?? reverseInstances.find(i => i.date < now) ?? DateHelper.getUpcoming(instances);
        this.lastInstances[event.guid] = lastInstance;
      }
    });

    // Sort past events by last instance date.
    this.old.sort((a, b) => {
      if (!this.lastInstances[a.guid]) { return 1; }
      if (!this.lastInstances[b.guid]) { return -1; }
      return this.lastInstances[b.guid]!.date.diff(this.lastInstances[a.guid]!.date).as('milliseconds');
    });
  }
}
