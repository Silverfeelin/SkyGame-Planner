import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IItem } from '../interfaces/item.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  readonly itemToggled = new Subject<IItem>();
  readonly searchReset = new Subject<void>();

  constructor(
    private readonly _router: Router
  ) {
    document.addEventListener('keydown', (evt) => {
      this.onKeyDown(evt);
    });
  }

  toggleItem(item: IItem): void {
    this.itemToggled.next(item);
  }

  private onKeyDown(evt: KeyboardEvent): void {
    if (evt.ctrlKey && evt.shiftKey && evt.key.toUpperCase() === 'F') {
      evt.preventDefault();
      this.searchReset.next();
      if (!location.pathname || location.pathname === '/') {
        void this._router.navigate(['/'], { skipLocationChange: false, queryParams: { focus: '1' } });
      }
    }
  }
}
