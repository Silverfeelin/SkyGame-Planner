import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CardComponent } from '@app/components/layout/card/card.component';
import { ChartHelper } from '@app/helpers/chart-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { DataService } from '@app/services/data.service';
import { Chart, ChartConfiguration, ScriptableLineSegmentContext } from 'chart.js';
import { CostHelper } from '@app/helpers/cost-helper';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { TreeHelper } from '@app/helpers/tree-helper';

ChartHelper.setDefaults();
ChartHelper.registerTrendline();

@Component({
    selector: 'app-graph-spirits',
    imports: [CardComponent, WikiLinkComponent],
    templateUrl: './graph-spirits.component.html',
    styleUrl: './graph-spirits.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphSpiritsComponent implements AfterViewInit {
  @ViewChild('chartReturn', { static: true }) chartReturnDiv!: ElementRef<HTMLCanvasElement>;
  chartReturn!: Chart;

  @ViewChild('chartAbsence', { static: true }) chartAbsenceDiv!: ElementRef<HTMLCanvasElement>;
  chartAbsence!: Chart;

  @ViewChild('chartCost', { static: true }) chartCostDiv!: ElementRef<HTMLCanvasElement>;
  chartCost!: Chart;

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
    const returnConfig = this.createChartConfig();
    this.chartReturn = new Chart(this.chartReturnDiv.nativeElement, returnConfig);

    const absenceConfig = this.createChartConfig();
    absenceConfig.type = 'bar';
    this.chartAbsence = new Chart(this.chartAbsenceDiv.nativeElement, absenceConfig);

    const costConfig = this.createChartConfig();
    costConfig.type = 'bar';
    (costConfig as any).options.scales.x.stacked = true;
    (costConfig as any).options.scales.y.stacked = true;
    this.chartCost = new Chart(this.chartCostDiv.nativeElement, costConfig);
  }

  private createChartConfig(): ChartConfiguration {
    return {
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
        responsive: false,
        plugins:{
          legend: {
            position: 'top',
            align: 'start'
          }
        },
        elements: {
          line: {
            tension: 0.15
          }
        },
        scales: {
          x: {
            ticks: {
              color: ctx => {
                const isSeasonLabel = typeof ctx.tick.label === 'string' && ctx.tick.label.startsWith('Season');
                return isSeasonLabel ? '#0ff' : '#fff';
              },
              font: {
                weight: ctx => {
                  const isSeasonLabel = typeof ctx.tick.label === 'string' && ctx.tick.label.startsWith('Season');
                  return isSeasonLabel ? 'normal' : 'lighter';
                }
              },
              maxRotation: 90, minRotation: 90
            }
          },
          y: {
            beginAtZero: true,
            max: 250
          }
        }
      }
    }
  }

  private plot(): void {
    const returnLabels: Array<string> = [];
    const returnData: Array<number | null> = [];
    let returnMaxDays = 0;

    const absenceLabels: Array<string> = [];
    const absenceData: Array<number | null> = [];
    const absenceColors: Array<string | null> = [];
    let absenceMaxDays = 0;

    const costLabels: Array<string> = [];
    const costDataC: Array<number | null> = [];
    const costDataH: Array<number | null> = [];
    let costMax = 0;

    for (const season of this._dataService.seasonConfig.items) {
      // Add season label.
      returnLabels.push(season.name);
      returnData.push(null);
      absenceLabels.push(season.name);
      absenceData.push(null);
      absenceColors.push(ChartHelper.colors.blue);
      costLabels.push(season.name);
      costDataC.push(null);
      costDataH.push(null);

      // Add season spirits
      for (const spirit of season.spirits ?? []) {
        if (spirit.type !== 'Season') { continue; }

        const seasonEndDate = spirit.season!.endDate;
        const firstTs = spirit.ts?.at(0);
        const firstReturn = spirit.visits?.at(0);
        let returnDate = firstTs?.date;
        if (!returnDate || (returnDate && firstReturn && firstReturn.visit.date < returnDate)) {
          returnDate = firstReturn?.visit.date;
        }

        // Add return date.
        if (returnDate) {
          const days = DateHelper.daysBetween(seasonEndDate, returnDate) - 1;
          if (days > 0) {
            returnMaxDays = Math.max(returnMaxDays, days);

            returnLabels.push(spirit.name);
            returnData.push(days);
          }
        }

        // Add absence days.
        const lastTs = spirit.ts?.at(spirit.ts.length - 1);
        const lastReturn = spirit.visits?.at(spirit.visits.length - 1);
        let lastDate = lastTs?.endDate;
        if (!lastDate || (lastReturn && lastReturn.visit.endDate > lastDate)) {
          lastDate = lastReturn?.visit.endDate;
        }
        lastDate ??= seasonEndDate;

        const today = DateHelper.todaySky();
        let absenceDays = lastDate < today ? Math.max(0, DateHelper.daysBetween(lastDate, today)) : 0;
        absenceData.push(absenceDays);
        absenceLabels.push(spirit.name);
        absenceColors.push(lastDate === seasonEndDate ? ChartHelper.colors.orange : ChartHelper.colors.blue);
        absenceMaxDays = Math.max(absenceMaxDays, absenceDays);

        // Add cost.
        if (lastReturn || lastTs) {
          const tree = lastDate === lastTs?.endDate ? lastTs?.tree : lastReturn?.tree;
          if (tree) {
            const nodes = TreeHelper.getNodes(tree);
            const cost = CostHelper.add(CostHelper.create(), ...nodes);
            costLabels.push(spirit.name);
            costDataC.push(cost.c || 0);
            costDataH.push(cost.h || 0);
            costMax = Math.max(costMax, (cost.c || 0) + (cost.h || 0));
          }
        }
      }
    }

    const segmentRedSkip = {
      borderColor: (ctx: ScriptableLineSegmentContext) => {
        const value = ctx.p0.skip ? ChartHelper.colors.red : undefined;
        return value;
      },
      borderDash: (ctx: ScriptableLineSegmentContext) => {
        const value = ctx.p0.skip ? [5, 5] : undefined;
        return value;
      }
    }

    // Return chart
    this.chartReturn.data.datasets = [];
    this.chartReturn.data.datasets.push({
      label: 'Return time (days)',
      data: returnData,
      spanGaps: true,
      segment: segmentRedSkip
    });
    (this.chartReturn.data.datasets[0] as any).trendlineLinear = {
      lineStyle: 'line',
      width: 1
    };
    this.chartReturn.data.labels = returnLabels;
    const returnScales = this.chartReturn.options.scales! as any;
    returnScales.y.max = Math.ceil((returnMaxDays + 1) / 10) * 10;
    this.chartReturn.update();

    // Absence chart
    this.chartAbsence.data.datasets = [];
    this.chartAbsence.data.datasets.push({
      label: 'Absence time (days)',
      data: absenceData
    });

    (this.chartAbsence.data.datasets[0] as any).backgroundColor = absenceColors;
    this.chartAbsence.data.labels = absenceLabels;
    const absenceScales = this.chartAbsence.options.scales! as any;
    absenceScales.y.max = Math.ceil((absenceMaxDays + 1) / 10) * 10;
    this.chartAbsence.update();

    // Cost chart
    this.chartCost.data.datasets = [];
    this.chartCost.data.datasets.push({
      label: 'Candles',
      data: costDataC,
      backgroundColor: ChartHelper.colors.blue
    });
    this.chartCost.data.datasets.push({
      label: 'Hearts',
      data: costDataH,
      backgroundColor: ChartHelper.colors.red
    });
    this.chartCost.data.labels = costLabels;
    const costScales = this.chartCost.options.scales! as any;
    costScales.y.max = Math.ceil((costMax + 1) / 100) * 100;
    this.chartCost.update();

    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    });
  }
}
