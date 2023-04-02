import { Component } from '@angular/core';
import { nanoid } from 'nanoid';
import { IShop } from 'src/app/interfaces/shop.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-editor-shop',
  templateUrl: './editor-shop.component.html',
  styleUrls: ['./editor-shop.component.less']
})
export class EditorShopComponent {
  copyShopGuid?: string;
  copyShop?: IShop;
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
      shop: newShop,
      iaps
    };
  }


  copyToClipboard(type: string): void {
    let value = this.getForClipboard(type);
    if (!value) { return; }
    let json = JSON.stringify(value, undefined, 2);
    const startI = json.indexOf('{');
    const endI = json.lastIndexOf('}');
    json = json.substring(startI, endI + 1) + ',';
    navigator.clipboard.writeText(json);
  }

  getForClipboard(type: string): Array<any> {
    switch (type) {
      case 'shop': return [this.result.shop];
      case 'iaps': return this.result.iaps;
      default: return [];
    }
  }
}
