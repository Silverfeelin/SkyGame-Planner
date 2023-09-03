import { Component } from '@angular/core';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.less']
})
export class MenuComponent {
  wide = false;
  seasonIconUrl?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _breakpointObserver: BreakpointObserver
  ) {
    _breakpointObserver.observe(['(min-width: 992px)']).subscribe(s => this.onLg(s));
    this.seasonIconUrl = _dataService.seasonConfig.items.at(-1)?.iconUrl;
  }

  onLg(state: BreakpointState): void {
    this.wide = state.matches;
  }
}
