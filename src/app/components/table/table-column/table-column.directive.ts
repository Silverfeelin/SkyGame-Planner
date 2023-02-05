import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableColumn]'
})
export class TableColumnDirective {
  constructor(public template: TemplateRef<any>) {}
}
