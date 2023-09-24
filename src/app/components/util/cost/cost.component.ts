import { Component, Input } from '@angular/core';
import { ICost } from 'src/app/interfaces/cost.interface';

@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: ['./cost.component.less']
})
export class CostComponent {
  @Input() cost?: ICost;
}
