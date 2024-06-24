import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DateTime } from 'luxon';
import { filter } from 'rxjs';
import { DateHelper } from 'src/app/helpers/date-helper';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { EventService } from 'src/app/services/event.service';
import { DateTimePipe } from '../../../pipes/date-time.pipe';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-date',
    templateUrl: './date.component.html',
    styleUrls: ['./date.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, DateTimePipe]
})
export class DateComponent implements OnChanges, OnDestroy {
  @Input() date: DateTime | undefined;
  @Input() format?: string;

  _date: DateTime | undefined;
  _subs = new SubscriptionBag();

  constructor(
    private readonly _eventService: EventService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this._subs.add(_eventService.storageChanged.pipe(filter(e => e.key === 'date.format')).subscribe(() => {
      this.updateDate();
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date']) { this.updateDate(); }
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  private updateDate(): void {
    this._date = this.date ? DateTime.fromISO(this.date.toISO()!).setZone(this.date!.zone) : undefined;
    this._changeDetectorRef.markForCheck();
  }
}
