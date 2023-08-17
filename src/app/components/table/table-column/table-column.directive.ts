import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableColumn]'
})
export class TableColumnDirective {
  @Input() tdClass?: string;

  constructor(public template: TemplateRef<any>) {}
}
