import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { DateTime } from 'luxon';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IEvent, IEventInstance } from 'src/app/interfaces/event.interface';
import { DataService } from 'src/app/services/data.service';
import { StorageService } from 'src/app/services/storage.service';
import { TitleService } from 'src/app/services/title.service';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { DateComponent } from '../util/date/date.component';
import { TableColumnDirective } from '../table/table-column/table-column.directive';
import { TableHeaderDirective } from '../table/table-column/table-header.directive';
import { TableComponent } from '../table/table.component';

interface IRow {
  number: number;
  name: string;
  year: number;
  guid: string;
  date: DateTime;
  endDate: DateTime;
  iaps: number;
  returningIaps: number;
  spirits: number;
  unlockedItems: number;
  totalItems: number;
}

@Component({
    selector: 'app-event',
    templateUrl: './event.component.html',
    styleUrls: ['./event.component.less'],
    standalone: true,
    imports: [TableComponent, TableHeaderDirective, TableColumnDirective, RouterLink, DateComponent, NgIf, NgbTooltip, MatIcon]
})
export class EventComponent implements OnInit {
  event!: IEvent;
  instances!: Array<IEventInstance>;

  rows: Array<IRow> = [];

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.event = this._dataService.guidMap.get(guid!) as IEvent;

    this._titleService.setTitle(this.event.name);

    this.instances = [];
    if (this.event.instances) {
      this.instances.push(...this.event.instances);
    }

    this.initTable();
  }

  initTable(): void {
    this.rows = this.instances.map((instance, i) => {
      // Count IAPs
      let iaps = 0; let returningIaps = 0;
      instance.shops?.forEach(shop => {
        iaps += shop.iaps?.length ?? 0;
        returningIaps += shop.iaps?.filter(v => v.returning).length ?? 0;
      });

      // Count items.
      let unlockedItems = 0; let totalItems = 0;
      instance.spirits?.forEach(spirit => {
        NodeHelper.getItems(spirit.tree.node).forEach(item => {
          if (item.unlocked) { unlockedItems++; }
          totalItems++;
        });
      });

      return {
        number: i+1,
        name: instance.name ?? this.event.name,
        year: instance.date.year,
        guid: instance.guid,
        date: instance.date,
        endDate: instance.endDate,
        iaps,
        returningIaps,
        spirits: instance.spirits?.length ?? 0,
        unlockedItems,
        totalItems
      };
    }).reverse();
  }
}
