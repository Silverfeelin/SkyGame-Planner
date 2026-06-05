import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { TitleService } from '@app/services/title.service';
import { SpiritTypeIconComponent } from '@app/components/spirit-type-icon/spirit-type-icon.component';
import { IArea, IRealm } from 'skygame-data';

@Component({
  selector: 'app-atmos-area',
  templateUrl: './atmos-area.component.html',
  styleUrl: './atmos-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, SpiritTypeIconComponent]
})
export class AtmosAreaComponent {
  area!: IArea;
  realm!: IRealm;

  spiritCount = 0;
  seasonSpiritCount = 0;
  seasonGuideCount = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _titleService: TitleService,
    route: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  private onParamsChanged(p: ParamMap): void {
    const guid = p.get('guid');
    this.initialize(guid!);
  }

  private initialize(guid: string): void {
    this.area = this._dataService.guidMap.get(guid) as IArea;
    this.realm = this.area.realm!;
    this._titleService.setTitle(this.area.name);

    this.spiritCount = 0;
    this.seasonSpiritCount = 0;
    this.seasonGuideCount = 0;

    (this.area.spirits || []).forEach(spirit => {
      if (spirit.type === 'Regular' || spirit.type === 'Elder') { this.spiritCount++; }
      else if (spirit.type === 'Season') { this.seasonSpiritCount++; }
      else if (spirit.type === 'Guide') { this.seasonGuideCount++; }
    });

    this._changeDetectorRef.markForCheck();
  }
}
