import JSON5 from 'json5';
import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { forkJoin, ReplaySubject, Subscription } from 'rxjs';
import { IConfig, IGuid } from '../interfaces/base.interface';
import { IArea, IAreaConfig } from '../interfaces/area.interface';
import { ICandleConfig } from '../interfaces/candle.interface';
import { IConnectionConfig } from '../interfaces/connection.interface';
import { ISpiritTree, ISpiritTreeConfig } from '../interfaces/spirit-tree.interface';
import { IEventConfig } from '../interfaces/event.interface';
import { IItem, IItemConfig } from '../interfaces/item.interface';
import { INode, INodeConfig } from '../interfaces/node.interface';
import { IQuestConfig } from '../interfaces/quest.interface';
import { IRealmConfig } from '../interfaces/realm.interface';
import { ISeasonConfig } from '../interfaces/season.interface';
import { IShop, IShopConfig } from '../interfaces/shop.interface';
import { ISpirit, ISpiritConfig, SpiritType } from '../interfaces/spirit.interface'
import { ITravelingSpiritConfig } from '../interfaces/traveling-spirit.interface';
import { IWingedLight, IWingedLightConfig } from '../interfaces/winged-light.interface';
import moment, { Moment } from 'moment';
import { DateHelper } from '../helpers/date-helper';
import { StorageService } from './storage.service';
import { IReturningSpiritsConfig } from '../interfaces/returning-spirits.interface';
import { IIAP } from '../interfaces/iap.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  areaConfig!: IAreaConfig;
  candleConfig!: ICandleConfig;
  connectionConfig!: IConnectionConfig;
  eventConfig!: IEventConfig;
  itemConfig!: IItemConfig;
  nodeConfig!: INodeConfig;
  questConfig!: IQuestConfig;
  realmConfig!: IRealmConfig;
  seasonConfig!: ISeasonConfig;
  shopConfig!: IShopConfig;
  spiritConfig!: ISpiritConfig;
  spiritTreeConfig!: ISpiritTreeConfig;
  travelingSpiritConfig!: ITravelingSpiritConfig;
  returningSpiritsConfig!: IReturningSpiritsConfig;
  wingedLightConfig!: IWingedLightConfig;

  guidMap = new Map<string, IGuid>();

  readonly onData = new ReplaySubject<void>();

  constructor(
    private readonly _httpClient: HttpClient,
    private readonly _storageService: StorageService
  ) {
    this.loadData().add(() => { this.exposeData(); });
  }

  private loadData(): Subscription {
    const get = (asset: string) => this._httpClient.get(`assets/data/${asset}`, { responseType: 'text' });

    return forkJoin({
      areaConfig: get('areas.json'),
      candleConfig: get('candles.json'),
      connectionConfig: get('connections.json'),
      eventConfig: get('events.json'),
      itemConfig: get('items.json'),
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
      wingedLightConfig: get('winged-lights.json')
    }).subscribe({
      next: (data:  {[k: string]: string}) => { this.onConfigs(data); },
      error: e => console.error(e)
    });
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
    console.log(`Loaded ${configArray.length} configs.`);

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
      })
    });
  }

  private initializeSeasons(): void {
    this.seasonConfig.items.forEach((season, i) => {
      season.number = i + 1;
      season.start = DateHelper.fromString(season.start as string)!;
      season.end = DateHelper.fromString(season.end as string)!;

      // Map Spirits to Seasons.
      season.spirits?.forEach((spirit, si) => {
        spirit = this.guidMap.get(spirit as any) as ISpirit;
        season.spirits![si] = spirit;
        spirit.season = season;
      });
    });
  }

  private initializeSpirits(): void {
    this.spiritConfig.items.forEach(spirit => {
      // Map spirits to spirit tree.
      if (spirit.tree) {
        const tree = this.guidMap.get(spirit.tree as any) as ISpiritTree;
        tree.spirit = spirit;
        spirit.tree = tree;
      }
    });
  }

  private initializeTravelingSpirits(): void {
    const tsCounts: {[key: string]: number} = {};
    this.travelingSpiritConfig.items.forEach((ts, i) => {
      // Initialize dates
      ts.date = DateHelper.fromInterface(ts.date)!;
      ts.endDate = DateHelper.fromInterface(ts.endDate)
        ?? moment(ts.date).add(3, 'day').toDate();

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
      rs.date = DateHelper.fromInterface(rs.date)!;
      rs.endDate = DateHelper.fromInterface(rs.endDate)!;

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
        // Map Constellation to Node.
        const node = this.guidMap.get(spiritTree.node as any) as INode;
        spiritTree.node = node;
        node.spiritTree = spiritTree;
        this.initializeNode(node);
    })
  }

  private initializeNode(node: INode, prev?: INode): INode {
    const getNode = (guid: string) => {
      const v = this.guidMap.get(guid) as INode;
      return this.initializeNode(v, node);
    }

    if (prev) { node.prev = prev; }
    if (typeof node.n === 'string') { node.n = getNode(node.n); }
    if (typeof node.nw === 'string') { node.nw = getNode(node.nw); }
    if (typeof node.ne === 'string') { node.ne = getNode(node.ne); }

    if (typeof node.item === 'string') {
      const item = this.guidMap.get(node.item as any) as IItem;
      if (!item) { console.error('Item not found', node.item); }
      node.item = item;
      item.nodes ??= [];
      item.nodes.push(node);
      this.initializeItem(item);
    }

    node.unlocked = this._storageService.unlocked.has(node.guid);
    return node;
  }

  private initializeItem(item: IItem): void {
    item.unlocked = this._storageService.unlocked.has(item.guid);
  }

  private initializeEvents(): void {
    this.eventConfig.items.forEach(event => {
      event.instances?.forEach((eventInstance, iInstance) => {
        this.registerGuid(eventInstance);
        eventInstance.number = iInstance + 1;

        // Initialize dates
        eventInstance.date = DateHelper.fromInterface(eventInstance.date)!;
        eventInstance.endDate = DateHelper.fromInterface(eventInstance.endDate)!;

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

        iap.bought = this._storageService.unlocked.has(iap.guid);

        iap.items?.forEach((itemGuid, iItem) => {
          const item = this.guidMap.get(itemGuid as any) as IItem;
          if (!item) { console.error('Item not found', itemGuid); }
          iap.items![iItem] = item;
          item.iaps ??= [];
          item.iaps.push(iap);
        });
      });
    });
  }

  private exposeData(): void {
    (window as any).skyData = {
      areaConfig: this.areaConfig,
      candleConfig: this.candleConfig,
      connectionConfig: this.connectionConfig,
      spiritTreeConfig: this.spiritTreeConfig,
      eventConfig: this.eventConfig,
      itemConfig: this.itemConfig,
      nodeConfig: this.nodeConfig,
      questConfig: this.questConfig,
      realmConfig: this.realmConfig,
      seasonConfig: this.seasonConfig,
      shopConfig: this.shopConfig,
      spiritConfig: this.spiritConfig,
      travelingSpiritConfig: this.travelingSpiritConfig,
      returningSpiritsConfig: this.returningSpiritsConfig,
      wingedLightConfig: this.wingedLightConfig
    };
    (window as any).skyGuids = this.guidMap;
    console.log('To view loaded data, see `skyData`.');
  }

  // #region GUIDs

  private initializeGuids(configs: Array<IConfig<IGuid>>): void {
    for (const config of configs) {
      config.items.forEach(v => this.registerGuid(v));
    }
  }

  private registerGuid(obj: IGuid): void {
    if (!obj.guid) { throw new Error(`GUID not defined on: ${JSON.stringify(obj)}`); }
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
