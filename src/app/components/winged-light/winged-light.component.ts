import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { StorageService } from 'src/app/services/storage.service';
import { SpiritTypeIconComponent } from '../spirit-type-icon/spirit-type-icon.component';
import { MatIcon } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { ItemType } from 'skygame-data';

@Component({
    selector: 'app-winged-light',
    templateUrl: './winged-light.component.html',
    styleUrls: ['./winged-light.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WikiLinkComponent, RouterLink, NgFor, NgIf, MatIcon, SpiritTypeIconComponent]
})
export class WingedLightComponent {
  wb = 0; totalWb = 0;
  col = 0; totalCol = 0;
  wl = 0; totalWl = 0;

  wedgeCount = 0;
  wedges = [1, 2, 5, 10, 20, 35, 55, 75, 100, 120, 150, 200, 250, 300];
  wedgesReverse = this.wedges.slice().reverse();
  wedgeMax = this.wedges.at(-1)!;
  wedgeNext?: number;

  regularCount = 0;
  regularUnlocked = 0;
  seasonCount = 0;
  seasonUnlocked = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService,
  ) {
    this.col = _storageService.getWingedLights().size;
    this.totalCol = this._dataService.wingedLightConfig.items.length;

    const wb = this._dataService.itemConfig.items.filter(item => item.type === ItemType.WingBuff);
    this.wb = wb.filter(item => item.unlocked).length;
    this.totalWb = wb.length;

    this.wl = this.wb + this.col;
    this.totalWl = this.totalWb + this.totalCol;

    this.wedgeCount = this.wedges.filter(w => w <= this.wl).length;
    this.wedgeNext = this.wedges.at(this.wedgeCount);

    // Count the amount of wing buffs unlocked through regular and season spirits.
    this.regularCount = 0;
    this.regularUnlocked = 0;
    this.seasonCount = 0;
    this.seasonUnlocked = 0;

    wb.forEach(item => {
      const node = item.nodes?.at(0);
      if (!node) { return; }
      const tree = node.root?.spiritTree;
      const spirit = tree?.spirit ?? tree?.ts?.spirit ?? tree?.visit?.spirit;
      if (!spirit) { return; }
      if (spirit.type === 'Regular') {
        this.regularCount++;
        if (item.unlocked) { this.regularUnlocked++; }
      } else if (spirit.type === 'Season') {
        this.seasonCount++;
        if (item.unlocked) { this.seasonUnlocked++; }
      }
    });
  }
}
