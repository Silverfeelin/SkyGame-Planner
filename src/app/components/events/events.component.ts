import { Component } from '@angular/core';
import { IEvent, IEventInstance } from 'src/app/interfaces/event.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less']
})
export class EventsComponent {
  events!: Array<IEvent>;

  years: Array<number> = [];
  yearMap!: { [year: number]: Array<IEventInstance> };

  constructor(
    private readonly _dataService: DataService
  ) {
    this.events = _dataService.eventConfig.items;
  }

  ngOnInit(): void {
    this.yearMap = {};
    for (let iEvent = this.events.length -1; iEvent >= 0; iEvent--) {
      const event = this.events[iEvent];

      event.instances?.forEach((instance, iInstance) => {
        const year = (instance.date as Date).getFullYear();
        if (!this.yearMap[year]) {
          this.years.push(year);
          this.yearMap[year] = [];
        }

        this.yearMap[year].push(instance);
      });
    }

    // sort yearMap items by date
    this.years.forEach(year => {
      this.yearMap[year].sort((a, b) => { return (b.date as Date).getTime() - (a.date as Date).getTime()});
    });

    this.years.sort((a, b) => { return b - a });
  }
}
