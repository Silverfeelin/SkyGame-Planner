import { Chart, registerables } from 'chart.js';
import chartTrendline from 'chartjs-plugin-trendline';

export class ChartHelper {
  static setDefaults(): void {
    Chart.defaults.borderColor = '#666';
    Chart.defaults.color = '#fff';
    Chart.register(...registerables);
  }

  static registerTrendline(): void {
    Chart.register(chartTrendline);
  }
}
