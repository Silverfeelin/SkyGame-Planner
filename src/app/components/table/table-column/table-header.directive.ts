import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableHeader]'
})
export class TableHeaderDirective {
  @Input() fit: boolean = false;
  @Input() width?: string;
  @Input() textAlign?: 'left' | 'center' | 'right';

  constructor(public template: TemplateRef<any>) {}
}
