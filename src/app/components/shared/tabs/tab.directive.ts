import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Marks an `ng-template` as a tab inside `app-tabs`.
 *
 * ```html
 * <ng-template appTab="Items"> ... </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[appTab]'
})
export class TabDirective {
  readonly title = input.required<string>({ alias: 'appTab' });
  readonly disabled = input<boolean>(false);

  readonly template = inject(TemplateRef);
}
