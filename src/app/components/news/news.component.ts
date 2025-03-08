import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../layout/card/card.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-news',
    imports: [CardComponent, RouterLink],
    templateUrl: './news.component.html',
    styleUrl: './news.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent {

}
