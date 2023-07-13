import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableHeader]'
})
export class TableHeaderDirective {
  @Input() fit: boolean = false;

  constructor(public template: TemplateRef<any>) {}
}
