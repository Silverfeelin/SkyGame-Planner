import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../../menu/menu.component';

@Component({
    selector: 'app-menu-layout',
    templateUrl: './menu-layout.component.html',
    styleUrl: './menu-layout.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MenuComponent, RouterOutlet]
})
export class MenuLayoutComponent implements OnInit, OnDestroy {

  ngOnInit(): void {
    document.body.classList.add('menu-shown');
  }
  ngOnDestroy(): void {
    document.body.classList.remove('menu-shown');
  }
}
