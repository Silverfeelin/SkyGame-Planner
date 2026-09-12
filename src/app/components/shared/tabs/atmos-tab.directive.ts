import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Marks an `ng-template` as a tab inside `app-atmos-tabs`.
 *
 * ```html
 * <ng-template atmosTab="Items"> ... </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[atmosTab]'
})
export class AtmosTabDirective {
  readonly title = input.required<string>({ alias: 'atmosTab' });
  readonly disabled = input<boolean>(false);

  readonly template = inject(TemplateRef);
}
