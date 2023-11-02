import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import dayjs from 'dayjs';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { DateHelper } from 'src/app/helpers/date-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { ICost } from 'src/app/interfaces/cost.interface';
import { ISeason } from 'src/app/interfaces/season.interface';

type Section = 'img' | 'overview' | 'date' | 'spirits' | 'cost' | 'checkin';
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
  checkedIn = false;
  imageUrlSafe?: string;

  ngOnInit(): void {
    this.updateSections();
    this.updateSeason();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) { this.updateSections();}
    if (changes['season']) { this.updateSeason(); }
  }

  private updateSeason(): void {
    this.cost = this.remainingCost = undefined;
    if (!this.season) { return; }
    const nodes = this.season.spirits.map(s => NodeHelper.all(s.tree?.node)).flat();
    this.cost = CostHelper.add(CostHelper.create(), ...nodes);

    const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    this.remainingCost = CostHelper.add(CostHelper.create(), ...locked);

    this.imageUrlSafe = this.season.imageUrl ? `url('${this.season.imageUrl}')` : undefined;

    this.updateCheckin();
  }

  checkin(): void {
    this.checkedIn = !this.checkedIn;
    if (this.checkedIn) {
      localStorage.setItem(`season.checkin.${this.season?.guid}`, dayjs.tz().format('YYYY-MM-DD'));
    } else {
      localStorage.removeItem(`season.checkin.${this.season?.guid}`);
    }
  }

  /** Update checked in status from storage. */
  private updateCheckin(): void {
    const checkinDate = localStorage.getItem(`season.checkin.${this.season?.guid}`);
    if (checkinDate) {
      const d = dayjs.tz(checkinDate, 'YYYY-MM-DD', DateHelper.skyTimeZone);
      this.checkedIn = d.isSame(dayjs.tz(), 'day');
    }
  }

  private updateSections(): void {
    this.sections = {};
    this.options.show?.forEach((section, i) => {
      this.sections[section] = i + 2;
    });
  }
}
