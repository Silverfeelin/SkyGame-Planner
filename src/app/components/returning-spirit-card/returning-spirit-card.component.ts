import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { CostComponent } from '../util/cost/cost.component';
import { DaysLeftComponent } from '../util/days-left/days-left.component';
import { DateComponent } from '../util/date/date.component';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { TreeHelper } from '@app/helpers/tree-helper';
import { ISpecialVisit, ICost } from 'skygame-data';

type Section = 'img' | 'wiki' | 'date' | 'overview' | 'cost';
export interface ReturningSpiritCardOptions {
  show?: Array<Section>;
}

@Component({
    selector: 'app-returning-spirit-card',
    templateUrl: './returning-spirit-card.component.html',
    styleUrls: ['./returning-spirit-card.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, NgFor, RouterLink, MatIcon, WikiLinkComponent, DateComponent, DaysLeftComponent, CostComponent]
})
export class ReturningSpiritCardComponent implements OnInit, OnChanges {
  @Input() return?: ISpecialVisit;
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
    this.imgUrls = this.return?.imageUrl ? [this.return.imageUrl] : this.return?.spirits.filter(s => s.spirit?.imageUrl).map(s => s.spirit!.imageUrl!) || [];
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
      const nodes = TreeHelper.getNodes(spirit.tree);
      this.cost = CostHelper.add(this.cost!, ...nodes);
      const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
      this.remainingCost = CostHelper.add(this.remainingCost!, ...locked);
    });
  }
}
