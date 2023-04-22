import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IItem } from '../interfaces/item.interface';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  readonly itemToggled = new Subject<IItem>();

  constructor() {}

  toggleItem(item: IItem): void {
    this.itemToggled.next(item);
  }
}
