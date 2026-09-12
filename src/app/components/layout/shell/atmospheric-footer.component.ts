import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-atmospheric-footer',
  templateUrl: './atmospheric-footer.component.html',
  styleUrl: './atmospheric-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class AtmosphericFooterComponent {}
