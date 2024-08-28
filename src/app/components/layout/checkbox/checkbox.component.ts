import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  @Input() state: boolean | undefined;
  @Input() falseAsIndeterminate = false;
  @Input() useColors = false;
}
