/**
 * Public barrel for atmospheric shared widgets (Phase 0).
 *
 * Phase 1 / Phase 2 section agents import their widgets from this barrel:
 *
 * ```ts
 * import { SpiritCardComponent } from '@app/components/shared/shared-widgets';
 * ```
 */

export { EmptyStateComponent } from './empty-state/empty-state.component';

export { DraftWarningComponent } from './draft-warning/draft-warning.component';

export { CheckboxComponent, type CheckboxSize } from './checkbox/checkbox.component';

export { FoldableCardComponent } from './foldable-card/foldable-card.component';

export { IconPickerComponent } from './icon-picker/icon-picker.component';

export { QuickActionsComponent } from './quick-actions/quick-actions.component';
export { QuickActionsService } from './quick-actions/quick-actions.service';

export { TabsComponent } from './tabs/tabs.component';
export { TabDirective } from './tabs/tab.directive';

export {
  SpiritCardComponent,
  type SpiritCardOptions,
  type SpiritCardSection
} from '../spirit/spirit-card/spirit-card.component';

export {
  SpiritTreeComponent,
  type SpiritTreeNodeClickEvent
} from '../spirit/spirit-tree/spirit-tree.component';

export {
  NodeComponent,
  type NodeAction,
  type NodePosition
} from '../spirit/node/node.component';

export {
  ReturningSpiritCardComponent,
  type ReturningSpiritCardOptions,
  type ReturningSpiritCardSection
} from '../spirit/returning-spirit-card/returning-spirit-card.component';

export {
  SeasonCardComponent,
  type SeasonCardOptions,
  type SeasonCardSection
} from '../season/season-card/season-card.component';

export {
  EventCardComponent,
  type EventCardOptions,
  type EventCardSection
} from '../event/event-card/event-card.component';

export { RealmConstellationComponent } from '../realm/constellation/realm-constellation.component';

export { IapCardComponent } from '../shop/iap-card/iap-card.component';

export {
  ItemListComponent,
  type ItemListNodeClickEvent
} from '../item/item-list/item-list.component';

export {
  ItemGridLayoutComponent,
  type ItemClickEvent
} from '../item/grid/item-grid-layout.component';

export { ItemFiltersComponent } from '../item/filters/item-filters.component';

export {
  DailyCardComponent,
  type DailyCardOptions,
  type DailyCardSection
} from '../daily/daily-card/daily-card.component';

export { DailyTaskComponent } from '../daily/daily-task/daily-task.component';

export { DailyCheckinComponent } from '../daily/daily-checkin/daily-checkin.component';
