import JSON5 from 'json5';
import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { forkJoin, Observable, ReplaySubject, Subscription, tap } from 'rxjs';
import { IConfig, IGuid } from '../interfaces/base.interface';
import { IArea, IAreaConfig } from '../interfaces/area.interface';
import { ISpiritTree, ISpiritTreeConfig, IRevisedSpiritTree } from '../interfaces/spirit-tree.interface';
import { IEventConfig } from '../interfaces/event.interface';
import { IItem, IItemConfig, ItemType } from '../interfaces/item.interface';
import { INode, INodeConfig } from '../interfaces/node.interface';
import { IQuestConfig } from '../interfaces/quest.interface';
import { IRealmConfig } from '../interfaces/realm.interface';
import { ISeasonConfig } from '../interfaces/season.interface';
import { IShop, IShopConfig } from '../interfaces/shop.interface';
import { ISpirit, ISpiritConfig } from '../interfaces/spirit.interface'
import { ITravelingSpiritConfig } from '../interfaces/traveling-spirit.interface';
import { IWingedLight, IWingedLightConfig } from '../interfaces/winged-light.interface';
import { DateHelper } from '../helpers/date-helper';
import { IReturningSpiritsConfig } from '../interfaces/returning-spirits.interface';
import { IIAP } from '../interfaces/iap.interface';
import { NodeHelper } from '../helpers/node-helper';
import { CostHelper } from '../helpers/cost-helper';
import { ItemHelper } from '../helpers/item-helper';
import { IOutfitRequestConfig } from '../interfaces/outfit-request.interface';
import { IItemList } from '../interfaces/item-list.interface';
import { ArrayHelper } from '../helpers/array-helper';
import { IMapShrine } from '../interfaces/map-shrine.interface';

export interface ITrackables {
  unlocked?: ReadonlySet<string>;
  wingedLights?: ReadonlySet<string>;
  favourites?: ReadonlySet<string>;
  gifted?: ReadonlySet<string>;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  areaConfig!: IAreaConfig;
  eventConfig!: IEventConfig;
  itemConfig!: IItemConfig;
  itemListConfig!: IConfig<IItemList>;
  mapShrineConfig!: IConfig<IMapShrine>;
  nodeConfig!: INodeConfig;
  questConfig!: IQuestConfig;
  realmConfig!: IRealmConfig;
  seasonConfig!: ISeasonConfig;
  shopConfig!: IShopConfig;
  iapConfig!: IConfig<IIAP>;
  spiritConfig!: ISpiritConfig;
  spiritTreeConfig!: ISpiritTreeConfig;
  travelingSpiritConfig!: ITravelingSpiritConfig;
  returningSpiritsConfig!: IReturningSpiritsConfig;
  wingedLightConfig!: IWingedLightConfig;
  outfitRequestConfig!: IOutfitRequestConfig;

  guidMap = new Map<string, IGuid>();
  itemIdMap = new Map<number, IItem>();

  readonly onData = new ReplaySubject<void>();

  constructor(
    private readonly _httpClient: HttpClient
  ) { }

  loadData(): Observable<{[k: string]: string}> {
    const get = (asset: string) => {
      return this._httpClient.get(`assets/data/${asset}`, { headers: { 'ngsw-bypass': '' }, responseType: 'text' });
    }

    return forkJoin({
      areaConfig: get('areas.json'),
      eventConfig: get('events.json'),
      itemConfig: get('items.json'),
      itemListConfig: get('item-lists.json'),
      mapShrineConfig: get('map-shrines.json'),
      nodeConfig: get('nodes.json'),
      questConfig: get('quests.json'),
      realmConfig: get('realms.json'),
      seasonConfig: get('seasons.json'),
      shopConfig: get('shops.json'),
      iapConfig: get('iaps.json'),
      spiritConfig: get('spirits.json'),
      spiritTreeConfig: get('spirit-trees.json'),
      travelingSpiritConfig:  get('traveling-spirits.json'),
      returningSpiritsConfig:  get('returning-spirits.json'),
      wingedLightConfig: get('winged-lights.json'),
      outfitRequestConfig: get('outfit-requests.json'),
    }).pipe(tap(data => {
      this.onConfigs(data);
      this.exposeData();
    }));
  }

