import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { MatIcon } from '@angular/material/icon';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { SpiritType } from 'skygame-data';

@Component({
    selector: 'app-spirit-type-icon',
    templateUrl: './spirit-type-icon.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgSwitch, NgSwitchCase, MatIcon, TooltipDirective, NgSwitchDefault]
})
export class SpiritTypeIconComponent {
  @Input() type?: SpiritType;
}
