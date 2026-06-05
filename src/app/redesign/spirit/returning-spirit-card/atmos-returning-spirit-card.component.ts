import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpecialVisit, ICost } from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { DateComponent } from '@app/components/util/date/date.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';

export type AtmosReturningSpiritCardSection = 'img' | 'wiki' | 'date' | 'overview' | 'cost';

export interface AtmosReturningSpiritCardOptions {
  show?: ReadonlyArray<AtmosReturningSpiritCardSection>;
}

/**
 * Atmospheric returning-spirit (RS) summary card.
 * Mirrors the legacy `ReturningSpiritCardComponent`.
 */
@Component({
  selector: 'app-atmos-returning-spirit-card',
  templateUrl: './atmos-returning-spirit-card.component.html',
  styleUrl: './atmos-returning-spirit-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, CostComponent, DateComponent, DaysLeftComponent, WikiLinkComponent]
})
export class AtmosReturningSpiritCardComponent {
  readonly return = input<ISpecialVisit | undefined>(undefined);
  readonly options = input<AtmosReturningSpiritCardOptions>({
    show: ['img', 'overview', 'date', 'wiki', 'cost']
  });

  readonly sections = computed<Record<string, boolean>>(() => {
    const show = this.options().show ?? [];
    const map: Record<string, boolean> = {};
    for (const s of show) { map[s] = true; }
    return map;
  });

  readonly imageUrls = computed<ReadonlyArray<string>>(() => {
    const r = this.return();
    if (!r) { return []; }
    if (r.imageUrl) { return [r.imageUrl]; }
    return r.spirits.filter(s => s.spirit?.imageUrl).map(s => s.spirit!.imageUrl!);
  });

  readonly cost = computed<ICost | undefined>(() => {
    const r = this.return();
    if (!r) { return undefined; }
    const cost = CostHelper.create();
    for (const s of r.spirits) {
      const nodes = TreeHelper.getNodes(s.tree);
      CostHelper.add(cost, ...nodes);
    }
    return cost;
  });

  readonly remainingCost = computed<ICost | undefined>(() => {
    const r = this.return();
    if (!r) { return undefined; }
    const cost = CostHelper.create();
    for (const s of r.spirits) {
      const locked = TreeHelper.getNodes(s.tree).filter(n => !n.unlocked && !n.item?.unlocked);
      CostHelper.add(cost, ...locked);
    }
    return cost;
  });
}
