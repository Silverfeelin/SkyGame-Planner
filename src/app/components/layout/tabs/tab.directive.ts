import { Directive, inject, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTab]'
})
export class TabDirective {
  @Input('appTab') title!: string;

  template = inject(TemplateRef);
}
