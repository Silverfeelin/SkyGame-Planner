import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClosetComponent } from '@app/components/outfit-request/closet/closet.component';
import { AtmosToolQuickActionsComponent } from '@app/redesign/tool/quick-actions/atmos-tool-quick-actions.component';

@Component({
  selector: 'app-atmos-closet',
  templateUrl: './atmos-closet.component.html',
  styleUrl: './atmos-closet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClosetComponent, AtmosToolQuickActionsComponent]
})
export class AtmosClosetComponent {}
