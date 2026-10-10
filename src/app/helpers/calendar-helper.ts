import { DateTime } from 'luxon';
import { ITravelingSpirit } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { DateHelper } from './date-helper';

export type CalendarActivityKind = 'season' | 'event' | 'ts' | 'sv';

export interface ICalendarActivity {
  kind: CalendarActivityKind;
  /** Short name, e.g. just the traveling spirit's name. */
  name: string;
  /** Label that stands on its own, e.g. "Traveling Spirit #176: Talented Builder". */
  title: string;
  /** Secondary line, e.g. "Traveling Spirit #176" or the spirits of a special visit. Empty for seasons, whose names already say so. */
  detail: string;
  date: DateTime;
  endDate: DateTime;
  link: Array<string>;
  /** Not in the data yet; projected from the usual schedule. */
  expected?: boolean;
}

export const CALENDAR_ACTIVITY_KINDS: ReadonlyArray<{ kind: CalendarActivityKind; label: string }> = [
  { kind: 'season', label: 'Seasons' },
  { kind: 'event', label: 'Events' },
  { kind: 'ts', label: 'Traveling Spirits' },
  { kind: 'sv', label: 'Special Visits' }
];

/** Traveling Spirits arrive on a Thursday every other week and stay for four days. */
const TS_INTERVAL_DAYS = 14;
const TS_DURATION_DAYS = 4;
const TS_WEEKDAY = 4;

type ActivityData = Pick<DataService, 'seasonConfig' | 'eventConfig' | 'travelingSpiritConfig' | 'returningSpiritsConfig'>;

export class CalendarHelper {
  /** Every season, event instance, traveling spirit and special visit in the data. */
  static getActivities(data: ActivityData): Array<ICalendarActivity> {
    const activities: Array<ICalendarActivity> = [];
    for (const season of data.seasonConfig.items) {
      activities.push({
        kind: 'season', name: season.name, title: season.name, detail: '',
        date: season.date, endDate: season.endDate, link: ['/season', season.guid]
      });
    }
    for (const event of data.eventConfig.items) {
      for (const instance of event.instances ?? []) {
        const name = instance.name ?? event.name;
        activities.push({
          kind: 'event', name, title: name, detail: 'Event',
          date: instance.date, endDate: instance.endDate, link: ['/event-instance', instance.guid]
        });
      }
    }
    for (const ts of data.travelingSpiritConfig.items) {
      activities.push({
        kind: 'ts', name: ts.spirit.name, title: `Traveling Spirit #${ts.number}: ${ts.spirit.name}`, detail: `Traveling Spirit #${ts.number}`,
        date: ts.date, endDate: ts.endDate, link: ['/spirit', ts.spirit.guid]
      });
    }
    for (const visit of data.returningSpiritsConfig.items) {
      const name = visit.name || 'Special Visit';
      const spirits = visit.spirits.map(s => s.spirit?.name).filter(Boolean).join(', ');
      activities.push({
        kind: 'sv', name, title: name, detail: spirits || 'Special Visit',
        date: visit.date, endDate: visit.endDate, link: ['/rs', visit.guid]
      });
    }
    return activities;
  }

  /** Traveling Spirits after the last one in the data, following the usual schedule up to the given date. */
  static getExpectedTravelingSpirits(data: Pick<DataService, 'travelingSpiritConfig'>, until: DateTime): Array<ICalendarActivity> {
    const last = data.travelingSpiritConfig.items
      .reduce<ITravelingSpirit | undefined>((latest, ts) => !latest || ts.date > latest.date ? ts : latest, undefined);
    if (!last) { return []; }

    const expected: Array<ICalendarActivity> = [];
    let number = last.number;
    const lastStart = last.date.setZone(DateHelper.skyTimeZone).startOf('day');
    // Snap to Thursday in case the last visit in the data was shifted.
    let date = lastStart.plus({ days: TS_INTERVAL_DAYS }).set({ weekday: TS_WEEKDAY });
    while (date <= until) {
      number++;
      const name = `Traveling Spirit #${number}`;
      expected.push({
        kind: 'ts', name, title: name, detail: 'Not announced yet', link: ['/ts'], expected: true,
        date, endDate: date.plus({ days: TS_DURATION_DAYS - 1 }).endOf('day')
      });
      date = date.plus({ days: TS_INTERVAL_DAYS });
    }
    return expected;
  }
}
