import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { QuickActionsComponent } from '@app/components/shared/quick-actions/quick-actions.component';

@Component({
  selector: 'app-shop-quick-actions',
  templateUrl: './shop-quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon, QuickActionsComponent]
})
export class ShopQuickActionsComponent {}
