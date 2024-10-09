import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IItem } from '../interfaces/item.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  readonly itemToggled = new Subject<IItem>();
  readonly itemFavourited = new Subject<IItem>();
  readonly keydown = new Subject<KeyboardEvent>();
  readonly clicked = new Subject<MouseEvent>();
  readonly storageChanged = new Subject<StorageEvent>();
  readonly menuFolded = new Subject<boolean>();

  constructor(
    private readonly _router: Router
  ) {
    document.addEventListener('keydown', evt => {
      this.onKeydown(evt);
    });

    document.addEventListener('click', evt => {
      this.onClick(evt);
    });

    window.addEventListener('storage', evt => {
      this.onStorage(evt);
    });
  }

  private onKeydown(evt: KeyboardEvent): void {
    this.keydown.next(evt);
  }

  private onClick(evt: MouseEvent): void {
    this.clicked.next(evt);
  }

  private onStorage(evt: StorageEvent): void {
    this.storageChanged.next(evt);
  }
}
