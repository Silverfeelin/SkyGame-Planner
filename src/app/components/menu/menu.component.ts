import { Component } from '@angular/core';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.less']
})
export class MenuComponent {
  wide = false;

  constructor(
    private readonly _breakpointObserver: BreakpointObserver
  ) {
    _breakpointObserver.observe(['(min-width: 992px)']).subscribe(s => this.onLg(s));

  }

  onLg(state: BreakpointState): void {
    this.wide = state.matches;
  }
}
