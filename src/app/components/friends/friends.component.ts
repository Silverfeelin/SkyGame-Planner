import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { WikiLinkComponent } from "../util/wiki-link/wiki-link.component";
import { SpiritTreeComponent } from "../spirit-tree/spirit-tree.component";
import { DataService } from '@app/services/data.service';
import { CommonModule } from '@angular/common';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { DateTime } from 'luxon';

interface IFriendshipTree {
  date?: DateTime;
  name: string;
  tree: ISpiritTree;
}

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, RouterLink, WikiLinkComponent, SpiritTreeComponent, CommonModule]
})
export class FriendsComponent {
  highlightTree?: string;
  highlightItem?: string;

  friends: Array<IFriendshipTree> = [];

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

  }
}
