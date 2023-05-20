import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IEvent, IEventInstance } from 'src/app/interfaces/event.interface';
import { DataService } from 'src/app/services/data.service';

interface IRow {
  number: number;
  name: string;
  year: number;
  guid: string;
  date: Date;
  endDate: Date;
  iaps: number;
  returningIaps: number;
  spirits: number;
  unlockedItems: number;
  totalItems: number;
}

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.less']
})
export class EventComponent implements OnInit {
  event!: IEvent;
  instances!: Array<IEventInstance>;

  rows: Array<IRow> = [];

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.event = this._dataService.guidMap.get(guid!) as IEvent;

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
        name: this.event.name,
        year: (instance.date as Date).getFullYear(),
        guid: instance.guid,
        date: instance.date as Date,
        endDate: instance.endDate as Date,
        iaps,
        returningIaps,
        spirits: instance.spirits?.length ?? 0,
        unlockedItems,
        totalItems
      };
    }).reverse();
  }
}
