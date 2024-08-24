import { ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CardComponent } from "../layout/card/card.component";
import { MatIcon } from '@angular/material/icon';
import { StorageService } from '@app/services/storage.service';
import { IStorageCurrencies } from '@app/services/storage/storage-provider.interface';
import { ISeason } from '@app/interfaces/season.interface';
import { IEventInstance } from '@app/interfaces/event.interface';
import { DataService } from '@app/services/data.service';
import { DateHelper } from '@app/helpers/date-helper';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [CardComponent, MatIcon, NgbTooltip],
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyComponent {
  @ViewChild('inpC', { static: true }) inpC!: ElementRef<HTMLInputElement>;
  @ViewChild('inpH', { static: true }) inpH!: ElementRef<HTMLInputElement>;
  @ViewChild('inpAc', { static: true }) inpAc!: ElementRef<HTMLInputElement>;
  @ViewChild('inpSp', { static: false }) inpSp!: ElementRef<HTMLInputElement>;
  @ViewChild('inpSc', { static: false }) inpSc!: ElementRef<HTMLInputElement>;
  @ViewChildren('inpEc') inpEc!: QueryList<ElementRef<HTMLInputElement>>;

  currencies: IStorageCurrencies;
  ongoingSeason?: ISeason;
  ongoingEventInstances: Array<IEventInstance>;

  converted?: { candles: number; };

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService
  ) {
    this.currencies = _storageService.getCurrencies();
    let changed = false;

    this.ongoingSeason = DateHelper.getActive(this._dataService.seasonConfig.items);
    if (this.ongoingSeason) {
      this.currencies.seasonCurrencies[this.ongoingSeason.guid] ??= { candles: 0 };
    }

    const ongoingEventGuids = new Set<string>();
    this.ongoingEventInstances = [];
    for (const event of this._dataService.eventConfig.items) {
      if (!event.instances) { continue; }
      const eventDates = DateHelper.groupByPeriod(event.instances);
      if (!eventDates.active.length) { continue; }
      const instance = eventDates.active.at(-1)!;
      this.ongoingEventInstances.push(instance);
      ongoingEventGuids.add(instance.guid);

      this.currencies.eventCurrencies[instance.guid] ??= { tickets: 0 };
    }

    // Convert old season currency. This might be better suited to run on site load.
    for (const key of Object.keys(this.currencies.seasonCurrencies)) {
      if (key === this.ongoingSeason?.guid) { continue; }
      const value = this.currencies.seasonCurrencies[key];
      this.currencies.candles += value.candles;
      delete this.currencies.seasonCurrencies[key];

      this.converted = { candles: value.candles };
      changed = true;
    }

    // Remove old event currencies.
    for (const key of Object.keys(this.currencies.eventCurrencies)) {
      if (ongoingEventGuids.has(key)) { continue; }
      delete this.currencies.eventCurrencies[key];
      changed = true;
    }

    // Save converted and removed currencies.
    if (changed) {
      this._storageService.setCurrencies(this.currencies);
    }
  }

  onCurrencyInput(): void {
    this.currencyInputChanged();
  }

  onCurrencyInputBlur(evt: Event): void {
    const target = evt.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    if (value <= 0) {
      target.value = '0';
    } else if (value > 99999) {
      target.value = '99999';
    } else if (!value) {
      target.value = '';
    }

    this.currencyInputChanged();
  }

  currencyInputChanged(): void {
    // Candles
    const targetC = this.inpC.nativeElement;
    this.currencies.candles = Math.min(99999, Math.max(parseInt(targetC.value, 10) || 0, 0));
    // Hearts
    const targetH = this.inpH.nativeElement;
    this.currencies.hearts = Math.min(99999, Math.max(parseInt(targetH.value, 10) || 0, 0));
    // Ascended candles
    const targetAc = this.inpAc.nativeElement;
    this.currencies.ascendedCandles = Math.min(99999, Math.max(parseInt(targetAc.value, 10) || 0, 0));
    // Gift passes
    const targetSp = this.inpSp.nativeElement;
    this.currencies.giftPasses = Math.min(99999, Math.max(parseInt(targetSp.value, 10) || 0, 0));

    if (this.ongoingSeason && this.inpSc) {
      const targetSc = this.inpSc.nativeElement;
      this.currencies.seasonCurrencies[this.ongoingSeason.guid].candles = Math.min(99999, Math.max(parseInt(targetSc.value, 10) || 0, 0));
    }

    const inpsEc = this.inpEc.toArray();
    if (inpsEc.length) {
      for (const [i, instance] of this.ongoingEventInstances.entries()) {
        const targetEc = inpsEc[i].nativeElement;
        this.currencies.eventCurrencies[instance.guid].tickets = Math.min(99999, Math.max(parseInt(targetEc.value, 10) || 0, 0));
      }
    }

    this._storageService.setCurrencies(this.currencies);
  }
}
