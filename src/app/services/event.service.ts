import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IItem } from '../interfaces/item.interface';
import { Router } from '@angular/router';
import { INode } from '../interfaces/node.interface';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  readonly itemToggled = new Subject<IItem>();
  readonly itemFavourited = new Subject<IItem>();
  readonly searchReset = new Subject<void>();
  readonly clicked = new Subject<MouseEvent>();
  readonly storageChanged = new Subject<StorageEvent>();
  readonly menuFolded = new Subject<boolean>();

  constructor(
    private readonly _router: Router
  ) {
    document.addEventListener('keydown', evt => {
      this.onKeyDown(evt);
    });

    document.addEventListener('click', evt => {
      this.onClick(evt);
    });

    window.addEventListener('storage', evt => {
      this.onStorage(evt);
    });
  }

  private onKeyDown(evt: KeyboardEvent): void {
    if (evt.ctrlKey && evt.shiftKey && evt.key.toUpperCase() === 'F') {
      evt.preventDefault();
      this.searchReset.next();
      const path = this._router.url.split('?')[0] || '/';
      if (path !== '/') {
        void this._router.navigate(['/'], { skipLocationChange: false, queryParams: { focus: '1' } });
      }
    }
  }

  private onClick(evt: MouseEvent): void {
    this.clicked.next(evt);
  }

  private onStorage(evt: StorageEvent): void {
    this.storageChanged.next(evt);
  }
}
