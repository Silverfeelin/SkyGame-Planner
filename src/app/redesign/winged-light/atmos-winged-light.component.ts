import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { ItemType } from 'skygame-data';

interface IBreakdown {
  label: string;
  unlocked: number;
  total: number;
  icon?: string;
  svgIcon?: string;
  link?: string;
  queryType?: 'Regular' | 'Season';
}

@Component({
  selector: 'app-atmos-winged-light',
  templateUrl: './atmos-winged-light.component.html',
  styleUrl: './atmos-winged-light.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon]
})
export class AtmosWingedLightComponent {
  readonly wedges: ReadonlyArray<number> = [1, 2, 5, 10, 20, 35, 55, 75, 100, 120, 150, 200, 250, 300];
  readonly wedgesReverse: ReadonlyArray<number> = [...this.wedges].reverse();
  readonly wedgeMax = this.wedges.at(-1)!;

  readonly col = signal(0);
  readonly totalCol = signal(0);
  readonly wb = signal(0);
  readonly totalWb = signal(0);

  readonly regularUnlocked = signal(0);
  readonly regularCount = signal(0);
  readonly seasonUnlocked = signal(0);
  readonly seasonCount = signal(0);

  readonly wl = computed(() => this.col() + this.wb());
  readonly totalWl = computed(() => this.totalCol() + this.totalWb());
  readonly wlPercent = computed(() => (this.wl() / this.wedgeMax) * 100);
  readonly wedgeCount = computed(() => this.wedges.filter(w => w <= this.wl()).length);
  readonly wedgeNext = computed(() => this.wedges.at(this.wedgeCount()));

  readonly breakdowns = computed<ReadonlyArray<IBreakdown>>(() => [
    {
      label: 'Children of Light',
      unlocked: this.col(),
      total: this.totalCol(),
      svgIcon: 'flaps',
      link: '/r/col'
    },
    {
      label: 'Wing buffs from regular spirits',
      unlocked: this.regularUnlocked(),
      total: this.regularCount(),
      icon: 'person',
      link: '/r/wing-buff',
      queryType: 'Regular'
    },
    {
      label: 'Wing buffs from seasonal spirits',
      unlocked: this.seasonUnlocked(),
      total: this.seasonCount(),
      icon: 'event',
      link: '/r/wing-buff',
      queryType: 'Season'
    }
  ]);

  constructor(dataService: DataService, storageService: StorageService) {
    this.col.set(storageService.getWingedLights().size);
    this.totalCol.set(dataService.wingedLightConfig.items.length);

    const wb = dataService.itemConfig.items.filter(item => item.type === ItemType.WingBuff);
    this.wb.set(wb.filter(item => item.unlocked).length);
    this.totalWb.set(wb.length);

    let regularCount = 0, regularUnlocked = 0, seasonCount = 0, seasonUnlocked = 0;
    wb.forEach(item => {
      const node = item.nodes?.at(0);
      if (!node) { return; }
      const tree = node.root?.tree;
      const spirit = tree?.spirit ?? tree?.travelingSpirit?.spirit ?? tree?.specialVisitSpirit?.spirit;
      if (!spirit) { return; }
      if (spirit.type === 'Regular') {
        regularCount++;
        if (item.unlocked) { regularUnlocked++; }
      } else if (spirit.type === 'Season') {
        seasonCount++;
        if (item.unlocked) { seasonUnlocked++; }
      }
    });
    this.regularCount.set(regularCount);
    this.regularUnlocked.set(regularUnlocked);
    this.seasonCount.set(seasonCount);
    this.seasonUnlocked.set(seasonUnlocked);
  }

  percent(unlocked: number, total: number): number {
    return total > 0 ? (unlocked / total) * 100 : 0;
  }

  segmentWidth(wedge: number): number {
    return (wedge / this.wedgeMax) * 100;
  }
}
