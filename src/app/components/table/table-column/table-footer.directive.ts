import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[appTableFooter]',
    standalone: true
})
export class TableFooterDirective {
  @Input() colspan?: number;
  @Input() textAlign?: 'left' | 'center' | 'right';

  constructor(public template: TemplateRef<any>) {}
}
