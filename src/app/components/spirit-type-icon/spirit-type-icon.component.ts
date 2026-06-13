import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatIcon } from '@angular/material/icon';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { SpiritType } from 'skygame-data';

@Component({
    selector: 'app-spirit-type-icon',
    templateUrl: './spirit-type-icon.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgSwitch, NgSwitchCase, MatIcon, NgbTooltip, NgSwitchDefault]
})
export class SpiritTypeIconComponent {
  @Input() type?: SpiritType;
}
