import { Component } from '@angular/core';
import { SpiritType } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-spirits-overview',
  templateUrl: './spirits-overview.component.html',
  styleUrls: ['./spirits-overview.component.less']
})
export class SpiritsOverviewComponent {
  spiritCounts: Record<SpiritType, number> = {} as Record<SpiritType, number>;
  tsCount: number;
  rsCount: number;

  constructor(
    private readonly _dataService: DataService
  ) {
    this.tsCount = _dataService.travelingSpiritConfig.items.length;
    this.rsCount = _dataService.returningSpiritsConfig.items.length;
    this.spiritCounts = this._dataService.spiritConfig.items.reduce((c, s) => {
      c[s.type] = (c[s.type] || 0) + 1;
      return c;
    }, {} as Record<SpiritType,number>);
  }
}
