import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpecialVisit, ICost } from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { DateRangeComponent } from '@app/components/util/date-range/date-range.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';

export type ReturningSpiritCardSection = 'img' | 'wiki' | 'date' | 'overview' | 'cost';

export interface ReturningSpiritCardOptions {
  show?: ReadonlyArray<ReturningSpiritCardSection>;
}

/**
 * Returning-spirit (RS) summary card.
 */
@Component({
  selector: 'app-returning-spirit-card',
  templateUrl: './returning-spirit-card.component.html',
  styleUrl: './returning-spirit-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, CostComponent, DateRangeComponent, DaysLeftComponent, WikiLinkComponent]
})
export class ReturningSpiritCardComponent {
  readonly return = input<ISpecialVisit | undefined>(undefined);
  readonly options = input<ReturningSpiritCardOptions>({
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
