import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpiritType } from 'src/app/interfaces/spirit.interface';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatIcon } from '@angular/material/icon';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
    selector: 'app-spirit-type-icon',
    templateUrl: './spirit-type-icon.component.html',
    styleUrls: ['./spirit-type-icon.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgSwitch, NgSwitchCase, MatIcon, NgbTooltip, NgSwitchDefault]
})
export class SpiritTypeIconComponent {
  @Input() type?: SpiritType;
}
