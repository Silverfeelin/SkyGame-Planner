import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AtmosQuickActionsComponent } from '@app/redesign/shared/quick-actions/atmos-quick-actions.component';

@Component({
  selector: 'app-editor-layout',
  templateUrl: './editor-layout.component.html',
  styleUrl: './editor-layout.component.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIcon, AtmosQuickActionsComponent],
})
export class EditorLayoutComponent {}
