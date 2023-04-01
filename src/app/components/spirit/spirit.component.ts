import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-spirit',
  templateUrl: './spirit.component.html',
  styleUrls: ['./spirit.component.less']
})
export class SpiritComponent {
  spirit?: ISpirit;
  tree?: ISpiritTree;

  highlightTree?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightTree = p.get('highlightTree') || undefined;

    // Add tree from query (i.e. event spirit).
    const addTree = p.get('tree') || undefined;
    if (addTree) {
      this.tree = this._dataService.guidMap.get(addTree) as ISpiritTree;
    }
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.spirit = guid ? this._dataService.guidMap.get(guid) as ISpirit : undefined;
  }
}
