import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-checkbox',
    imports: [],
    templateUrl: './checkbox.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  @Input() state: boolean | undefined;
  @Input() falseAsIndeterminate = false;
  @Input() useColors = false;
}
