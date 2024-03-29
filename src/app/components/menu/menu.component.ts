import { Component } from '@angular/core';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.less']
})
export class MenuComponent {
  wide = false;
  seasonIconUrl?: string;
  folded = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _router: Router
  ) {
    _breakpointObserver.observe(['(min-width: 992px)']).subscribe(s => this.onLg(s));
    this.seasonIconUrl = _dataService.seasonConfig.items.at(-1)?.iconUrl;
    this.updateFolded(localStorage.getItem('menu.folded') === '1');
  }

  onLg(state: BreakpointState): void {
    this.wide = state.matches;
  }

  gotoHome(evt: MouseEvent): void {
    evt.preventDefault();
    // Force refresh page.
    void this._router.navigate(['/blank'], { skipLocationChange: true }).then(() => {
      void this._router.navigate(['/']);
    });
  }

  foldMenu(): void {
    this.updateFolded(!this.folded);
  }

  private updateFolded(folded: boolean): void {
    this.folded = folded;
    document.body.classList.toggle('menu-folded', this.folded);
    localStorage.setItem('menu.folded', this.folded ? '1' : '0');
  }
}
