import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { SpiritTypePipe } from 'src/app/pipes/spirit-type.pipe';
import { CostComponent } from '../util/cost/cost.component';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { DaysLeftComponent } from '../util/days-left/days-left.component';
import { DateComponent } from '../util/date/date.component';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SpiritTypeIconComponent } from '../spirit-type-icon/spirit-type-icon.component';
import { NgIf } from '@angular/common';
import { TreeHelper } from '@app/helpers/tree-helper';
import { ISpirit, ITravelingSpirit, ISpiritTree, IEvent, ICost } from 'skygame-data';

type Section = 'select' | 'img' | 'overview' | 'wiki' | 'ts' | 'season' | 'event' | 'regular' | 'realm' | 'area' | 'cost' | 'content';
export interface SpiritCardOptions {
  show?: Array<Section>;
  homeBackground?: boolean;
}

@Component({
    selector: 'app-spirit-card',
    templateUrl: './spirit-card.component.html',
    styleUrls: ['./spirit-card.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, SpiritTypeIconComponent, RouterLink, MatIcon, DateComponent, DaysLeftComponent, WikiLinkComponent, CostComponent]
})
export class SpiritCardComponent implements OnInit, OnChanges {
  @Input() spirit?: ISpirit;
  @Input() ts?: ITravelingSpirit;
  @Input() tsSpoiler?: boolean;
  @Input() tree?: ISpiritTree;
  @Input() options: SpiritCardOptions = { show: ['img', 'wiki', 'season', 'event', 'realm', 'area'] };

  @Output() readonly spiritSelected = new EventEmitter<ISpirit>();

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

  selectSpirit(): void {
    this.spiritSelected.emit(this.spirit!);
  }

  revealTsSpoiler(): void {
    this.tsSpoiler = false;
  }

  private updateSpirit(): void {
    this.typeName = new SpiritTypePipe().transform(this.spirit!.type);
    this.event = this.spirit?.eventInstanceSpirits?.at(-1)?.eventInstance?.event;
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
    const nodes = TreeHelper.getNodes(this.tree);
    this.cost = CostHelper.add(CostHelper.create(), ...nodes);

    const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    this.remainingCost = CostHelper.add(CostHelper.create(), ...locked);
  }
}
