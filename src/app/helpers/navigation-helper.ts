import { NavigationExtras } from '@angular/router';
import { NodeHelper } from './node-helper';
import { IItem } from '../interfaces/item.interface';

export interface INavigationTarget {
  route: Array<any>;
  extras?: NavigationExtras;
}

export class NavigationHelper {
  /** Navigates to the source of the given item. */
  static getItemSource(item: IItem): INavigationTarget | undefined {
    if (item.nodes?.length) {
      // Find spirit from last appearance of item.
      const tree = NodeHelper.getRoot(item.nodes.at(-1))?.spiritTree;
      const extras: NavigationExtras = { queryParams: { highlightItem: item.guid }};

      const spirit = tree?.spirit ?? tree?.ts?.spirit ?? tree?.visit?.spirit;
      if (tree?.eventInstanceSpirit) {
        return { route: ['/event-instance', tree.eventInstanceSpirit.eventInstance!.guid], extras };
      } else if (spirit) {
        return { route: ['/spirit', spirit.guid], extras };
      }
    } else if (item.iaps?.length) {
      // Find shop in priority of unlocked > permanent > last appearance.
      const iap = item.iaps.find(iap => iap.bought)
        || item.iaps.find(iap => iap?.shop?.permanent)
        || item.iaps.at(-1);
      const shop = iap?.shop;
      const nav: NavigationExtras = { queryParams: { highlightIap: iap?.guid }};
      if (shop?.permanent) {
        return { route: ['/shop'], extras: nav };
      } else if (shop?.event) {
        return { route: ['/event-instance', shop.event.guid], extras: nav };
      } else if (shop?.season) {
        return { route: ['/season', shop.season.guid], extras: nav };
      }
    }

    return undefined;
  }
}
