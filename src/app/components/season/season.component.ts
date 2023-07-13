import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { IShop } from 'src/app/interfaces/shop.interface';
import { ISpirit, SpiritType } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { IAPService } from 'src/app/services/iap.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.less']
})
export class SeasonComponent {
  season!: ISeason;
  highlightIap?: string;

  guide?: ISpirit;
  spirits: Array<ISpirit> = [];
  shops: Array<IShop> = [];

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onQueryChanged(params: ParamMap): void {
    this.highlightIap = params.get('highlightIap') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.initializeSeason(guid!);
  }

  private initializeSeason(guid: string): void {
    this.season = this._dataService.guidMap.get(guid!) as ISeason;

    this.guide = undefined;
    this.spirits = [];
    this.season?.spirits?.forEach(spirit => {
      switch (spirit.type) {
        case 'Guide':
          this.guide = spirit;
          break;
        case 'Season':
          this.spirits.push(spirit);
          break;
      }
    });

    this.shops = this.season.shops ?? [];
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
