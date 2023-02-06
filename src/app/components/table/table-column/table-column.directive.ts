import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableColumn]'
})
export class TableColumnDirective {
  @Input() link: any;
  @Input() queryParams: any;

  constructor(public template: TemplateRef<any>) {}
}
