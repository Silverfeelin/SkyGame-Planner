import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clamp'
})
export class ClampPipe implements PipeTransform {
  transform(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(n, max));
  }
}
