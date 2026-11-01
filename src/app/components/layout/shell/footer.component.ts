import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { TranslatePipe } from '@app/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, RouterLink, TranslatePipe]
})
export class FooterComponent {}
