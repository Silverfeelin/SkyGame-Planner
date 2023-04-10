import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableFooter]'
})
export class TableFooterDirective {
  @Input() colspan?: number;
  @Input() textAlign?: 'left' | 'center' | 'right';

  constructor(public template: TemplateRef<any>) {}
}
