import { parse as jsoncParse} from 'jsonc-parser';
import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { catchError, forkJoin, Observable, of, ReplaySubject, tap } from 'rxjs';
import { DateHelper } from '../helpers/date-helper';
import { NodeHelper } from '../helpers/node-helper';
import { CostHelper } from '../helpers/cost-helper';
import { ItemHelper } from '../helpers/item-helper';
import { IOutfitRequestConfig } from '../interfaces/outfit-request.interface';
import { ArrayHelper } from '../helpers/array-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { IArea, IEvent, IGuid, IIAP, IItem, IItemList, IMapShrine, INode, IRealm, ISeason, IShop, ISkyData, ISpecialVisit, ISpirit, ISpiritTree, ISpiritTreeTier, ITravelingSpirit, IWingedLight, SkyDataResolver } from 'skygame-data';
import { environment } from 'src/environments/environment';
import { AssetUrlHelper } from '@app/helpers/asset-url-helper';
import { TranslationService } from './translation.service';
import { Language } from '@app/services/translation.service';

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
    private readonly _httpClient: HttpClient,
    private readonly _translationService: TranslationService
  ) { }

  loadData(): Observable<{[k: string]: string}> {
    const get = (asset: string) => {
      return this._httpClient.get(`assets/data/${asset}`, { headers: { 'ngsw-bypass': '' }, responseType: 'text' });
    }
    const getI18nGameData = (lang: string) => {
      return this._httpClient.get(`assets/i18n/game-data/${lang}.json`, { headers: { 'ngsw-bypass': '' }, responseType: 'text' })
        .pipe(catchError(() => of('{}')));
    }

    const currentLang = this._translationService.currentLanguage();

    const useBypassHeaders = !environment.urls.everything.startsWith('http');
    const headers = useBypassHeaders ? { 'ngsw-bypass': '' } : undefined;
    const $everything = this._httpClient.get(environment.urls.everything, {
      headers, responseType: 'text'
    });

    return forkJoin({
      everything: $everything,
      outfitRequestConfig: get('outfit-requests.json'),
      gameDataI18n: getI18nGameData(currentLang),
    }).pipe(tap(data => {
      const parsed = SkyDataResolver.parse(data.everything);
      if (environment.assetRewrite) {
        for (const item of parsed.items.items) { item.icon = AssetUrlHelper.toLocal(item.icon); }
        for (const season of parsed.seasons.items) { season.iconUrl = AssetUrlHelper.toLocal(season.iconUrl); }
      }
      const resolved = SkyDataResolver.resolve(parsed);
      this.onConfigs(resolved, data, data.gameDataI18n);
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

  private onConfigs(data: ISkyData, configs: {[k: string]: string}, gameDataI18n?: string): void {
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

    // Patch item, spirit, and season names based on current language
    this.patchLocalizedData(gameDataI18n);

    // Register all GUIDs.
    this.initializeGuids(configArray);
    console.debug(`Loaded ${configArray.length} configs.`);

    // Create object references.
    this.initializeOutfitRequests();

    this.onData.next();
    this.onData.complete();
  }

  private patchLocalizedData(gameDataI18n?: string): void {
    if (!gameDataI18n) return;

    const language = this._translationService.currentLanguage();
    let translations: any = {};

    try {
      if (language === 'vi') {
        const jsonString = gameDataI18n;
        translations = JSON.parse(jsonString);
      } else if (language === 'en') {
        const jsonString = gameDataI18n;
        translations = JSON.parse(jsonString);
      }
    } catch (e) {
      console.error('Failed to parse gameData I18n', e);
    }

    // Patch items
    if (translations.items) {
      for (const item of this.itemConfig.items) {
        if (translations.items[item.guid]) {
          item.name = translations.items[item.guid];
        }
      }
    }

    // Patch spirits
    if (translations.spirits) {
      for (const spirit of this.spiritConfig.items) {
        if (translations.spirits[spirit.guid]) {
          spirit.name = translations.spirits[spirit.guid];
        }
      }
    }

    // Patch seasons
    if (translations.seasons) {
      for (const season of this.seasonConfig.items) {
        if (translations.seasons[season.guid]) {
          season.name = translations.seasons[season.guid];
        }
      }
    }

    // Patch areas
    if (translations.areas) {
      for (const area of this.areaConfig.items) {
        if (translations.areas[area.guid]) {
          area.name = translations.areas[area.guid];
        }
      }
    }

    // Patch realms
    if (translations.realms) {
      for (const realm of this.realmConfig.items) {
        if (translations.realms[realm.guid]) {
          realm.name = translations.realms[realm.guid];
        }
      }
    }
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