  refreshUnlocked(trackables: ITrackables): void {
    const { unlocked, wingedLights, favourites, gifted } = trackables;
    if (unlocked) {
      for (const node of this.nodeConfig.items) {
        node.unlocked = unlocked.has(node.guid);
      }

      for (const item of this.itemConfig.items) {
        item.unlocked = unlocked.has(item.guid) || item.autoUnlocked === true;
      }

      for (const iap of this.iapConfig.items) {
        const hasIap = unlocked.has(iap.guid);
        iap.gifted = hasIap && gifted?.has(iap.guid);
        iap.bought = hasIap && !iap.gifted;
      }

      for (const itemList of this.itemListConfig.items) {
        for (const node of itemList.items) {
          node.unlocked = unlocked.has(node.guid);
        }
      }
    }

    if (favourites) {
      for (const item of this.itemConfig.items) {
        item.favourited = favourites.has(item.guid);
      }
    }

    if (wingedLights) {
      for (const wingedLight of this.wingedLightConfig.items) {
        wingedLight.unlocked = wingedLights.has(wingedLight.guid);
      }
    }
  }

  private onConfigs(configs: {[k: string]: string}): void {
    // Deserialize configs.
    const configArray = Object.keys(configs).map(k => {
      const parsed = JSON5.parse(configs[k]);
      (this as any)[k] = parsed; // Map all configs to their property.
      return parsed;
    });

    // Register all GUIDs.
    this.initializeGuids(configArray);
    console.debug(`Loaded ${configArray.length} configs.`);

    // Create object references.
    this.initializeRealms();
    this.initializeAreas();
    this.initializeSeasons();
    this.initializeSpirits();
    this.initializeTravelingSpirits();
    this.initializeReturningSpirits();
    this.initializeSpiritTrees();
    this.initializeEvents();
    this.initializeShops();
    this.initializeItems();
    this.initializeItemLists();
    this.initializeSeasonItems();
    this.initializeWingedLight();
    this.initializeOutfitRequests();

    if (isDevMode()) {
      this.validate();
    }

    this.onData.next();
    this.onData.complete();
  }

  private initializeRealms(): void {
    this.realmConfig.items.forEach(realm => {
      // Map areas to realms.
      realm.areas?.forEach((area, i) => {
        area = this.guidMap.get(area as any) as IArea;
        realm.areas![i] = area;
        area.realm = realm;
      });

      // Map constellation spirits.
      realm.constellation?.icons?.forEach((icon, i) => {
        const spirit = this.guidMap.get(icon.spirit as any) as ISpirit;
        realm.constellation!.icons![i].spirit = spirit;
      });

      // Map elders
      if (realm.elder) {
        realm.elder = this.guidMap.get(realm.elder as any) as ISpirit;
      }
    });
  }

  private initializeAreas(): void {
    this.areaConfig.items.forEach(area => {
      // Map Spirit to Areas.
      area.spirits?.forEach((spirit, i) => {
        spirit = this.guidMap.get(spirit as any) as ISpirit;
        area.spirits![i] = spirit;
        spirit.area = area;
      });

      // Map Winged Light to Area.
      area.wingedLights?.forEach((wl, i) => {
        wl = this.guidMap.get(wl as any) as IWingedLight;
        area.wingedLights![i] = wl;
        wl.area = area;
      });

      // Map connected areas.
      area.connections?.forEach((c, i) => {
        c.area = this.guidMap.get(c.area as any) as IArea;
      });

      // Map.. Map Shrine to Area.
      area.mapShrines?.forEach((ms, i) => {
        const mapShrine = this.guidMap.get(ms as any) as IMapShrine;
        area.mapShrines![i] = mapShrine;
        mapShrine.area = area;
      });
    });
  }

  private initializeSeasons(): void {
    this.seasonConfig.items.forEach((season, i) => {
      season.number = i + 1;
      season.date = DateHelper.fromStringSky(season.date)!;
      season.endDate = DateHelper.fromStringSky(season.endDate)!.endOf('day');

      // Map Spirits to Season.
      season.spirits?.forEach((spirit, si) => {
        spirit = this.guidMap.get(spirit as any) as ISpirit;
        season.spirits![si] = spirit;
        spirit.season = season;
      });

      // Map Shops to Season
      season.shops?.forEach((shop, si) => {
        shop = this.guidMap.get(shop as any) as IShop;
        season.shops![si] = shop;
        shop.season = season;
      });

      // Map included trees (one-way).
      season.includedTrees?.forEach((tree, ti) => {
        tree = this.guidMap.get(tree as any) as ISpiritTree;
        season.includedTrees![ti] = tree;
      });
    });
  }

