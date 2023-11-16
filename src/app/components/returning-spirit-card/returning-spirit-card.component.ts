import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';

type Section = 'img' | 'wiki' | 'date' | 'overview' | 'cost';
export interface ReturningSpiritCardOptions {
  show?: Array<Section>;
}

@Component({
  selector: 'app-returning-spirit-card',
  templateUrl: './returning-spirit-card.component.html',
  styleUrls: ['./returning-spirit-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturningSpiritCardComponent implements OnInit, OnChanges {
  @Input() return?: IReturningSpirits;
  @Input() options: ReturningSpiritCardOptions = { show: ['img', 'overview', 'date', 'wiki', 'cost'] };

  sections: {[key: string]: number} = {};
  cost?: ICost;
  remainingCost?: ICost;

  imgUrls?: Array<string>;

  ngOnInit(): void {
    this.updateSections();
    this.updateRs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['return']) { this.updateRs(); }
    if (changes['options']) { this.updateSections(); }
  }

  private updateRs(): void {
    this.updateCosts();
    this.imgUrls = this.return?.spirits.filter(s => s.spirit?.imageUrl).map(s => s.spirit!.imageUrl!) || [];
  }

  private updateSections(): void {
    this.sections = {};
    this.options.show?.forEach((section, i) => {
      this.sections[section] = i + 2;
    });
  }

  private updateCosts(): void {
    this.cost = this.remainingCost = undefined;
    if (!this.return) { return; }

    this.cost = CostHelper.create();
    this.remainingCost = CostHelper.create();
    this.return.spirits.forEach(spirit => {
      const nodes = NodeHelper.all(spirit.tree.node);
      this.cost = CostHelper.add(this.cost!, ...nodes);
      const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
      this.remainingCost = CostHelper.add(this.remainingCost!, ...locked);
    });
  }
}
