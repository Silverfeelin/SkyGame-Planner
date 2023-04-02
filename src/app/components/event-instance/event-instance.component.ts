import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IEventInstance } from 'src/app/interfaces/event.interface';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IShop } from 'src/app/interfaces/shop.interface';
import { DataService } from 'src/app/services/data.service';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-event-instance',
  templateUrl: './event-instance.component.html',
  styleUrls: ['./event-instance.component.less']
})
export class EventInstanceComponent {
  instance!: IEventInstance;
  shops?: Array<IShop>;
  iapNames: { [iapGuid: string]: string | undefined } = {};

  constructor(
    private readonly _dataService: DataService,
    private readonly _debugService: DebugService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _route: ActivatedRoute
  ) {
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
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

    if (!iap) { return; }

    const unlock = !iap.bought;
    unlock ? this.unlockIap(iap) : this.lockIap(iap);

    // Notify listeners.
    iap.items?.forEach((item) => {
      this._eventService.toggleItem(item);
    });
  }

  unlockIap(iap: IIAP): void {
    // Warn about unlocking an IAP that is already unlocked elsewhere.
    if (iap.items?.find(item => item.unlocked)) {
      const confirmed = confirm('This IAP contains an item that is already unlocked. Do you want to continue?');
      if (!confirmed) { return; }
    }

    // Unlock the IAP and items.
    const guids = [iap.guid];
    iap.bought = true;
    iap.items?.forEach(item => {
      item.unlocked = true;
      guids.push(item.guid);
    });

    // Save data.
    this._storageService.add(...guids);
    this._storageService.save();
  }

  lockIap(iap: IIAP): void {
    // Lock the IAP.
    const guids = [iap.guid];
    iap.bought = false;

    // Only remove item if it's not unlocked by another IAP.
    iap.items?.forEach(item => {
      item.unlocked = !!item.iaps?.find(i => i.bought);
      if (!item.unlocked) { guids.push(item.guid); }
    });

    // Save data.
    this._storageService.remove(...guids);
    this._storageService.save();
  }
}
