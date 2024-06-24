import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { DateTime } from 'luxon';
import { IEvent } from 'src/app/interfaces/event.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { SpiritTypePipe } from 'src/app/pipes/spirit-type.pipe';
import { DataService } from 'src/app/services/data.service';
import { TitleService } from 'src/app/services/title.service';
import { SpiritTreeComponent } from '../spirit-tree/spirit-tree.component';
import { MatIcon } from '@angular/material/icon';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { NgIf, NgFor } from '@angular/common';
import { SpiritTypeIconComponent } from '../spirit-type-icon/spirit-type-icon.component';

interface ITree {
  date?: DateTime;
  name: string;
  tree: ISpiritTree;
}

@Component({
    selector: 'app-spirit',
    templateUrl: './spirit.component.html',
    styleUrls: ['./spirit.component.less'],
    standalone: true,
    imports: [SpiritTypeIconComponent, NgIf, WikiLinkComponent, RouterLink, MatIcon, NgFor, SpiritTreeComponent]
})
export class SpiritComponent {
  spirit!: ISpirit;
  trees: Array<ITree> = [];
  seasonTrees: { [key: string]: ISpiritTree } = {};
  typeName?: string;
  event?: IEvent;

  highlightTree?: string;
  highlightItem?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _titleService: TitleService,
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
    this._titleService.setTitle(this.spirit.name || 'Spirit');
    this.typeName = new SpiritTypePipe().transform(this.spirit.type);

    this.event = this.spirit?.events?.at(-1)?.eventInstance?.event;

    this.trees = [];

    // Sort TS and returns by date.
    const ts = (this.spirit.ts || []).map(ts => {
      return {
        date: ts.date,
        name: 'Traveling Spirit #' + ts.number,
        tree: ts.tree
      };
    });

    const visits = (this.spirit.returns || []).map((v, vi) => {
      return {
        date: v.return.date,
        name: v.return.name || 'Visit #' + (vi+1),
        tree: v.tree
      };
    });

    const sortedTrees = ts.concat(visits);
    sortedTrees.sort((a, b) => b.date.diff(a.date).as('milliseconds'));

    this.trees = sortedTrees;

    // Add revised spirit trees by newest first.
    if (this.spirit.treeRevisions) {
      for (let i = this.spirit.treeRevisions.length - 1; i >= 0; i--) {
        let tree = this.spirit.treeRevisions[i];
        this.trees.push({ name: tree.name || `Spirit tree (#${i + 2})`, tree });
        if (this.spirit.type === 'Season' || this.spirit.type === 'Guide') {
          this.seasonTrees[tree.guid] = tree;
        }
      }
    }

    // Add spirit tree
    if (this.spirit.tree) {
      this.trees.push({
        name: this.spirit.tree.name || (this.spirit.treeRevisions?.length ? 'Spirit tree (#1)' : 'Spirit tree'),
        tree: this.spirit.tree
      });

      // Mark as season tree for season pass icon.
      if (this.spirit.type === 'Season' || this.spirit.type === 'Guide') {
        this.seasonTrees[this.spirit.tree.guid] = this.spirit.tree;
      }
    }
  }
}
