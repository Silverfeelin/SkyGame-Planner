import { DateTime } from 'luxon';
import { IGuid, IRealm } from 'skygame-data';
import { DateHelper } from './date-helper';

/** Realm rotation: one realm per day, cycling from the anchor date below. */
const REALM_ANCHOR = '2024-09-30';
const REALM_GUIDS = ['tuaosLljJS', 'mz64Wq0_df', 'VtkTo1WWuD', 'rAjzHXfPpb', 'y-6n1F5E77'];

export class DailyHelper {
  /**
   * Realm hosting today's daily quests.
   * Takes the guid map rather than `DataService` so helpers stay free of service imports.
   */
  static getDailyRealm(guidMap: Map<string, IGuid>): IRealm | undefined {
    const anchor = DateTime.fromFormat(REALM_ANCHOR, 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
    const days = Math.floor(DateTime.now().diff(anchor, 'days').days);
    const guid = REALM_GUIDS[((days % REALM_GUIDS.length) + REALM_GUIDS.length) % REALM_GUIDS.length];
    return guidMap.get(guid) as IRealm | undefined;
  }
}