  private initializeSpirits(): void {
    this.spiritConfig.items.forEach((spirit, i) => {
      spirit._index = i;

      // Map spirits to spirit tree.
      if (spirit.tree) {
        const tree = this.guidMap.get(spirit.tree as any) as ISpiritTree;
        tree.spirit = spirit;
        spirit.tree = tree;
      }

      // Map past versions of spirit tree.
      if (spirit.treeRevisions) {
        spirit.treeRevisions.forEach((pt, i) => {
          const tree = this.guidMap.get(pt as any) as IRevisedSpiritTree;
          tree.spirit = spirit;
          spirit.treeRevisions![i] = tree;
        });
      }
    });
  }

  private initializeTravelingSpirits(): void {
    const tsCounts: {[key: string]: number} = {};
    this.travelingSpiritConfig.items.forEach((ts, i) => {
      // Initialize dates
      ts.date = DateHelper.fromStringSky(ts.date)!;
      ts.endDate = DateHelper.fromStringSky(ts.endDate)?.endOf('day')
        ?? ts.date.plus({ days: 3 }).endOf('day');

      // Map TS to Spirit.
      const spirit = this.guidMap.get(ts.spirit as any) as ISpirit;
      ts.spirit = spirit;
      spirit.ts ??= [];
      spirit.ts.push(ts);

      tsCounts[spirit.name] ??= 0;
      tsCounts[spirit.name]++;
      ts.number = i+1;
      ts.visit = tsCounts[spirit.name];

      // Map TS to Spirit Tree.
      const tree = this.guidMap.get(ts.tree as any) as ISpiritTree;
      ts.tree = tree;
      tree.ts = ts;
    })
  }

  private initializeReturningSpirits(): void {
    this.returningSpiritsConfig.items.forEach((rs, i) => {
      // Initialize dates
      rs.date = DateHelper.fromInterfaceSky(rs.date)!;
      rs.endDate = DateHelper.fromInterfaceSky(rs.endDate)!.endOf('day');

      // Map RS to Area.
      if (rs.area) {
        const area = this.guidMap.get(rs.area as any) as IArea;
        rs.area = area;
        area.rs ??= [];
        area.rs.push(rs);
      }

      // Map Visits.
      rs.spirits?.forEach((visit, si) => {
        this.registerGuid(visit);

        visit.return = rs;
        // Map Visit to Spirit.
        const spirit = this.guidMap.get(visit.spirit as any) as ISpirit;
        rs.spirits![si].spirit = spirit;
        spirit.returns ??= [];
        spirit.returns.push(visit);

        // Map Visit to Spirit Tree.
        const tree = this.guidMap.get(visit.tree as any) as ISpiritTree;
        rs.spirits![si].tree = tree;
        tree.visit = visit;
      });
    });
  }

  private initializeSpiritTrees(): void {
    this.spiritTreeConfig.items.forEach(spiritTree => {
        // Map Spirit Tree to Node.
        const node = this.guidMap.get(spiritTree.node as any) as INode;
        if (!node) { console.error('Node not found', spiritTree.node); }
        spiritTree.node = node;
        node.spiritTree = spiritTree;
        this.initializeNode(node);
    })
  }

