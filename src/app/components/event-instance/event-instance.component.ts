import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IEventInstance } from 'src/app/interfaces/event.interface';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IShop } from 'src/app/interfaces/shop.interface';
import { DataService } from 'src/app/services/data.service';
import { DebugService } from 'src/app/services/debug.service';
import { IAPService } from 'src/app/services/iap.service';

@Component({
  selector: 'app-event-instance',
  templateUrl: './event-instance.component.html',
  styleUrls: ['./event-instance.component.less']
})
export class EventInstanceComponent {
  instance!: IEventInstance;
  shops?: Array<IShop>;
  iapNames: { [iapGuid: string]: string | undefined } = {};
  highlightItem?: string;
  highlightIap?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _debugService: DebugService,
    private readonly _iapService: IAPService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }


  onQueryChanged(p: ParamMap): void {
    this.highlightItem = p.get('highlightItem') || undefined;
    this.highlightIap = p.get('highlightIap') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.instance = this._dataService.guidMap.get(guid!) as IEventInstance;
    this.shops = this.instance.shops ? [...this.instance.shops] : undefined;

    // Sort shops to prioritize ones with new items.
    this.shops?.sort((a, b) => {
      const aNew = a.iaps?.filter(iap => !iap.returning).length ?? 0;
      const bNew = b.iaps?.filter(iap => !iap.returning).length ?? 0;
      return bNew - aNew;
    });

    // Loop over all IAPs
    const eventName = this.instance.event?.name;
    if (eventName) {
      this.shops?.forEach(shop => {
        shop.iaps?.forEach(iap => {
          // Remove event name from IAP to save space.
          let name = iap.name?.replace(`${eventName} `, '');
          // Keep event name if a single word is left.
          if (name?.indexOf(' ') === -1) {
            name = eventName.startsWith('Days of ') ? iap.name?.substring(8) : iap.name;
          }
          this.iapNames[iap.guid] = name;
        });
      });
    }
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    if (this._debugService.copyShop) {
      debugger;
      event.stopImmediatePropagation();
      event.preventDefault();
      navigator.clipboard.writeText(iap.shop?.guid ?? '');
      return;
    }

    this._iapService.togglePurchased(iap);
  }
}
