import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage'
})
export class PercentagePipe implements PipeTransform {
  transform(n: number, min: number, max: number): number {
    if (n < min) { return 0; }
    if (n > max || !max) { return 100; }
    return Math.max(0, Math.min(100, Math.round(((n - min) / (max - min)) * 100)));
  }
}
