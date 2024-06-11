import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IEvent } from 'src/app/interfaces/event.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { ITravelingSpirit } from 'src/app/interfaces/traveling-spirit.interface';
import { SpiritTypePipe } from 'src/app/pipes/spirit-type.pipe';

type Section = 'img' | 'overview' | 'wiki' | 'ts' | 'season' | 'event' | 'regular' | 'realm' | 'area' | 'cost' | 'content';
export interface SpiritCardOptions {
  show?: Array<Section>;
  homeBackground?: boolean;
}

@Component({
  selector: 'app-spirit-card',
  templateUrl: './spirit-card.component.html',
  styleUrls: ['./spirit-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpiritCardComponent implements OnInit, OnChanges {
  @Input() spirit?: ISpirit;
  @Input() ts?: ITravelingSpirit;
  @Input() tree?: ISpiritTree;
  @Input() options: SpiritCardOptions = { show: ['img', 'wiki', 'season', 'event', 'realm', 'area'] };

  sections: {[key: string]: number} = {};
  event?: IEvent;
  typeName?: string;
  cost?: ICost;
  remainingCost?: ICost;

  ngOnInit(): void {
    this.updateSections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['spirit']) { this.updateSpirit(); }
    if (changes['options']) { this.updateSections(); }
    if (changes['tree']) { this.updateCosts(); }
  }

  private updateSpirit(): void {
    this.typeName = new SpiritTypePipe().transform(this.spirit!.type);
    this.event = this.spirit?.events?.at(-1)?.eventInstance?.event;
  }

  private updateSections(): void {
    this.sections = {};
    this.options.show?.forEach((section, i) => {
      this.sections[section] = i + 2;
    });
  }

  private updateCosts(): void {
    this.cost = this.remainingCost = undefined;
    if (!this.tree) { return; }
    const nodes = NodeHelper.all(this.tree.node);
    this.cost = CostHelper.add(CostHelper.create(), ...nodes);

    const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    this.remainingCost = CostHelper.add(CostHelper.create(), ...locked);
  }
}
