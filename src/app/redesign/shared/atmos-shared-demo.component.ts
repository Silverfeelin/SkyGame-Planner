import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { DataService } from '@app/services/data.service';
import {
  AtmosEmptyStateComponent,
  AtmosSpiritCardComponent,
  AtmosSpiritTreeComponent,
  AtmosNodeComponent,
  AtmosReturningSpiritCardComponent,
  AtmosSeasonCardComponent,
  AtmosEventCardComponent,
  AtmosRealmConstellationComponent,
  AtmosIapCardComponent,
  AtmosItemListComponent,
  AtmosDailyCardComponent,
  AtmosDailyTaskComponent,
  AtmosDailyCheckinComponent
} from './atmos-shared-widgets';

/**
 * Dev-only showcase that imports every Phase 0 shared widget so the Angular
 * compiler exercises their templates during `ng build`. Not registered in any
 * route — phase agents import the widgets directly from the barrel above.
 */
@Component({
  selector: 'app-atmos-shared-demo',
  template: `
    <app-atmos-empty-state [title]="'Demo'"></app-atmos-empty-state>

    @if (firstSpirit(); as s) {
      <app-atmos-spirit-card [spirit]="s"></app-atmos-spirit-card>
    }
    @if (firstTree(); as t) {
      <app-atmos-spirit-tree [tree]="t"></app-atmos-spirit-tree>
    }
    @if (firstNode(); as n) {
      <app-atmos-node [node]="n"></app-atmos-node>
    }
    @if (firstRs(); as r) {
      <app-atmos-returning-spirit-card [return]="r"></app-atmos-returning-spirit-card>
    }
    @if (firstSeason(); as s) {
      <app-atmos-season-card [season]="s"></app-atmos-season-card>
    }
    @if (firstEvent(); as e) {
      <app-atmos-event-card [event]="e"></app-atmos-event-card>
    }
    @if (firstRealm(); as r) {
      <app-atmos-realm-constellation [realm]="r"></app-atmos-realm-constellation>
    }
    @if (firstIap(); as i) {
      <app-atmos-iap-card [iap]="i"></app-atmos-iap-card>
    }
    @if (firstItemList(); as l) {
      <app-atmos-item-list [itemList]="l"></app-atmos-item-list>
    }

    <app-atmos-daily-card></app-atmos-daily-card>
    <app-atmos-daily-checkin></app-atmos-daily-checkin>
    @if (firstTask(); as t) {
      <app-atmos-daily-task [task]="t"></app-atmos-daily-task>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AtmosEmptyStateComponent,
    AtmosSpiritCardComponent,
    AtmosSpiritTreeComponent,
    AtmosNodeComponent,
    AtmosReturningSpiritCardComponent,
    AtmosSeasonCardComponent,
    AtmosEventCardComponent,
    AtmosRealmConstellationComponent,
    AtmosIapCardComponent,
    AtmosItemListComponent,
    AtmosDailyCardComponent,
    AtmosDailyTaskComponent,
    AtmosDailyCheckinComponent
  ]
})
export class AtmosSharedDemoComponent {
  private readonly _data = inject(DataService);

  readonly firstSpirit = computed(() => this._data.spiritConfig?.items?.[0]);
  readonly firstTree = computed(() => this.firstSpirit()?.tree);
  readonly firstNode = computed(() => this.firstTree()?.node);
  readonly firstSeason = computed(() => this._data.seasonConfig?.items?.[0]);
  readonly firstEvent = computed(() => this._data.eventConfig?.items?.[0]);
  readonly firstRealm = computed(() => this._data.realmConfig?.items?.find(r => r.constellation));
  readonly firstIap = computed(() => this._data.iapConfig?.items?.[0]);
  readonly firstItemList = computed(() => this._data.itemListConfig?.items?.[0]);
  readonly firstRs = computed(() => this._data.returningSpiritsConfig?.items?.[0]);
  readonly firstTask = computed(() => undefined);
}
