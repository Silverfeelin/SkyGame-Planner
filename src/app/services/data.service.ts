import { parse as jsoncParse} from 'jsonc-parser';
import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { forkJoin, Observable, ReplaySubject, tap } from 'rxjs';
import { DateHelper } from '../helpers/date-helper';
import { NodeHelper } from '../helpers/node-helper';
import { CostHelper } from '../helpers/cost-helper';
import { ItemHelper } from '../helpers/item-helper';
import { IOutfitRequestConfig } from '../interfaces/outfit-request.interface';
import { ArrayHelper } from '../helpers/array-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { IArea, IEvent, IGuid, IIAP, IItem, IItemList, IMapShrine, INode, IRealm, ISeason, IShop, ISpecialVisit, ISpirit, ISpiritTree, ISpiritTreeTier, ITravelingSpirit, IWingedLight, SkyDataResolver } from 'skygame-data';
import { ISkyData } from 'skygame-data/dist/interfaces/sky-data.interface';

export interface ITrackables {
  unlocked?: ReadonlySet<string>;
  wingedLights?: ReadonlySet<string>;
  favourites?: ReadonlySet<string>;
  gifted?: ReadonlySet<string>;
}

interface IConfig<T> {
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  areaConfig!: IConfig<IArea>;
  eventConfig!: IConfig<IEvent>;
  itemConfig!: IConfig<IItem>;
  itemListConfig!: IConfig<IItemList>;
  mapShrineConfig!: IConfig<IMapShrine>;
  nodeConfig!: IConfig<INode>;
  realmConfig!: IConfig<IRealm>;
  seasonConfig!: IConfig<ISeason>;
  shopConfig!: IConfig<IShop>;
  iapConfig!: IConfig<IIAP>;
  spiritConfig!: IConfig<ISpirit>;
  spiritTreeConfig!: IConfig<ISpiritTree>;
  spiritTierConfig!: IConfig<ISpiritTreeTier>;
  travelingSpiritConfig!: IConfig<ITravelingSpirit>;
  returningSpiritsConfig!: IConfig<ISpecialVisit>;
  wingedLightConfig!: IConfig<IWingedLight>;
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

    const $everything = this._httpClient.get('/assets/skygame-data/everything.json', {
      headers: { 'ngsw-bypass': '' }, responseType: 'text'
    });

    return forkJoin({
      everything: $everything,
      outfitRequestConfig: get('outfit-requests.json'),
    }).pipe(tap(data => {
      const parsed = SkyDataResolver.parse(data.everything);
      const resolved = SkyDataResolver.resolve(parsed);
      this.onConfigs(resolved, data);
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

  private onConfigs(data: ISkyData, configs: {[k: string]: string}): void {
    // Deserialize configs.
    const configArray = Object.keys(configs).filter(k => k !== 'everything').map(k => {
      const parsed = jsoncParse(configs[k]);
      (this as any)[k] = parsed; // Map all configs to their property.
      return parsed;
    });

    this.guidMap = data.guids;
    this.itemIdMap = data.itemIds;

    this.areaConfig = data.areas;
    this.eventConfig = data.events;
    this.itemConfig = data.items;
    this.itemListConfig = data.itemLists;
    this.mapShrineConfig = data.mapShrines;
    this.nodeConfig = data.nodes;
    this.realmConfig = data.realms;
    this.seasonConfig = data.seasons;
    this.shopConfig = data.shops;
    this.iapConfig = data.iaps;
    this.spiritConfig = data.spirits;
    this.spiritTreeConfig = data.spiritTrees;
    this.spiritTierConfig = data.spiritTreeTiers;
    this.travelingSpiritConfig = data.travelingSpirits;
    this.returningSpiritsConfig = data.specialVisits;
    this.wingedLightConfig = data.wingedLights;

    // Register all GUIDs.
    this.initializeGuids(configArray);
    console.debug(`Loaded ${configArray.length} configs.`);

    // Create object references.
    this.initializeOutfitRequests();

    this.onData.next();
    this.onData.complete();
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
    (window as any).TreeHelper = TreeHelper;
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
}
