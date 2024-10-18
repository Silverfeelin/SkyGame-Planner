import { ICost } from '@app/interfaces/cost.interface';

export interface INestingStorageData {
  unlocked: { [guid: string]: INestingStorageDataUnlock | undefined };
}

export interface INestingStorageDataUnlock {
  /* Item quantity */
  q: number;
  /* Legacy item quantity. */
  lq?: number;
  /* Cost of the item at the current quantity, excluding legacy. */
  cost?: ICost;
}

export const nestingStorageKey = 'nesting-workshop';
