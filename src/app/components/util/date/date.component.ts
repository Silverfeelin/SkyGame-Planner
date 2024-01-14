import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DateTime } from 'luxon';
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
  @Input() date: DateTime | undefined;
  @Input() format?: string;

  _date: DateTime | undefined;
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
    this._date = this.date;
    this._changeDetectorRef.markForCheck();
  }
}
