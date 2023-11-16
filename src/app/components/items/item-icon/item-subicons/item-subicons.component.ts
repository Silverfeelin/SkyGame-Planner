import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { IItem } from 'src/app/interfaces/item.interface';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-item-subicons',
  templateUrl: './item-subicons.component.html',
  styleUrls: ['./item-subicons.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemSubIconsComponent implements OnDestroy {
  @Input() item?: IItem;

  @HostBinding('class.show-tooltips')
  @Input() showTooltips = false;

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
