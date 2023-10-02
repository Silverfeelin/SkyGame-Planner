import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { ICost } from 'src/app/interfaces/cost.interface';
import { ISeason } from 'src/app/interfaces/season.interface';

type Section = 'img' | 'overview' | 'date' | 'spirits' | 'cost';
export interface SeasonCardOptions {
  show?: Array<Section>;
}

@Component({
  selector: 'app-season-card',
  templateUrl: './season-card.component.html',
  styleUrls: ['./season-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonCardComponent implements OnInit, OnChanges {
  @Input() season?: ISeason;
  @Input() options: SeasonCardOptions = { show: [ 'img', 'overview', 'spirits' ] };

  sections: {[key: string]: number} = {};
  cost?: ICost;
  remainingCost?: ICost;

  ngOnInit(): void {
    this.updateSections();
    this.updateSeason();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) { this.updateSections();}
    if (changes['event']) { this.updateSeason(); }
  }

  private updateSeason(): void {
    this.cost = this.remainingCost = undefined;
    if (!this.season) { return; }
    const nodes = this.season.spirits.map(s => NodeHelper.all(s.tree?.node)).flat();
    this.cost = CostHelper.add(CostHelper.create(), ...nodes);

    const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    this.remainingCost = CostHelper.add(CostHelper.create(), ...locked);
  }

  private updateSections(): void {
    this.sections = {};
    this.options.show?.forEach((section, i) => {
      this.sections[section] = i + 2;
    });
  }
}
