import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AtmosQuickActionsComponent } from '@app/redesign/shared/quick-actions/atmos-quick-actions.component';

@Component({
  selector: 'atmos-realm-quick-actions',
  templateUrl: './atmos-realm-quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon, AtmosQuickActionsComponent]
})
export class AtmosRealmQuickActionsComponent {}
