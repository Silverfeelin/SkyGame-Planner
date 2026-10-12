import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FoldableCardComponent } from '../shared/foldable-card/foldable-card.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FoldableCardComponent, RouterLink]
})
export class NewsComponent {
}
