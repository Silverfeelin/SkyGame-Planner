import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { DataService } from 'src/app/services/data.service';
import { Router, RouterLinkActive, RouterLink } from '@angular/router';
import { EventService } from 'src/app/services/event.service';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { Location, NgIf } from '@angular/common';
import { IconComponent } from "../icon/icon.component";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.less'],
    standalone: true,
    imports: [NgIf, NgbTooltip, MatIcon, RouterLinkActive, RouterLink, IconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  wide = false;
  seasonIconUrl?: string;
  folded = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _location: Location,
    private readonly _router: Router
  ) {
    _breakpointObserver.observe(['(min-width: 992px)']).subscribe(s => this.onLg(s));
    this.seasonIconUrl = _dataService.seasonConfig.items.at(-1)?.iconUrl;
    this.updateFolded(localStorage.getItem('menu.folded') === '1');
  }

  onLg(state: BreakpointState): void {
    this.wide = state.matches;
    this._changeDetectorRef.markForCheck();
  }

  goBack(): void {
    this._location.back();
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
    this._eventService.menuFolded.next(this.folded);
  }

  private updateFolded(folded: boolean): void {
    this.folded = folded;
    document.body.classList.toggle('menu-folded', this.folded);
    localStorage.setItem('menu.folded', this.folded ? '1' : '0');
  }
}
