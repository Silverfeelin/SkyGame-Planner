import { Chart, registerables } from 'chart.js';
import chartTrendline from 'chartjs-plugin-trendline';

export class ChartHelper {
  static colors = {
    blue: '#36a2eb',
    red: '#ff6384',
    teal: '#4bc0c0',
    orange: '#ff9f40',
    purple: '#9966ff',
    yellow: '#ffcd56',
    gray: '#c9cbcf'
  };

  static setDefaults(): void {
    Chart.defaults.borderColor = '#666';
    Chart.defaults.color = '#fff';
    Chart.register(...registerables);
  }

  static registerTrendline(): void {
    Chart.register(chartTrendline);
  }
}
