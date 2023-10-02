import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { ICost } from 'src/app/interfaces/cost.interface';

@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: ['./cost.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CostComponent implements OnChanges {
  @Input() cost?: ICost;
  @Input() remaining?: ICost;
  @Input() borderLeft = false;

  completed = false;

  ngOnChanges(): void {
    this.completed = this.remaining ? CostHelper.isEmpty(this.remaining) : false;
  }
}
