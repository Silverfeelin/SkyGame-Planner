import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';
import { CurrencyService } from '@app/services/currency.service';

const _today = () => DateTime.now().setZone(DateHelper.skyTimeZone).toFormat('yyyy-MM-dd');

function _loadCandles(): number {
  const stored = localStorage.getItem('daily.candles');
  if (!stored) { return 0; }
  const { date, candles } = JSON.parse(stored);
  return date === _today() ? (candles as number) : 0;
}

const candlesAdded = signal(_loadCandles());

@Component({
  selector: 'app-daily-checkin',
  imports: [MatIcon, RouterLink, NgbTooltip],
  templateUrl: './daily-checkin.component.html',
  styleUrl: './daily-checkin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyCheckinComponent {
  readonly checkedIn = input<boolean>();
  readonly checkin = output<MouseEvent>();

  private _candlesConfirmed = false;

  constructor(private readonly _currencyService: CurrencyService) {}

  onCheckinClick(evt: MouseEvent): void {
    this.checkin.emit(evt);
  }

  addCandles(amount: number, evt: MouseEvent): void {
    if (candlesAdded() >= 20 && !this._candlesConfirmed) {
      if (!window.confirm('You\'ve already added 20 candles today. Are you sure you want to add more?')) {
        return;
      }
      this._candlesConfirmed = true;
    }
    this._currencyService.addCost({ c: amount });
    this._currencyService.animateCurrencyGained(evt, amount);
    candlesAdded.update(v => v + amount);
    localStorage.setItem('daily.candles', JSON.stringify({ date: _today(), candles: candlesAdded() }));
  }
}
