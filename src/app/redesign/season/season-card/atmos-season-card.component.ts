import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISeason, ICost } from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { DateComponent } from '@app/components/util/date/date.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';

export type AtmosSeasonCardSection =
  | 'img' | 'overview' | 'date' | 'spirits' | 'cost' | 'dailies' | 'checkin' | 'calculator';

export interface AtmosSeasonCardOptions {
  show?: ReadonlyArray<AtmosSeasonCardSection>;
}

/**
 * Atmospheric season summary card. Mirrors `SeasonCardComponent` inputs.
 * Daily check-in / currency side-effects are intentionally not implemented;
 * pages can wire them up via the (checkinToggle) output if needed.
 */
@Component({
  selector: 'app-atmos-season-card',
  templateUrl: './atmos-season-card.component.html',
  styleUrl: './atmos-season-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, CostComponent, DateComponent, DaysLeftComponent]
})
export class AtmosSeasonCardComponent {
  readonly season = input<ISeason | undefined>(undefined);
  readonly options = input<AtmosSeasonCardOptions>({ show: ['img', 'overview', 'spirits'] });
  readonly checkedIn = input<boolean>(false);

  readonly checkinToggle = output<MouseEvent>();

  readonly sections = computed<Record<string, boolean>>(() => {
    const show = this.options().show ?? [];
    const map: Record<string, boolean> = {};
    for (const s of show) { map[s] = true; }
    return map;
  });

  readonly imageStyle = computed<string | undefined>(() => {
    const url = this.season()?.imageUrl;
    return url ? `url('${url}')` : undefined;
  });

  readonly cost = computed<ICost | undefined>(() => {
    const s = this.season();
    if (!s) { return undefined; }
    const nodes = s.spirits.flatMap(sp => sp.tree ? TreeHelper.getNodes(sp.tree) : []);
    return CostHelper.add(CostHelper.create(), ...nodes);
  });

  readonly remainingCost = computed<ICost | undefined>(() => {
    const s = this.season();
    if (!s) { return undefined; }
    const nodes = s.spirits.flatMap(sp => sp.tree ? TreeHelper.getNodes(sp.tree) : []);
    const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    return CostHelper.add(CostHelper.create(), ...locked);
  });

  onCheckin(event: MouseEvent): void {
    this.checkinToggle.emit(event);
  }
}
