import { Injectable, NgZone } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private _copyItem = false;
  private _copyNode = false;
  private _copyShop = false;

  constructor(
    private readonly _zone: NgZone
  ) {
    (window as any).debug = this;
  }

  set copyItem(value: boolean) {
    this._zone.run(() => {
      this._copyItem = !!value;
    });
  }

  get copyItem(): boolean {
    return this._copyItem;
  }

  // copyNode
  set copyNode(value: boolean) {
    this._zone.run(() => {
      this._copyNode = !!value;
    });
  }

  get copyNode(): boolean {
    return this._copyNode;
  }

  set copyShop(value: boolean) {
    this._zone.run(() => {
      this._copyShop = !!value;
    });
  }

  get copyShop(): boolean {
    return this._copyShop;
  }
}
