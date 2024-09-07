import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IEvent } from 'src/app/interfaces/event.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { ITravelingSpirit } from 'src/app/interfaces/traveling-spirit.interface';
import { SpiritTypePipe } from 'src/app/pipes/spirit-type.pipe';
import { CostComponent } from '../util/cost/cost.component';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { DaysLeftComponent } from '../util/days-left/days-left.component';
import { DateComponent } from '../util/date/date.component';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SpiritTypeIconComponent } from '../spirit-type-icon/spirit-type-icon.component';
import { NgIf } from '@angular/common';

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
    standalone: true,
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

  toggleTsSpoiler(): void {
    this.tsSpoiler = !this.tsSpoiler;
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
