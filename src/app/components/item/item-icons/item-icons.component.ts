import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { IItem } from 'src/app/interfaces/item.interface';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-item-icons',
  templateUrl: './item-icons.component.html',
  styleUrls: ['./item-icons.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemIconsComponent implements OnDestroy {
  @Input() item?: IItem;

  _sub: SubscriptionLike;

  constructor(
    _eventService: EventService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    this._sub = _eventService.itemFavourited.subscribe(item => {
      if (item !== this.item) { return; }
      _changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._sub.unsubscribe();
  }
}
