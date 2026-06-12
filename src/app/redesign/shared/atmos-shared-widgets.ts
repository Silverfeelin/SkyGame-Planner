/**
 * Public barrel for atmospheric shared widgets (Phase 0).
 *
 * Phase 1 / Phase 2 section agents import their widgets from this barrel:
 *
 * ```ts
 * import { AtmosSpiritCardComponent } from '@app/redesign/shared/atmos-shared-widgets';
 * ```
 */

export { AtmosEmptyStateComponent } from './empty-state/atmos-empty-state.component';

export { AtmosDraftWarningComponent } from './draft-warning/atmos-draft-warning.component';

export {
  AtmosSpiritCardComponent,
  type AtmosSpiritCardOptions,
  type AtmosSpiritCardSection
} from '../spirit/spirit-card/atmos-spirit-card.component';

export {
  AtmosSpiritTreeComponent,
  type AtmosSpiritTreeNodeClickEvent
} from '../spirit/spirit-tree/atmos-spirit-tree.component';

export {
  AtmosNodeComponent,
  type AtmosNodeAction,
  type AtmosNodePosition
} from '../spirit/node/atmos-node.component';

export {
  AtmosReturningSpiritCardComponent,
  type AtmosReturningSpiritCardOptions,
  type AtmosReturningSpiritCardSection
} from '../spirit/returning-spirit-card/atmos-returning-spirit-card.component';

export {
  AtmosSeasonCardComponent,
  type AtmosSeasonCardOptions,
  type AtmosSeasonCardSection
} from '../season/season-card/atmos-season-card.component';

export {
  AtmosEventCardComponent,
  type AtmosEventCardOptions,
  type AtmosEventCardSection
} from '../event/event-card/atmos-event-card.component';

export { AtmosRealmConstellationComponent } from '../realm/constellation/atmos-realm-constellation.component';

export { AtmosIapCardComponent } from '../shop/iap-card/atmos-iap-card.component';

export {
  AtmosItemListComponent,
  type AtmosItemListNodeClickEvent
} from '../item/item-list/atmos-item-list.component';

export {
  AtmosDailyCardComponent,
  type AtmosDailyCardOptions,
  type AtmosDailyCardSection
} from '../daily/daily-card/atmos-daily-card.component';

export { AtmosDailyTaskComponent } from '../daily/daily-task/atmos-daily-task.component';

export { AtmosDailyCheckinComponent } from '../daily/daily-checkin/atmos-daily-checkin.component';
