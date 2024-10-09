import { Injectable } from '@angular/core';
import { IIAP } from '../interfaces/iap.interface';
import { StorageService } from './storage.service';
import { EventService } from './event.service';
import { CurrencyService } from './currency.service';
import { CostHelper } from '@app/helpers/cost-helper';
import { ICost } from '@app/interfaces/cost.interface';
import { DataService } from './data.service';
import { DateHelper } from '@app/helpers/date-helper';

@Injectable({
  providedIn: 'root'
})
export class IAPService {
  constructor(
    private readonly _currencyService: CurrencyService,
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService
  ) {}

  togglePurchased(iap: IIAP): void { this.toggleIap(iap, false); }
  toggleGifted(iap: IIAP): void { this.toggleIap(iap, true); }
  toggleIap(iap: IIAP, asGift: boolean): void {
    if (!iap) { return; }
    const unlock = asGift ? !iap.gifted : !iap.bought;
    unlock ? this.unlockIap(iap, asGift) : this.lockIap(iap);

    // Notify listeners.
    iap.items?.forEach((item) => {
      this._eventService.itemToggled.next(item);
    });
  }

  unlockIap(iap: IIAP, asGift: boolean): void {
    // Unlock the IAP and items.
    const guids = [iap.guid];
    iap.bought = !asGift;
    iap.gifted = asGift;
    iap.items?.forEach(item => {
      item.unlocked = true;
      guids.push(item.guid);
    });

    // Modify currencies.
    this.modifyCurrencies(iap, true);

    // Save data.
    this._storageService.addUnlocked(...guids);
    asGift ? this._storageService.addGifted(iap.guid) : this._storageService.removeGifted(iap.guid);
  }

  lockIap(iap: IIAP): void {
    // Lock the IAP.
    const guids = [iap.guid];
    iap.bought = false;
    iap.gifted = false;

    // Only remove item if it's not unlocked by another IAP.
    iap.items?.forEach(item => {
      item.unlocked = !!item.iaps?.find(i => i.bought || i.gifted);
      if (!item.unlocked) { guids.push(item.guid); }
    });

    // Modify currencies.
    this.modifyCurrencies(iap, false);

    // Save data.
    this._storageService.removeUnlocked(...guids);
    this._storageService.removeGifted(iap.guid);
  }

  modifyCurrencies(iap: IIAP, unlock: boolean): void {
    if (iap.c || iap.sc) {
      const cost: ICost = { c: iap.c, sc: iap.sc };
      if (!unlock) { CostHelper.invert(cost); }

      const eventInstance = iap.shop?.event;
      let season = iap.shop?.season;

      // Add season currency to ongoing season if this event overlaps an ongoing season.
      if (iap.sc && eventInstance && !season) {
        const ongoingSeason = DateHelper.getActive(this._dataService.seasonConfig.items);
        if (ongoingSeason && eventInstance.date >= ongoingSeason.date && eventInstance.date <= ongoingSeason.endDate) {
          season = ongoingSeason;
        }
      }

      this._currencyService.addCost(cost, season, eventInstance);
    }


    if (iap.sp) {
      this._currencyService.addGiftPasses(unlock ? iap.sp : -iap.sp);
    }
  }
}
