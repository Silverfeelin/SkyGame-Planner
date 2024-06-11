import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

interface ILastVisit {
  spirit: ISpirit;
  type: 'Season' | 'Traveling Spirit' | 'Special Visit';
  date: DateTime;
  endDate: DateTime;
  days: number;
}

@Component({
  selector: 'app-elusive-spirits',
  templateUrl: './elusive-spirits.component.html',
  styleUrl: './elusive-spirits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElusiveSpiritsComponent {
  spirits!: Array<ISpirit>;
  lastVisits!: Array<ILastVisit>;

  constructor(
    private readonly _dataService: DataService
  ) {
    this.initializeSpirits();
  }

  private initializeSpirits(): void {
    this.spirits = this._dataService.spiritConfig.items.filter(s => s.type === 'Season');
    this.lastVisits = this.spirits.map(s => this.getLastVisitBySpirit(s));
    this.lastVisits.sort((a, b) => a.endDate < b.endDate ? -1 : 1);
    this.lastVisits = this.lastVisits.slice(0, 32);
  }

  private getLastVisitBySpirit(spirit: ISpirit): ILastVisit {
    // Start at season.
    const lastVisit: ILastVisit = {
      spirit,
      date: spirit.season!.date,
      endDate: spirit.season!.endDate,
      type: 'Season',
      days: 0
    };

    // Check for most recent TS.
    const ts = spirit.ts?.at(-1);
    if (ts && ts?.date > lastVisit.date) {
      lastVisit.date = ts.date;
      lastVisit.endDate = ts.endDate;
      lastVisit.type = 'Traveling Spirit';
    }

    // Check for most recent special visit.
    const rs = spirit.returns?.at(-1);
    if (rs && rs.return.date > lastVisit.date) {
      lastVisit.date = rs.return.date;
      lastVisit.endDate = rs.return.endDate;
      lastVisit.type = 'Special Visit';
    }

    lastVisit.days = DateHelper.daysBetween(DateTime.now(), lastVisit.endDate);

    return lastVisit;
  }
}
