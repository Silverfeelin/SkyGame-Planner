import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { ICost } from 'src/app/interfaces/cost.interface';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet, DecimalPipe } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-cost',
    templateUrl: './cost.component.html',
    styleUrls: ['./cost.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgbTooltip, NgTemplateOutlet, MatIcon, DecimalPipe]
})
export class CostComponent implements OnChanges {
  @Input() cost?: ICost;
  @Input() remaining?: ICost;
  @Input() price?: number;
  @Input() showZeroes = false;
  @Input() showTooltip = true;
  @Input() borderLeft = false;

  completed = false;

  ngOnChanges(): void {
    this.completed = this.remaining ? CostHelper.isEmpty(this.remaining) : false;
  }
}
