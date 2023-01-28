import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appGridColumn]'
})
export class GridColumnirective {
  constructor(public template: TemplateRef<any>) {}
}
