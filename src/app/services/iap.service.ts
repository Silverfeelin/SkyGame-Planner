import { Injectable } from '@angular/core';
import { IIAP } from '../interfaces/iap.interface';
import { StorageService } from './storage.service';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class IAPService {
  constructor(
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
