import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import dayjs from 'dayjs';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { DateHelper } from 'src/app/helpers/date-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IEvent, IEventInstance } from 'src/app/interfaces/event.interface';

type Section = 'img' | 'date' | 'overview' | 'list' | 'recent' | 'cost';
export interface EventCardOptions {
  show?: Array<Section>;
}

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCardComponent implements OnChanges {
  @Input() event?: IEvent;
  @Input() instance?: IEventInstance;
  @Input() options: EventCardOptions = { show: ['img', 'list', 'recent']};

  sections: {[key: string]: number} = {};
  lastInstance?: IEventInstance;
  cost?: ICost;
  remainingCost?: ICost;

  ngOnInit(): void {
    this.updateSections();
    this.updateEvent();
    this.updateInstance();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) { this.updateSections(); }
    if (changes['event']) { this.updateEvent(); }
    if (changes['instance']) { this.updateInstance(); }
  }

  private updateEvent(): void {
    // Find last instance based on event.date.
    if (this.event?.instances) {
      const now = dayjs();
      this.lastInstance = this.event.instances.findLast<IEventInstance>(i => DateHelper.isActive(i.date, i.endDate));
      this.lastInstance ??= this.event.instances.findLast(i => i.date.isBefore(now));
    }
  }

  private updateInstance(): void {
    this.cost = this.remainingCost = undefined;

    if (!this.instance) { return; }
    const nodes = this.instance.spirits.map(s => NodeHelper.all(s.tree?.node)).flat();
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