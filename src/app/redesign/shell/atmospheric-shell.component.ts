import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AtmosphericFooterComponent } from './atmospheric-footer.component';
import { AtmosphericSidebarComponent } from './atmospheric-sidebar.component';
import { AtmosphericTopbarComponent } from './atmospheric-topbar.component';

@Component({
  selector: 'app-atmospheric-shell',
  templateUrl: './atmospheric-shell.component.html',
  styleUrl: './atmospheric-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'atmospheric' },
  imports: [RouterOutlet, AtmosphericSidebarComponent, AtmosphericTopbarComponent, AtmosphericFooterComponent]
})
export class AtmosphericShellComponent {}
