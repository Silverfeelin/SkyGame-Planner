import { Component, OnInit } from '@angular/core';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { SpiritType } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.less']
})
export class RealmsComponent implements OnInit {
  realms!: Array<IRealm>;
  spiritCount!: { [key: string]: number };

  constructor(
    private readonly _dataService: DataService
  ) {
    this.realms = _dataService.realmConfig.items;
  }

  ngOnInit(): void {
    this.spiritCount = {};
    for (const realm of this.realms) {
      // Count spirits in area.
      this.spiritCount[realm.guid] = realm.areas?.reduce((a, v) => {
        return a + (v.spirits ?? []).filter(s => s.type === SpiritType.Regular || s.type === SpiritType.Elder).length
      }, 0) ?? 0;
    }
  }
}
