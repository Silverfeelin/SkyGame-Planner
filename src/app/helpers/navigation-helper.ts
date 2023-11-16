import { NavigationExtras, Params } from '@angular/router';
import { NodeHelper } from './node-helper';
import { IItem } from '../interfaces/item.interface';
import dayjs, { Dayjs } from 'dayjs';
import { INode } from '../interfaces/node.interface';

export interface INavigationTarget {
  route: Array<any>;
  extras?: NavigationExtras;
}

export class NavigationHelper {
  /** Get a link to navigate to the item detail page. */
  static getItemLink(item: IItem): INavigationTarget {
    return {
      route: ['/item', item.guid],
      extras: {}
    };
  }

  /** Gets a link to navigate to the items page with the item selected. */
  static getItemListLink(item: IItem): INavigationTarget | undefined {
    if (item.type === 'Special' || item.type ==='Spell') { return undefined; }
    return {
      route: ['/item'],
      extras: {
        queryParams: {
          type: item.type,
          item: item.guid
        }
      }
    }
  }

  /** Gets a link to navigates to the source of the given item (i.e. spirit). */
  static getItemSource(item: IItem): INavigationTarget | undefined {
    // Find spirit from last appearance of item.
    if (item.nodes?.length || item.hiddenNodes?.length) {
      const nodes = [ ...(item.nodes || []), ...(item.hiddenNodes || []) ];
      let lastNode: INode | undefined;
      let lastDate = dayjs('2000-1-1');
      for (const node of nodes) {
        // Prioritize unlocked node.
        if (node.unlocked) {
          lastNode = node;
          break;
        }

        const tree = NodeHelper.getRoot(node)?.spiritTree;
        if (!tree) { continue; }

        const date = tree?.eventInstanceSpirit?.eventInstance ? tree.eventInstanceSpirit.eventInstance.date
          : tree?.ts ? tree.ts.date
          : tree?.visit ? tree.visit.return.date
          : dayjs('2000-1-2');

        if (date.diff(lastDate) < 0) { continue; }
        lastDate = date;
        lastNode = node;
      }

      if (!lastNode) { return undefined; }
      const tree = NodeHelper.getRoot(lastNode)?.spiritTree;
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

  static getPreviewLink(item: IItem): INavigationTarget | undefined {
    if (!item.previewUrl) { return undefined; }
    return {
      route: ['/item/field-guide'],
      extras: {
        queryParams: {
          type: item.type,
          item: item.guid
        }
      }
    };
  }

  static getQueryParams(href: string | URL): Params {
    const url = href instanceof URL ? href : new URL(href);
    const params: Params = {};
    for (const [k,v] of url.searchParams.entries()) { params[k] = v; }
    return params;
  }
}