  private initializeNode(node: INode, prev?: INode, root?: INode): INode {
    root ??= node;
    const getNode = (guid: string) => {
      const v = this.guidMap.get(guid) as INode;
      return this.initializeNode(v, node, root ?? node);
    }

    node.root = root;
    if (prev) { node.prev = prev; }
    if (typeof node.n === 'string') { node.n = getNode(node.n); }
    if (typeof node.nw === 'string') { node.nw = getNode(node.nw); }
    if (typeof node.ne === 'string') { node.ne = getNode(node.ne); }

    if (typeof node.item === 'string') {
      const item = this.guidMap.get(node.item as any) as IItem;
      if (!item) { console.error('Node item not found', node, node.item); }
      node.item = item;
      item.nodes ??= [];
      item.nodes.push(node);
    }

    if (node.hiddenItems?.length) {
      node.hiddenItems.forEach((itemGuid, i) => {
        if (typeof itemGuid !== 'string') return;
        const item = this.guidMap.get(itemGuid as any) as IItem;
        if (!item) { console.error('Node hidden item not found', node, itemGuid); }

        node.hiddenItems![i] = item;
        item.hiddenNodes ??= [];
        item.hiddenNodes.push(node);

        // Mark hidden item as unlocked.
        if (node.unlocked) {
          item.unlocked = true;
        }
      });
    }

    return node;
  }

  private initializeEvents(): void {
    this.eventConfig.items.forEach(event => {
      event.instances?.forEach((eventInstance, iInstance) => {
        this.registerGuid(eventInstance);
        eventInstance.number = iInstance + 1;

        // Initialize dates
        eventInstance.date = typeof eventInstance.date === 'string'
          ? DateHelper.fromStringSky(eventInstance.date)!
          : DateHelper.fromInterfaceSky(eventInstance.date)!;
        eventInstance.endDate = typeof eventInstance.endDate === 'string'
          ? DateHelper.fromStringSky(eventInstance.endDate)!.endOf('day')
          : DateHelper.fromInterfaceSky(eventInstance.endDate)!.endOf('day');

        // Map Instance to Event.
        eventInstance.event = event;

        // Map shops to instance.
        eventInstance.shops?.forEach((shop, iShop) => {
          shop = this.guidMap.get(shop as any) as IShop;
          eventInstance.shops![iShop] = shop;
          shop.event = eventInstance;
        });

        // Initialize event spirits.
        eventInstance.spirits?.forEach(eventSpirit => {
          eventSpirit.eventInstance = eventInstance;

          const spirit = this.guidMap.get(eventSpirit.spirit as any) as ISpirit;
          if (!spirit) { console.error( 'Spirit not found', eventSpirit.spirit); }
          eventSpirit.spirit = spirit;
          eventSpirit.spirit.events = [];
          eventSpirit.spirit.events.push(eventSpirit);

          const tree = this.guidMap.get(eventSpirit.tree as any) as ISpiritTree;
          if (!tree) { console.error( 'Tree not found', eventSpirit.tree); }
          eventSpirit.tree = tree;
          tree.eventInstanceSpirit = eventSpirit;
        });
      });
    });
  }

  private initializeShops(): void {
    this.shopConfig.items.forEach(shop => {
      // Map Shop to Spirit.
      if (shop.spirit) {
        const spirit = this.guidMap.get(shop.spirit as any) as ISpirit;
        shop.spirit = spirit;
        spirit.shops ??= [];
        spirit.shops.push(shop);
      }

      shop.iaps?.forEach((iap, iIap) => {
        iap = this.guidMap.get(iap as any) as IIAP;
        shop.iaps![iIap] = iap;
        iap.shop = shop;

        iap.items?.forEach((itemGuid, iItem) => {
          const item = this.guidMap.get(itemGuid as any) as IItem;
          if (!item) { console.error('Item not found', itemGuid); }
          iap.items![iItem] = item;
          item.iaps ??= [];
          item.iaps.push(iap);

          if (iap.bought) {
            item.unlocked = true;
          }
        });
      });

      if (shop.itemList) {
        const itemList = this.guidMap.get(shop.itemList as any) as IItemList;
        shop.itemList = itemList;
        itemList.shop = shop;
      }
    });
  }

  private initializeItems(): void {
    const ids = new Set<number>();
    const types = new Set<string>();
    for (const type in ItemType) { types.add(type); }

    let shouldWarn = false;
    const emoteOrders: { [key: string]: number } = {};
    const emotes: Array<IItem> = [];
    this.itemConfig.items.forEach(item => {
      if (typeof(item.id) === 'number') {
        if (ids.has(item.id)) {
          console.error('Duplicate item ID.', item.id, item);
          shouldWarn = true;
        } else {
          ids.add(item.id);
          this.itemIdMap.set(item.id, item);
        }
      } else {
        console.error('Item ID not defined', item);
        shouldWarn = true;
      }

      if (!item.type || !types.has(item.type)) {
        console.error('Item type not defined.', item);
        shouldWarn = true;
      }

      if (item.type === 'Emote') {
        if (item.level === 1) { emoteOrders[item.name] = item.order ?? 999999; }
        else { emotes.push(item); }
      }

      if (!item.unlocked && item.autoUnlocked) { item.unlocked = true; }
      item.order ??= 999999;
    });

    emotes.forEach(emote => emote.order = emoteOrders[emote.name] ?? emote.order);

    shouldWarn && alert('Misconfigured items. Please report this issue.');
  }

