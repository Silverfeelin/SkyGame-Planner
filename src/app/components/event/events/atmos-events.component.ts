import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DateTime } from 'luxon';
import { IEvent, IEventInstance } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { DateHelper } from '@app/helpers/date-helper';
import { AtmosEventCardComponent } from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosEventQuickActionsComponent } from '../quick-actions/atmos-event-quick-actions.component';

interface IEventRow {
  event: IEvent;
  instance?: IEventInstance;
}

@Component({
  selector: 'app-atmos-events',
  templateUrl: './atmos-events.component.html',
  styleUrl: './atmos-events.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmosEventCardComponent, AtmosEventQuickActionsComponent]
})
export class AtmosEventsComponent {
  private readonly _dataService = inject(DataService);

  readonly recurring = computed<ReadonlyArray<IEventRow>>(() => this._buildRows().recurring);
  readonly old = computed<ReadonlyArray<IEventRow>>(() => this._buildRows().old);

  private _buildRowsCache?: { recurring: IEventRow[]; old: IEventRow[] };

  private _buildRows(): { recurring: IEventRow[]; old: IEventRow[] } {
    if (this._buildRowsCache) { return this._buildRowsCache; }

    const recurring: IEventRow[] = [];
    const old: IEventRow[] = [];
    const lastInstances: { [guid: string]: IEventInstance | undefined } = {};

    this._dataService.eventConfig.items.forEach(event => {
      const row: IEventRow = { event };
      if (event.recurring) { recurring.push(row); } else { old.push(row); }

      if (event.instances?.length) {
        const instances = [...event.instances];
        const reverseInstances = [...instances].reverse();
        const now = DateTime.now();
        const lastInstance = DateHelper.getActive(instances)
          ?? reverseInstances.find(i => i.date < now)
          ?? DateHelper.getUpcoming(instances);
        lastInstances[event.guid] = lastInstance;
        row.instance = lastInstance;
      }
    });

    old.sort((a, b) => {
      if (!lastInstances[a.event.guid]) { return 1; }
      if (!lastInstances[b.event.guid]) { return -1; }
      return lastInstances[b.event.guid]!.date.diff(lastInstances[a.event.guid]!.date).as('milliseconds');
    });

    recurring.sort((a, b) => {
      const getLastDateInYear = (event: IEvent) => {
        const lastInstance = lastInstances[event.guid];
        if (!lastInstance) return Infinity;
        return DateTime.fromObject({ month: lastInstance.date.month, day: lastInstance.date.day }).toMillis();
      };
      return getLastDateInYear(a.event) - getLastDateInYear(b.event);
    });

    this._buildRowsCache = { recurring, old };
    return this._buildRowsCache;
  }
}
