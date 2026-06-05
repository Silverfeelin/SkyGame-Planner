import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { DateTime } from 'luxon';
import { Chart } from 'chart.js/auto';
import { IItem, ItemType } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { ChartHelper } from '@app/helpers/chart-helper';
import { ItemTypeSelectorComponent } from '@app/components/items/item-type-selector/item-type-selector.component';
import { AtmosItemQuickActionsComponent } from '../quick-actions/atmos-item-quick-actions.component';

ChartHelper.setDefaults();
ChartHelper.registerTrendline();

interface IChartItem {
  item: IItem;
  added: DateTime;
  returned: DateTime;
  candles: number;
}

@Component({
  selector: 'app-atmos-item-inflation',
  templateUrl: './atmos-item-inflation.component.html',
  styleUrl: './atmos-item-inflation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemTypeSelectorComponent, AtmosItemQuickActionsComponent]
})
export class AtmosItemInflationComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartDiv!: ElementRef<HTMLCanvasElement>;

  private readonly _dataService = inject(DataService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  chart!: Chart;

  itemType?: ItemType;
  chartItems?: Array<IChartItem>;
  addItemsByMonth: { [key: string]: Array<IChartItem> } = {};
  returnItemsByMonth: { [key: string]: Array<IChartItem> } = {};

  includeSeasons = true;
  includeEvents = true;

  readonly showTypes: ReadonlyArray<ItemType> = [
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop
  ];
  private readonly _showTypeSet = new Set(this.showTypes);

  ngAfterViewInit(): void {
    this.initChart();
    this.plot();
  }

  onTypeChanged(itemType: ItemType): void {
    this.itemType = itemType === this.itemType ? undefined : itemType;
    this.plot();
  }

  toggleIncludeSeasons(): void {
    this.includeSeasons = !this.includeSeasons;
    this.plot();
  }

  toggleIncludeEvents(): void {
    this.includeEvents = !this.includeEvents;
    this.plot();
  }

  private initChart(): void {
    this.chart = new Chart(this.chartDiv.nativeElement, {
      type: 'line',
      data: {
        datasets: [{ label: 'No data', data: [0] }],
        labels: ['No data']
      },
      options: {
        maintainAspectRatio: false,
        elements: { line: { tension: 0.15 } },
        scales: { y: { beginAtZero: true, max: 250 } }
      }
    });

    const plugins = this.chart.options.plugins as any;
    plugins.tooltip = {
      callbacks: {
        label: (item: any) => `Average cost on return: ${item.formattedValue} candles`,
        afterLabel: (items: any) => this.onTooltipAfterLabel(items)
      }
    };
  }

  private onTooltipAfterLabel(data: any): string | undefined {
    const label = data?.label;
    if (!label) { return undefined; }

    const items = data.datasetIndex === 0
      ? this.addItemsByMonth[label] || []
      : this.returnItemsByMonth[label] || [];

    return items.map((i: IChartItem) => `${i.item.name} (${i.candles})`).join('\n');
  }

  plot(): void {
    const items: Array<IChartItem> = [];
    this.chartItems = items;
    this.addItemsByMonth = {};
    this.returnItemsByMonth = {};

    const addDates: Array<DateTime> = [];
    const returnDates: Array<DateTime> = [];

    for (const item of this._dataService.itemConfig.items) {
      if (!this._showTypeSet.has(item.type)) { continue; }
      if (this.itemType && item.type !== this.itemType) { continue; }

      const returnNode = item.nodes?.find(n => n.c);
      const returnListNode = item.listNodes?.find(n => n.c);
      if (!returnNode && !returnListNode) { continue; }

      const node = item.nodes?.at(0);
      const tree = node?.root?.tree;
      let season = tree?.spirit?.season;
      let eventInstance = tree?.eventInstanceSpirit?.eventInstance;
      const itemList = item.listNodes?.at(0)?.itemList;
      season ??= itemList?.shop?.season;
      eventInstance ??= itemList?.shop?.event;
      if (season && eventInstance) { season = undefined; }
      if (season && !this.includeSeasons) { continue; }
      if (eventInstance && !this.includeEvents) { continue; }
      if (!season && !eventInstance) { continue; }

      const added = DateTime.min(...[season?.date, eventInstance?.date].filter(d => d) as DateTime[]);
      addDates.push(added);

      const returnTree = returnNode?.root?.tree;
      let returnSeason = returnTree?.spirit?.season;
      let returnEvent = returnTree?.eventInstanceSpirit?.eventInstance;
      if (returnEvent && returnSeason) { returnSeason = undefined; }
      const returnTs = returnTree?.travelingSpirit;
      const returnVisit = returnTree?.specialVisitSpirit;

      const returnItemList = returnListNode?.itemList;
      returnSeason ??= returnItemList?.shop?.season;
      returnEvent ??= returnItemList?.shop?.event;

      const returned = DateTime.min(...[returnSeason?.date, returnEvent?.date, returnTs?.date, returnVisit?.visit?.date].filter(d => d) as DateTime[]);
      returnDates.push(returned);
      const candles = returnNode?.c || returnListNode?.c || 0;

      items.push({ item, added, returned, candles });
    }

    if (!items.length) {
      this._changeDetectorRef.markForCheck();
      return;
    }

    const minDate = DateTime.min(...addDates, ...returnDates);
    const maxDate = DateTime.max(...addDates, ...returnDates);

    const xMonths: Array<string> = [];
    let currentDate = minDate.startOf('month');

    const addMonthItems = new Map<string, Array<IChartItem>>();
    const returnMonthItems = new Map<string, Array<IChartItem>>();
    for (const item of items) {
      const addDate = item.added.toFormat('MMM yy').replace(' ', " '");
      const returnDate = item.returned.toFormat('MMM yy').replace(' ', " '");
      if (!addMonthItems.has(addDate)) { addMonthItems.set(addDate, []); }
      if (!returnMonthItems.has(returnDate)) { returnMonthItems.set(returnDate, []); }
      addMonthItems.get(addDate)!.push(item);
      returnMonthItems.get(returnDate)!.push(item);
    }

    const addMonthValues = new Map<string, number>();
    const returnMonthValues = new Map<string, number>();
    let maxCandles = 50;

    for (const [addDate, addItems] of addMonthItems.entries()) {
      const totalCandles = addItems.reduce((sum, item) => sum + item.candles, 0);
      const averageCandles = totalCandles / addItems.length;
      addMonthValues.set(addDate, averageCandles);
      maxCandles = Math.max(maxCandles, averageCandles);
      this.addItemsByMonth[addDate] = addItems;
    }

    for (const [returnDate, returnItems] of returnMonthItems.entries()) {
      const totalCandles = returnItems.reduce((sum, item) => sum + item.candles, 0);
      const averageCandles = totalCandles / returnItems.length;
      returnMonthValues.set(returnDate, averageCandles);
      maxCandles = Math.max(maxCandles, averageCandles);
      this.returnItemsByMonth[returnDate] = returnItems;
    }

    this.chart.data.datasets = [];
    const dataAdd: Array<number | null> = [];
    const dataReturn: Array<number | null> = [];
    this.chart.data.datasets.push({
      label: 'Items by release date',
      data: dataAdd,
      spanGaps: true,
      hidden: true
    });

    if (dataAdd.length > 1) {
      (this.chart.data.datasets[0] as any).trendlineLinear = {
        style: '#8e5ea2', lineStyle: 'line', width: 1
      };
    }

    this.chart.data.datasets.push({
      label: 'Items by first return date',
      data: dataReturn,
      spanGaps: true
    });

    if (dataReturn.length > 1) {
      (this.chart.data.datasets[1] as any).trendlineLinear = {
        style: '#3e95cd', lineStyle: 'line', width: 1
      };
    }

    while (currentDate <= maxDate.endOf('month')) {
      const sDate = currentDate.toFormat('MMM yy').replace(' ', " '");
      xMonths.push(sDate);
      dataAdd.push(addMonthValues.get(sDate) || null);
      dataReturn.push(returnMonthValues.get(sDate) || null);
      currentDate = currentDate.plus({ months: 1 }).startOf('month');
    }

    this.chart.data.labels = xMonths;
    const scales = this.chart.options.scales! as any;
    scales.y.max = maxCandles + 10;
    this.chart.update();
    setTimeout(() => this._changeDetectorRef.markForCheck());
  }
}
