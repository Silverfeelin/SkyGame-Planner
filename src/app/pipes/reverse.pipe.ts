import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse'
})
export class ReversePipe implements PipeTransform {
  transform(array: Array<any>): Array<any> {
    return array.slice().reverse();
  }
}
