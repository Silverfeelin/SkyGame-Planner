import { Component } from '@angular/core';
import { nanoid } from 'nanoid';
import { DataService } from 'src/app/services/data.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IShop, IEventInstance, IEvent, IIAP } from 'skygame-data';

@Component({
    selector: 'app-editor-shop',
    templateUrl: './editor-shop.component.html',
    styleUrls: ['./editor-shop.component.less'],
    imports: [FormsModule, NgIf]
})
export class EditorShopComponent {
  copyShopGuid?: string;
  copyShop?: IShop;
  copyEventGuid?: string;
  returning = true;

  result?: any;

  constructor(
    private readonly _dataService: DataService,
  ) {}

  shopGuidChanged(): void {
    if (!this.copyShopGuid) { return; }
    const shop = this._dataService.guidMap.get(this.copyShopGuid) as IShop;
    if (!shop) { return; }
    this.copyShop = shop;
  }

  submit(): void {
    if (!this.copyShop) { return; }
    // Copy IAPs
    const iaps: Array<any> = [];
    this.copyShop.iaps?.forEach(iap => {
      iaps.push({
        guid: nanoid(10),
        name: iap.name,
        price: iap.price,
        returning: this.returning || undefined,
        c: iap.c,
        sc: iap.sc,
        sp: iap.sp,
        items: iap.items ? [...iap.items.map(i => i.guid)] : undefined
      });
    });

    // Copy shop
    const newShop = {
      guid: nanoid(10),
      type: this.copyShop.type,
      spirit: this.copyShop.spirit?.guid || undefined,
      iaps: iaps.map(iap => iap.guid)
    };

    this.result = {
      shops: [newShop],
      iaps
    };
  }

  submitEvent(): void {
    const event = this._dataService.guidMap.get(this.copyEventGuid || '') as any;
    let instance: IEventInstance | undefined = event as IEventInstance;
    if ((event as IEvent)?.instances?.length) {
      instance = (event as IEvent).instances?.at(-1);
    }
    if (!instance) { alert('Event instance not found'); return; }

    const shops: Array<IShop> = [];
    const iaps: Array<IIAP> = [];
    instance.shops?.forEach(oldShop => {
      const newShop: IShop  = {
        guid: nanoid(10),
        type: oldShop.type
      };
      if (oldShop.spirit) { (newShop.spirit as unknown as string) = oldShop.spirit.guid; }
      if (oldShop.name) { newShop.name = oldShop.name; }

      newShop.iaps = [];
      const addIap = (iap: IIAP) => {
        const newIap: IIAP = { guid: nanoid(10), name: iap.name, price: iap.price, returning: true };
        if (iap.c) { newIap.c = iap.c; }
        if (iap.sc) { newIap.sc = iap.sc; }
        if (iap.sp) { newIap.sp = iap.sp; }
        (newIap.items as unknown as Array<string>) = iap.items?.map(i => i.guid) || [];
        (newShop.iaps! as unknown as Array<string>).push(newIap.guid);
        iaps.push(newIap);
      };
      oldShop.iaps?.filter(iap => !iap.returning).forEach(addIap);
      oldShop.iaps?.filter(iap => iap.returning).forEach(addIap);

      shops.push(newShop);
    });

    this.result = {
      shops,
      iaps
    };
  }

  copyToClipboard(type: string): void {
    let value = this.getForClipboard(type);
    if (!value) { return; }
    let json = JSON.stringify(value, undefined, 2);
    let startI = json.indexOf('{');
    if (startI === -1) { startI = json.indexOf('"') }
    let endI = json.lastIndexOf('}');
    if (endI === -1) { endI = json.lastIndexOf('"') }
    json = json.substring(startI, endI + 1) + ',';
    navigator.clipboard.writeText(json);
  }

  getForClipboard(type: string): Array<any> {
    switch (type) {
      case 'shopGuids': return this.result.shops.map((shop: IShop) => shop.guid);
      case 'shops': return this.result.shops;
      case 'iaps': return this.result.iaps;
      default: return [];
    }
  }
}
