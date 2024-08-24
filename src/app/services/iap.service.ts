import { Injectable } from '@angular/core';
import { IIAP } from '../interfaces/iap.interface';
import { StorageService } from './storage.service';
import { EventService } from './event.service';
import { CurrencyService } from './currency.service';
import { CostHelper } from '@app/helpers/cost-helper';
import { ICost } from '@app/interfaces/cost.interface';
import { ISeason } from '@app/interfaces/season.interface';
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

  togglePurchased(iap: IIAP): void {
    if (!iap) { return; }

    const unlock = !iap.bought;
    unlock ? this.unlockIap(iap) : this.lockIap(iap);

    // Notify listeners.
    iap.items?.forEach((item) => {
      this._eventService.itemToggled.next(item);
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

    // Modify currencies.
    this.modifyCurrencies(iap, true);

    // Save data.
    this._storageService.addUnlocked(...guids);
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

    // Modify currencies.
    this.modifyCurrencies(iap, false);

    // Save data.
    this._storageService.removeUnlocked(...guids);
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
