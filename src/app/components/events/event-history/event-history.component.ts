import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableColumnDirective } from '@app/components/table/table-column/table-column.directive';
import { TableHeaderDirective } from '@app/components/table/table-column/table-header.directive';
import { TableComponent } from '@app/components/table/table.component';
import { DataService } from '@app/services/data.service';
import { DateTime } from 'luxon';
import { DateTimePipe } from "../../../pipes/date-time.pipe";
import { RouterLink } from '@angular/router';
import { IEvent, IEventInstance } from 'skygame-data';

interface IRow {
  event: IEvent;
  instance: IEventInstance;
  date: DateTime;
  endDate: DateTime;
  active: boolean;
  duration: number;
}

@Component({
    selector: 'app-event-history',
    imports: [RouterLink, TableComponent, TableHeaderDirective, TableColumnDirective, DateTimePipe],
    templateUrl: './event-history.component.html',
    styleUrl: './event-history.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventHistoryComponent {
  rows: Array<IRow>;
  now = DateTime.now();

  constructor(
    private readonly _dataService: DataService
  ) {
    const instances = this._dataService.eventConfig.items.flatMap(e => e.instances || []);
    instances.sort((a, b) => b.date.toMillis() - a.date.toMillis());

    this.rows = instances.map(i => ({
      event: i.event,
      instance: i,
      date: i.date,
      endDate: i.endDate,
      active: i.date <= this.now && i.endDate >= this.now,
      duration: Math.ceil(i.endDate.diff(i.date, 'days').days)
    }));
  }
}
