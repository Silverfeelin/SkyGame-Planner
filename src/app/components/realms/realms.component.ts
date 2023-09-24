import { Component, OnInit } from '@angular/core';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.less']
})
export class RealmsComponent {
  realms!: Array<IRealm>;
  visibleRealms!: Array<IRealm>;

  constructor(
    private readonly _dataService: DataService
  ) {
    this.realms = _dataService.realmConfig.items;
    this.visibleRealms = this.realms.filter(r => !r.hidden);
  }
}