  private initializeItemLists(): void {
    this.itemListConfig.items.forEach(itemList => {
      itemList.items.forEach(itemNode => {
        itemNode.itemList = itemList;

        if (typeof itemNode.item === 'string') {
          const item = this.guidMap.get(itemNode.item as any) as IItem;
          itemNode.item = item;

          item.listNodes ??= [];
          item.listNodes.push(itemNode);
        }
      });
    });
  }

  private initializeSeasonItems(): void {
    for (const season of this.seasonConfig.items) {
      // Spirit items
      for (const spirit of season.spirits ?? []) {
        if (!spirit?.tree?.node) { continue; }
        for (const item of NodeHelper.getItems(spirit.tree.node, true)) {
          item.season = season;
        }
      }

      // IAP items
      for (const shop of season.shops ?? []) {
        for (const iap of shop.iaps ?? []) {
          for (const item of iap.items ?? []) {
            item.season = season;
          }
        }
      }
    }
  }

  private initializeWingedLight(): void {

  }

  private initializeOutfitRequests(): void {
    for (const section of Object.values(this.outfitRequestConfig.backgrounds)) {
      section.backgrounds.forEach(bg => {
        bg.section = section;
      });
    }
  }

  private exposeData(): void {
    (window as any).skyData = {
      areaConfig: this.areaConfig,
      spiritTreeConfig: this.spiritTreeConfig,
      eventConfig: this.eventConfig,
      itemConfig: this.itemConfig,
      itemListConfig: this.itemListConfig,
      nodeConfig: this.nodeConfig,
      questConfig: this.questConfig,
      realmConfig: this.realmConfig,
      seasonConfig: this.seasonConfig,
      shopConfig: this.shopConfig,
      iapConfig: this.iapConfig,
      spiritConfig: this.spiritConfig,
      travelingSpiritConfig: this.travelingSpiritConfig,
      returningSpiritsConfig: this.returningSpiritsConfig,
      wingedLightConfig: this.wingedLightConfig
    };

    (window as any).skyGuids = this.guidMap;
    (window as any).NodeHelper = NodeHelper;
    (window as any).DateHelper = DateHelper;
    (window as any).CostHelper = CostHelper;
    (window as any).ItemHelper = ItemHelper;
    (window as any).ArrayHelper = ArrayHelper;

    const c = 'color:cyan;';
    console.log('To view loaded data, see %cwindow.skyData%c.', c, '');
    console.log('You can also use the helpers %cNodeHelper%c, %cDateHelper%c and %cCostHelper%c.', c, '', c, '', c, '');
  }

  // #region GUIDs

  private initializeGuids(configs: Array<IConfig<IGuid>>): void {
    for (const config of configs) {
      if (!config.items) { return; }
      config.items.forEach(v => this.registerGuid(v));
    }
  }

  private registerGuid(obj: IGuid): void {
    if (!obj.guid) { throw new Error(`GUID not defined on: ${JSON.stringify(obj)}`); }
    if (obj.guid.length !== 10) { console.error('GUID unexpected length:', obj.guid); }
    if (this.guidMap.has(obj.guid)) { throw new Error(`GUID ${obj.guid} already registered!`) }
    this.guidMap.set(obj.guid, obj);
  }

  // #endregion

  // #region Validation

  private validate(): void {
    const wl = new Set<string>(this.areaConfig.items.flatMap(a => a.wingedLights || []).map(w => w.guid));
    const xWl = this.wingedLightConfig.items.filter(w => !wl.has(w.guid));
    if (xWl.length) { console.error('Winged Light not found in areas:', xWl)};
  }

  // #endregion
}
