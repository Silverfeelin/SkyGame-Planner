import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import L from 'leaflet';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { IArea } from 'src/app/interfaces/area.interface';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { MapInstanceService } from 'src/app/services/map-instance.service';
import { IMapInit } from 'src/app/services/map.service';
import { TitleService } from 'src/app/services/title.service';

@Component({
  selector: 'app-realm',
  templateUrl: './realm.component.html',
  styleUrls: ['./realm.component.less'],
  providers: [MapInstanceService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealmComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @ViewChild('divSpiritTrees', { static: false }) divSpiritTrees?: ElementRef;

  realm!: IRealm;

  showMap = false;
  highlightTree?: string;

  spirits: Array<ISpirit> = [];
  spiritCount = 0;
  seasonSpiritCount = 0;
  seasonGuideCount = 0;

  tier1Cost: ICost = {};
  tier1Spent: ICost = {};
  tier1Remaining: ICost = {};
  tier1Pct: ICost = {};
  tier2Cost: ICost = {};
  tier2Spent: ICost = {};
  tier2Remaining: ICost = {};
  tier2Pct: ICost = {};

  map!: L.Map;
  areaLayers: L.LayerGroup = L.layerGroup();
  boundaryLayers: L.LayerGroup = L.layerGroup();
  connectionLayers: L.LayerGroup = L.layerGroup();
  lastMapArea?: IArea;
  showAreas = localStorage.getItem('map.area.markers') === '1';

  private readonly _subscriptions = new SubscriptionBag();

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _mapInstanceService: MapInstanceService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    // Check if the map should be folded or not.
    if (_route.snapshot.queryParamMap.has('map')) {
      this.showMap = _route.snapshot.queryParamMap.get('map') === '1';
    } else {
      this.showMap = localStorage.getItem('realm.map.folded') !== '1';
      this.updateMapUrl(!this.showMap);
    }

    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  ngOnInit(): void {
    this._eventService.itemToggled.subscribe(() => this.calculateTierCosts());
  }

  ngAfterViewInit(): void {
    const mapEl = this.mapContainer.nativeElement.querySelector('.map');
    const options: IMapInit = {
      view: this.realm?.mapData?.position ?? [-270, 270],
      zoom: this.realm?.mapData?.zoom ?? 2,
      zoomPanOptions: { animate: false, duration: 0 }
    };
    this.map = this._mapInstanceService.initialize(mapEl, options);
    this.boundaryLayers.addTo(this.map);
    this.areaLayers.addTo(this.map);
    this.connectionLayers.addTo(this.map);
    this.drawMap();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  onQueryChanged(params: ParamMap): void {
    this.highlightTree = params.get('highlightTree') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.initializeRealm(guid!);
  }

  panToRealm(instant = false): void {
    if (!this.realm?.mapData?.position) { return; }
    const opts = instant ? { animate: false, duration: 0 } : undefined;
    this.map.flyTo(this.realm.mapData.position, this.realm.mapData.zoom ?? 1, opts);
  }

  constellationSpiritClicked(spirit: ISpirit): void {
    this.highlightTree = spirit.tree?.guid;
    if (this.highlightTree && this.divSpiritTrees?.nativeElement) {
      // Scroll to trees
      this.divSpiritTrees.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Scroll to tree
      let tree = this.divSpiritTrees?.nativeElement.querySelector(`app-spirit-tree [data-tree="${spirit.tree?.guid}"]`) as HTMLElement;
      tree && tree.closest('.tree-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this._changeDetectorRef.markForCheck();
  }

  constellationRealmChanged(realm: IRealm): void {
    // Update realm on current page.
    this.initializeRealm(realm.guid);
    document.title = `${realm.name} - Sky Planner`;
    window.history.replaceState(window.history.state, '', `/realm/${realm.guid}`)

    // Navigation causes scroll top.
    //void this._router.navigate(['/realm', realm.guid]);
  }

  private initializeRealm(guid: string): void {
    this.realm = this._dataService.guidMap.get(guid!) as IRealm;
    this._titleService.setTitle(this.realm.name);

    this.spirits = [];
    this.spiritCount = 0;
    this.seasonSpiritCount = 0;
    this.seasonGuideCount = 0;

    this.realm?.areas?.forEach(area => {
      area.spirits?.forEach(spirit => {
        if (spirit.type === 'Regular' || spirit.type === 'Elder') {
          this.spirits.push(spirit);
          this.spiritCount++;
        } else if (spirit.type === 'Season') {
          this.seasonSpiritCount++;
        } else if (spirit.type === 'Guide') {
          this.seasonGuideCount++;
        }
      });
    });

    if (this.realm.elder) {
      this.spirits.push(this.realm.elder);
    }

    this.calculateTierCosts();

    if (this.map) {
      this.drawMap();
      this.panToRealm(false);
    }

    this._changeDetectorRef.markForCheck();
  }

  private calculateTierCosts(): void {
    this.tier1Cost = {}; this.tier1Spent = {}; this.tier1Remaining = {};
    this.tier2Cost = {}; this.tier2Spent = {}; this.tier2Remaining = {};

    this.spirits.forEach(spirit => {
      if (spirit.type === 'Elder') { return; }
      this.addTierCosts(spirit.tree!);
    });

    this.tier1Pct = CostHelper.percentage(this.tier1Spent, this.tier1Cost);
    this.tier2Pct = CostHelper.percentage(this.tier2Spent, this.tier2Cost);

    this._changeDetectorRef.markForCheck();
  }

  private addTierCosts(tree: ISpiritTree): void {
    if (!tree) { return; }
    for (const node of  NodeHelper.allTier(tree.node)) {
      if (typeof node.tier !== 'number') { continue; }

      const cost = node.tier < 2 ? this.tier1Cost : this.tier2Cost;
      const remaining = node.tier < 2 ? this.tier1Remaining : this.tier2Remaining;
      const spent = node.tier < 2 ? this.tier1Spent : this.tier2Spent;

      CostHelper.add(cost!, node);
      node.unlocked || node.item?.unlocked ? CostHelper.add(spent!, node) : CostHelper.add(remaining!, node);
    }
  }

  beforeFoldMap(folded: boolean): void {
    localStorage.setItem('realm.map.folded', folded ? '1' : '0');
    this.updateMapUrl(folded);
  }

  private updateMapUrl(folded: boolean): void {
    const url = new URL(location.href);
    url.searchParams.set('map', folded ? '0' : '1');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  private drawMap(): void {
    this.boundaryLayers.clearLayers();
    this.areaLayers.clearLayers();
    this.connectionLayers.clearLayers();

    if (!this.realm) { return; }
    this.boundaryLayers.addLayer(
      this._mapInstanceService.showRealm(this.realm, { showBoundary: true })
    );

    this.realm?.areas?.forEach(area => {
      this._mapInstanceService.showArea(area, {
        icon: 'location_on_orange',
        onClick: () => { this.updateMapConnections(area); }
      })!;
    });
  }

  private updateMapConnections(area?: IArea): void {
    if (!this.connectionLayers) { return; }
    this.connectionLayers.clearLayers();
    if (!area?.mapData?.position) { return; }

    // Add yellow marker over the selected area.
    this._mapInstanceService.showArea(area, {
      icon: 'location_on_yellow',
      onClick: () => { this.updateMapConnections(undefined); }
    })?.addTo(this.connectionLayers!);

    // Draw areas connected to the selected area.
    area.connections?.forEach(connection => {
      if (!connection.area.mapData?.position) { return; }

      // Add white marker for connected area in another realm.
      if (connection.area.realm !== this.realm) {
        this._mapInstanceService.showArea(connection.area, {
          icon: 'location_on_white',
        })?.addTo(this.connectionLayers!);
      }

      // Draw line.
      const line = L.polyline([area.mapData!.position!, connection.area.mapData.position], {color: '#fff', weight: 1  });
      line.addTo(this.connectionLayers!);
    });
  }
}

