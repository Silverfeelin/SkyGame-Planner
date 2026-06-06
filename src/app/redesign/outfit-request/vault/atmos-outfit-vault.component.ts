import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OutfitVaultComponent } from '@app/components/outfit-request/outfit-vault/outfit-vault.component';
import { AtmosToolQuickActionsComponent } from '@app/redesign/tool/quick-actions/atmos-tool-quick-actions.component';

@Component({
  selector: 'app-atmos-outfit-vault',
  templateUrl: './atmos-outfit-vault.component.html',
  styleUrl: './atmos-outfit-vault.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OutfitVaultComponent, AtmosToolQuickActionsComponent]
})
export class AtmosOutfitVaultComponent {}
