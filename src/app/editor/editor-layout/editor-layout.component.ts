import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-editor-layout',
  templateUrl: './editor-layout.component.html',
  styleUrl: './editor-layout.component.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class EditorLayoutComponent {}
