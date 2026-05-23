import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-atmos-search-bar',
  templateUrl: './atmos-search-bar.component.html',
  styleUrl: './atmos-search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon]
})
export class AtmosSearchBarComponent {
  readonly favouriteCount = input<number>(0);
}
