import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpiritType } from 'src/app/interfaces/spirit.interface';

@Component({
  selector: 'app-spirit-type-icon',
  templateUrl: './spirit-type-icon.component.html',
  styleUrls: ['./spirit-type-icon.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpiritTypeIconComponent {
  @Input() type?: SpiritType;
}
