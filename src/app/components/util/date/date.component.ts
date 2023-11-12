import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import dayjs from 'dayjs';
import { filter } from 'rxjs';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateComponent implements OnChanges, OnDestroy {
  @Input() date: dayjs.Dayjs | undefined;
  @Input() format?: string;

  _date: dayjs.Dayjs | undefined;
  _subs = new SubscriptionBag();

  constructor(
    private readonly _storageService: StorageService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this._subs.add(_storageService.storageChanged.pipe(filter(e => e.key === 'date.format')).subscribe(() => {
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
    this._date = this.date?.clone();
    this._changeDetectorRef.markForCheck();
  }
}
