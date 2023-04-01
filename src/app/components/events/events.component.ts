import { Component } from '@angular/core';
import { IEvent } from 'src/app/interfaces/event.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less']
})
export class EventsComponent {
  recurring!: Array<IEvent>;
  old!: Array<IEvent>;

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
    });

    this.old.reverse();
  }
}
