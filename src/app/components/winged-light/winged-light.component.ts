import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-winged-light',
  templateUrl: './winged-light.component.html',
  styleUrls: ['./winged-light.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WingedLightComponent {
  wb = 0; totalWb = 0;
  col = 0; totalCol = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService,
  ) {
    this.col = _storageService.unlockedCol.size;
    this.totalCol = this._dataService.wingedLightConfig.items.length;

    const wb = this._dataService.itemConfig.items.filter(item => item.type === ItemType.WingBuff);
    this.wb = wb.filter(item => item.unlocked).length;
    this.totalWb = wb.length;
  }
}
