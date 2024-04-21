import { NavigationExtras, Params } from '@angular/router';
import { NodeHelper } from './node-helper';
import { IItem } from '../interfaces/item.interface';
import { INode } from '../interfaces/node.interface';
import { DateTime } from 'luxon';

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
    if (item.listNodes?.length) {
      return this.getItemSourceFromListNodes(item);
    } else if (item.nodes?.length || item.hiddenNodes?.length) {
      return this.getItemSourceFromNodes(item);
    } else if (item.iaps?.length) {

    }

    return undefined;
  }

  private static getItemSourceFromListNodes(item: IItem): INavigationTarget | undefined {
    if (!item.listNodes?.length) { return undefined; }

    // Find shop in priority of unlocked > permanent > last appearance.
    const node = item.listNodes.find(n => n.unlocked)
      || item.listNodes.find(n => n?.itemList?.shop?.permanent)
      || item.listNodes.at(-1);
    if (!node) { return undefined; }

    const shop = node.itemList.shop!;
    const nav: NavigationExtras = { queryParams: { highlightNode: node.guid }};
    if (shop.permanent) { return { route: ['/shop'], extras: nav }; }
    if (shop.event) { return { route: ['/event-instance', shop.event.guid], extras: nav }; }
    if (shop.season) { return { route: ['/season', shop.season.guid], extras: nav }; }
    return undefined;
  }

  private static getItemSourceFromNodes(item: IItem): INavigationTarget | undefined {
    const nodes = [ ...(item.nodes || []), ...(item.hiddenNodes || []) ];
    if (!nodes.length) { return undefined; }

    let lastNode: INode | undefined;
    let lastDate: DateTime = DateTime.fromFormat('2000-01-01', 'yyyy-MM-dd');
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
        : DateTime.fromFormat('2000-01-02', 'yyyy-MM-dd');

      if (date < lastDate) { continue; }
      lastDate = date;
      lastNode = node;
    }

    if (!lastNode) { return undefined; }
    const tree = NodeHelper.getRoot(lastNode)?.spiritTree;
    const extras: NavigationExtras = { queryParams: { highlightItem: item.guid }};

    const spirit = tree?.spirit ?? tree?.ts?.spirit ?? tree?.visit?.spirit;
    if (tree?.eventInstanceSpirit) { return { route: ['/event-instance', tree.eventInstanceSpirit.eventInstance!.guid], extras }; }
    if (spirit) { return { route: ['/spirit', spirit.guid], extras }; }
    return undefined;
  }

  private static getItemSourceFromIap(item: IItem): INavigationTarget | undefined {
    if (!item.iaps?.length) { return undefined; }

    // Find shop in priority of unlocked > permanent > last appearance.
    const iap = item.iaps.find(iap => iap.bought)
      || item.iaps.find(iap => iap?.shop?.permanent)
      || item.iaps.at(-1);
    const shop = iap?.shop;
    if (!shop) { return undefined; }

    const nav: NavigationExtras = { queryParams: { highlightIap: iap?.guid }};
    if (shop?.permanent) { return { route: ['/shop'], extras: nav }; }
    if (shop?.event) { return { route: ['/event-instance', shop.event.guid], extras: nav }; }
    if (shop?.season) { return { route: ['/season', shop.season.guid], extras: nav }; }
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
    url.searchParams.forEach((v, k) => params[k] = v);
    return params;
  }
}
