import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-editor-layout',
  templateUrl: './editor-layout.component.html',
  styleUrl: './editor-layout.component.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIcon],
})
export class EditorLayoutComponent {}
