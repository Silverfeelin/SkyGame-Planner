import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

interface ITree {
  date?: Date;
  name: string;
  tree: ISpiritTree;
}

@Component({
  selector: 'app-spirit',
  templateUrl: './spirit.component.html',
  styleUrls: ['./spirit.component.less']
})
export class SpiritComponent {
  spirit!: ISpirit;
  trees: Array<ITree> = [];

  highlightTree?: string;
  highlightItem?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightTree = p.get('highlightTree') || undefined;
    this.highlightItem = p.get('highlightItem') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.spirit = this._dataService.guidMap.get(guid!) as ISpirit;
    this.trees = [];

    // Sort TS and returns by date.
    const ts = (this.spirit.ts || []).map(ts => {
      return {
        date: ts.date as Date,
        name: 'Traveling Spirit #' + ts.number,
        tree: ts.tree
      };
    });

    const visits = (this.spirit.returns || []).map((v, vi) => {
      return {
        date: v.return.date as Date,
        name: v.return.name || 'Visit #' + (vi+1),
        tree: v.tree
      };
    });

    const sortedTrees = ts.concat(visits);
    sortedTrees.sort((a, b) => b.date.getTime() - a.date.getTime());

    this.trees = sortedTrees;
    if (this.spirit.tree) {
      this.trees.push({ name: 'Spirit tree', tree: this.spirit.tree });
    }
  }
}
