import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[appTableColumn]',
    standalone: true
})
export class TableColumnDirective {
  @Input() tdClass?: string;

  constructor(public template: TemplateRef<any>) {}
}
