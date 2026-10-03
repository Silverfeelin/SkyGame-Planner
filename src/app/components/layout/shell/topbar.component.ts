import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NavigationService } from '@app/navigation/navigation.service';
import { NavTreeComponent } from './nav-tree.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon, NavTreeComponent]
})
export class TopbarComponent {
  private readonly location = inject(Location);
  readonly nav = inject(NavigationService);

  readonly drawerOpen = signal(false);

  goBack(): void {
    this.closeDrawer();
    this.location.back();
  }

  toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
