import { ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CardComponent } from "../layout/card/card.component";
import { MatIcon } from '@angular/material/icon';
import { StorageService } from '@app/services/storage.service';
import { IStorageCurrencies } from '@app/services/storage/storage-provider.interface';
import { DataService } from '@app/services/data.service';
import { DateHelper } from '@app/helpers/date-helper';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { CurrencyService } from '@app/services/currency.service';
import { ISeason, IEventInstance } from 'skygame-data';

@Component({
    selector: 'app-currency',
    imports: [CardComponent, WikiLinkComponent, MatIcon, NgbTooltip, RouterLink],
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

  inpCurrencies: IStorageCurrencies;
  currencies: IStorageCurrencies;
  ongoingSeason?: ISeason;
  ongoingEventInstances: Array<IEventInstance>;

  dailySeasonCandles = 5;
  dailyEventCurrency: { [guid: string]: number; } = {};

  converted?: { candles: number; };

  constructor(
    private readonly _currencyService: CurrencyService,
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService
  ) {
    this.inpCurrencies = this._storageService.getCurrencies();
    this.currencies = this._storageService.getCurrencies();
    let changed = false;

    this.ongoingSeason = DateHelper.getActive(this._dataService.seasonConfig.items);
    if (this.ongoingSeason) {
      this.inpCurrencies.seasonCurrencies[this.ongoingSeason.guid] ??= { candles: 0 };
      this.currencies.seasonCurrencies[this.ongoingSeason.guid] ??= { candles: 0 };
      this.dailySeasonCandles = this._storageService.hasSeasonPass(this.ongoingSeason.guid) ? 6 : 5;
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

      this.inpCurrencies.eventCurrencies[instance.guid] ??= { tickets: 0 };
      this.currencies.eventCurrencies[instance.guid] ??= { tickets: 0 };

      this.dailyEventCurrency[instance.guid] = instance.calculatorData?.dailyCurrencyAmount ?? 5;
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

  addCurrency(type: 'candles' | 'hearts' | 'ascendedCandles' | 'giftPasses' | 'seasonCandles' | 'eventTickets', amount: number): void {
    switch (type) {
      case 'candles':
        const candles = this._currencyService.clamp((this.currencies.candles || 0) + amount);
        this.inpC.nativeElement.value = candles.toString();
        this.currencies.candles = candles;
        break;
      case 'hearts':
        const hearts = this._currencyService.clamp((this.currencies.hearts || 0) + amount);
        this.inpH.nativeElement.value = hearts.toString();
        this.currencies.hearts = hearts;
        break;
      case 'ascendedCandles':
        const ascendedCandles = this._currencyService.clamp((this.currencies.ascendedCandles || 0) + amount);
        this.inpAc.nativeElement.value = ascendedCandles.toString();
        this.currencies.ascendedCandles = ascendedCandles;
        break;
      case 'giftPasses':
        const giftPasses = this._currencyService.clamp((this.currencies.giftPasses || 0) + amount);
        this.inpSp.nativeElement.value = giftPasses.toString();
        this.currencies.giftPasses = giftPasses;
        break;
    }

    this._storageService.setCurrencies(this.currencies);
  }

  addSeasonCurrency(amount: number): void {
    if (!this.ongoingSeason) { return; }
    const seasonCurrency = this.currencies.seasonCurrencies[this.ongoingSeason?.guid];
    if (!seasonCurrency) { return; }

    const candles = this._currencyService.clamp((seasonCurrency.candles || 0) + amount);
    this.currencies.seasonCurrencies[this.ongoingSeason.guid].candles = candles;
    this.inpSc.nativeElement.value = candles.toString();

    this._storageService.setCurrencies(this.currencies);
  }

  addEventCurrency(guid: string, amount: number): void {
    const eventCurrency = this.currencies.eventCurrencies[guid];
    if (!eventCurrency) { return; }

    const tickets = this._currencyService.clamp((eventCurrency.tickets || 0) + amount);
    this.currencies.eventCurrencies[guid].tickets = tickets;

    const index = this.ongoingEventInstances.findIndex(instance => instance.guid === guid);
    if (index !== -1) {
      this.inpEc.toArray()[index].nativeElement.value = tickets.toString();
    }

    this._storageService.setCurrencies(this.currencies);
  }

  onCurrencyInput(): void {
    this.currencyInputChanged();
  }

  onCurrencyInputBlur(evt: Event, isAsc = false): void {
    const target = evt.target as HTMLInputElement;
    let value = isAsc ? this.parseDecimal(target.value) : this.parseInt(target.value);
    if (isAsc && value % 0.25 !== 0) {
      value = Math.round(value * 4) / 4;
      target.value = value.toString();
    }
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
    this.currencies.candles = Math.min(99999, Math.max(this.parseInt(targetC.value), 0));;
    if (this.currencies.candles !== this.parseDecimal(targetC.value)) {
      targetC.value = this.currencies.candles.toString();
    }
    // Hearts
    const targetH = this.inpH.nativeElement;
    this.currencies.hearts = Math.min(99999, Math.max(this.parseInt(targetH.value), 0));
    if (this.currencies.hearts !== this.parseDecimal(targetH.value)) {
      targetH.value = this.currencies.hearts.toString();
    }
    // Ascended candles
    const targetAc = this.inpAc.nativeElement;
    this.currencies.ascendedCandles = Math.min(99999, Math.max(this.parseDecimal(targetAc.value), 0));
    if (this.currencies.ascendedCandles !== this.parseDecimal(targetAc.value)) {
      targetAc.value = this.currencies.ascendedCandles.toString();
    }
    // Gift passes
    const targetSp = this.inpSp.nativeElement;
    this.currencies.giftPasses = Math.min(99999, Math.max(this.parseInt(targetSp.value), 0));
    if (this.currencies.giftPasses !== this.parseDecimal(targetSp.value)) {
      targetSp.value = this.currencies.giftPasses.toString();
    }

    if (this.ongoingSeason && this.inpSc) {
      const targetSc = this.inpSc.nativeElement;
      this.currencies.seasonCurrencies[this.ongoingSeason.guid].candles = Math.min(99999, Math.max(this.parseInt(targetSc.value), 0));
      if (this.currencies.seasonCurrencies[this.ongoingSeason.guid].candles !== this.parseDecimal(targetSc.value)) {
        targetSc.value = this.currencies.seasonCurrencies[this.ongoingSeason.guid].candles.toString();
      }
    }

    const inpsEc = this.inpEc.toArray();
    if (inpsEc.length) {
      for (const [i, instance] of this.ongoingEventInstances.entries()) {
        const targetEc = inpsEc[i].nativeElement;
        this.currencies.eventCurrencies[instance.guid].tickets = Math.min(99999, Math.max(this.parseInt(targetEc.value), 0));
        if (this.currencies.eventCurrencies[instance.guid].tickets !== this.parseDecimal(targetEc.value)) {
          targetEc.value = this.currencies.eventCurrencies[instance.guid].tickets.toString();
        }
      }
    }

    this._storageService.setCurrencies(this.currencies);
  }

  private parseInt(value?: string): number { return parseInt(value || '', 10) || 0; }
  private parseDecimal(value?: string): number { return +(value?.replace(',', '') || 0) || 0; }
}
