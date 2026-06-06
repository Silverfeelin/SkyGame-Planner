import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CollageComponent } from '@app/components/outfit-request/collage/collage.component';
import { AtmosToolQuickActionsComponent } from '@app/redesign/tool/quick-actions/atmos-tool-quick-actions.component';

@Component({
  selector: 'app-atmos-collage',
  templateUrl: './atmos-collage.component.html',
  styleUrl: './atmos-collage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CollageComponent, AtmosToolQuickActionsComponent]
})
export class AtmosCollageComponent {}
