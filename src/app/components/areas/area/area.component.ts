import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IArea } from 'src/app/interfaces/area.interface';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { DataService } from 'src/app/services/data.service';
import { TitleService } from 'src/app/services/title.service';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrl: './area.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaComponent {
  area!: IArea;
  realm!: IRealm;

  spiritCount = 0;
  seasonSpiritCount = 0;
  seasonGuideCount = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onParamsChanged(p: ParamMap): void {
    const guid = p.get('guid');
    this.initializeRealm(guid!);
  }

  private initializeRealm(guid: string): void {
    this.area = this._dataService.guidMap.get(guid!) as IArea;
    this.realm = this.area.realm!;

    this._titleService.setTitle(this.area.name);

    this.spiritCount = 0;
    this.seasonSpiritCount = 0;
    this.seasonGuideCount = 0;

    (this.area.spirits || []).forEach(spirit => {
      if (spirit.type === 'Regular' || spirit.type === 'Elder') {
        this.spiritCount++;
      } else if (spirit.type === 'Season') {
        this.seasonSpiritCount++;
      } else if (spirit.type === 'Guide') {
        this.seasonGuideCount++;
      }
    });

    this._changeDetectorRef.markForCheck();
  }
}
