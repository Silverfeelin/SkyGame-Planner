import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild, viewChild } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { ItemTypeSelectorComponent } from "../item-type-selector/item-type-selector.component";
import { IItem, ItemType } from '@app/interfaces/item.interface';
import { DateTime } from 'luxon';
import { NodeHelper } from '@app/helpers/node-helper';
import { Chart } from 'chart.js/auto';
import chartTrendline from 'chartjs-plugin-trendline';

Chart.register(chartTrendline);

interface IChartItem {
  item: IItem,
  added: DateTime,
  returned: DateTime,
  candles: number
};

@Component({
  selector: 'app-item-inflation',
  standalone: true,
  imports: [ItemTypeSelectorComponent],
  templateUrl: './item-inflation.component.html',
  styleUrl: './item-inflation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemInflationComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartDiv!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  itemType?: ItemType;
  chartItems?: Array<IChartItem>;
  addItemsByMonth: { [key: string]: Array<IChartItem> } = {};
  returnItemsByMonth: { [key: string]: Array<IChartItem> } = {};

  includeSeasons = true;
  includeEvents = true;

  showTypes: ItemType[] = [
    ItemType.Outfit, ItemType.Shoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.Hat, ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop
  ];
  showTypeSet = new Set(this.showTypes);

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.plot();
  }

  private initChart(): void {
    Chart.defaults.borderColor = '#666';
    Chart.defaults.color = '#fff';

    this.chart = new Chart(this.chartDiv.nativeElement, {
      type: 'line',
      data: {
        datasets: [{
          label: 'No data',
          data: [0]
        }],
        labels: ['No data']
      },
      options: {
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0.15
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 250
          }
        }
      }
    });

    const plugins = this.chart.options.plugins as any;
    plugins.tooltip = {
      callbacks: {
        label: (item: any) => `Average cost on return: ${item.formattedValue} candles`,
        afterLabel: (items: any) => this.onTooltipAfterLabel(items)
      }
    }
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

  onTooltipAfterLabel(data: any): string | undefined {
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
      if (!this.showTypeSet.has(item.type)) { continue; }
      if (this.itemType && item.type !== this.itemType) { continue; }

      // Check if item was ever available for candles.
      const returnNode = item.nodes?.find(n => n.c);
      const returnListNode = item.listNodes?.find(n => n.c);
      if (!returnNode && !returnListNode) { continue; }

      // Find the add date.
      const tree = NodeHelper.getRoot(item.nodes?.at(0))?.spiritTree;
      let season = tree?.spirit?.season;
      let eventInstance = tree?.eventInstanceSpirit?.eventInstance;
      const itemList = item.listNodes?.at(0)?.itemList;
      season ??= itemList?.shop?.season;
      eventInstance ??= itemList?.shop?.event;
      if (season && !this.includeSeasons) { continue; }
      if (eventInstance && !this.includeEvents) { continue; }
      if (!season && !eventInstance) { continue; }

      const added = DateTime.min(...[season?.date, eventInstance?.date].filter(d => d) as DateTime[]);
      addDates.push(added);

      // Find the return date
      const returnTree = NodeHelper.getRoot(returnNode)?.spiritTree;
      let returnSeason = returnTree?.spirit?.season;
      let returnEvent = returnTree?.eventInstanceSpirit?.eventInstance;
      let returnTs = returnTree?.ts;
      let returnVisit = returnTree?.visit;

      const returnItemList = returnListNode?.itemList;
      returnSeason ??= returnItemList?.shop?.season;
      returnEvent ??= returnItemList?.shop?.event;

      const returned = DateTime.min(...[returnSeason?.date, returnEvent?.date, returnTs?.date, returnVisit?.return?.date].filter(d => d) as DateTime[]);
      returnDates.push(returned);
      const candles = returnNode?.c || returnListNode?.c || 0;

      items.push({ item, added, returned, candles });
    }

    // No season/event items in category have returned for candles.
    if (!items.length) { return; }

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
    (this.chart.data.datasets[0] as any).trendlineLinear = {
      style: '#8e5ea2',
      lineStyle: 'line',
      width: 1
    };

    this.chart.data.datasets.push({
      label: 'Items by first return date',
      data: dataReturn,
      spanGaps: true
    });
    (this.chart.data.datasets[1] as any).trendlineLinear = {
      style: '#3e95cd',
      lineStyle: 'line',
      width: 1
    };

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
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    });
  }
}
