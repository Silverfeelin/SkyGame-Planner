import { Pipe, PipeTransform } from '@angular/core';
import { SpiritType } from '../interfaces/spirit.interface';

@Pipe({
  name: 'spiritType'
})
export class SpiritTypePipe implements PipeTransform {
  transform(type: SpiritType): string {
    switch (type) {
      case 'Regular': return 'Regular Spirit';
      case 'Elder': return 'Elder Spirit';
      case 'Guide': return 'Season Guide';
      case 'Season': return 'Seasonal Spirit';
      case 'Event': return 'Event Spirit';
      case 'Special': return 'Special Spirit';
      default: return '';
    }
  }
}
