import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpirit, ITravelingSpirit, ISpiritTree, IEvent, ICost } from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { SpiritTypePipe } from '@app/pipes/spirit-type.pipe';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { DateComponent } from '@app/components/util/date/date.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { SpiritTypeIconComponent } from '@app/components/spirit-type-icon/spirit-type-icon.component';

export type AtmosSpiritCardSection =
  | 'select' | 'img' | 'overview' | 'wiki' | 'ts' | 'season'
  | 'event' | 'regular' | 'realm' | 'area' | 'cost' | 'content';

export interface AtmosSpiritCardOptions {
  show?: ReadonlyArray<AtmosSpiritCardSection>;
}

/**
 * Atmospheric spirit summary card. Mirrors the input surface of the legacy
 * `SpiritCardComponent` but renders an atmospheric layout — frosted card,
 * pills, text-shadow titles.
 */
@Component({
  selector: 'app-atmos-spirit-card',
  templateUrl: './atmos-spirit-card.component.html',
  styleUrl: './atmos-spirit-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon,
    SpiritTypeIconComponent,
    CostComponent, DateComponent, DaysLeftComponent, WikiLinkComponent
  ]
})
export class AtmosSpiritCardComponent {
  readonly spirit = input<ISpirit | undefined>(undefined);
  readonly ts = input<ITravelingSpirit | undefined>(undefined);
  readonly tsSpoiler = input<boolean>(false);
  readonly tree = input<ISpiritTree | undefined>(undefined);
  readonly options = input<AtmosSpiritCardOptions>({
    show: ['img', 'wiki', 'season', 'event', 'realm', 'area']
  });

  readonly spiritSelected = output<ISpirit>();

  readonly typeName = computed<string | undefined>(() => {
    const spirit = this.spirit();
    return spirit ? new SpiritTypePipe().transform(spirit.type) : undefined;
  });

  readonly event = computed<IEvent | undefined>(() => {
    return this.spirit()?.eventInstanceSpirits?.at(-1)?.eventInstance?.event;
  });

  /** Map of section → presence (truthy if visible). */
  readonly sections = computed<Record<string, boolean>>(() => {
    const show = this.options().show ?? [];
    const map: Record<string, boolean> = {};
    for (const s of show) { map[s] = true; }
    return map;
  });

  readonly cost = computed<ICost | undefined>(() => {
    const tree = this.tree();
    if (!tree) { return undefined; }
    const nodes = TreeHelper.getNodes(tree);
    return CostHelper.add(CostHelper.create(), ...nodes);
  });

  readonly remainingCost = computed<ICost | undefined>(() => {
    const tree = this.tree();
    if (!tree) { return undefined; }
    const locked = TreeHelper.getNodes(tree).filter(n => !n.unlocked && !n.item?.unlocked);
    return CostHelper.add(CostHelper.create(), ...locked);
  });

  selectSpirit(): void {
    const spirit = this.spirit();
    if (spirit) { this.spiritSelected.emit(spirit); }
  }
}
