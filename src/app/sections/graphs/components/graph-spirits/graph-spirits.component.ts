import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CardComponent } from '@app/components/layout/card/card.component';
import { ChartHelper } from '@app/helpers/chart-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { DataService } from '@app/services/data.service';
import { Chart } from 'chart.js';
import { WikiLinkComponent } from "../../../../components/util/wiki-link/wiki-link.component";
import { RouterLink } from '@angular/router';

ChartHelper.setDefaults();
ChartHelper.registerTrendline();

@Component({
  selector: 'app-graph-spirits',
  standalone: true,
  imports: [CardComponent, WikiLinkComponent, RouterLink],
  templateUrl: './graph-spirits.component.html',
  styleUrl: './graph-spirits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphSpiritsComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartDiv!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

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
        responsive: false,
        elements: {
          line: {
            tension: 0.15
          }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 90, minRotation: 90
            }
          },
          y: {
            beginAtZero: true,
            max: 250
          }
        }
      }
    });

    const plugins = this.chart.options.plugins as any;
    plugins.legend.position = 'top';
    plugins.legend.align = 'start';
    plugins.tooltip = {
      callbacks: {
        // label: (item: any) => `Average cost on return: ${item.formattedValue} candles`,
        // afterLabel: (items: any) => this.onTooltipAfterLabel(items)
      }
    }
  }

  private plot(): void {
    const labelDays: Array<string> = [];
    const dataDays: Array<number | null> = [];
    let maxDays = 0;
    for (const season of this._dataService.seasonConfig.items) {
      for (const spirit of season.spirits ?? []) {
        if (spirit.type !== 'Season') { continue; }

        const seasonEndDate = spirit.season!.endDate;
        const firstTs = spirit.ts?.at(0);
        const firstReturn = spirit.returns?.at(0);
        let returnDate = firstTs?.date;
        if (returnDate && firstReturn && firstReturn.return.date < returnDate) {
          returnDate = firstReturn.return.date;
        }
        if (!returnDate) { continue; }

        const days = DateHelper.daysBetween(seasonEndDate, returnDate) - 1;
        if (days <= 0) { continue; }
        maxDays = Math.max(maxDays, days);

        labelDays.push(spirit.name);
        dataDays.push(days);
      }
    }


    this.chart.data.datasets = [];
    this.chart.data.datasets.push({
      label: 'Return time (days)',
      data: dataDays,
      spanGaps: true
    });
    (this.chart.data.datasets[0] as any).trendlineLinear = {
      style: '#8e5ea2',
      lineStyle: 'line',
      width: 1
    };

    this.chart.data.labels = labelDays;
    const scales = this.chart.options.scales! as any;
    scales.y.max = Math.ceil((maxDays + 1) / 10) * 10;
    this.chart.update();
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    });
  }
}
