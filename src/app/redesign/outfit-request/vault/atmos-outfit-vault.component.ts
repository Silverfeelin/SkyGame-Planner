import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OutfitVaultComponent } from '@app/components/outfit-request/outfit-vault/outfit-vault.component';

@Component({
  selector: 'app-atmos-outfit-vault',
  templateUrl: './atmos-outfit-vault.component.html',
  styleUrl: './atmos-outfit-vault.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OutfitVaultComponent]
})
export class AtmosOutfitVaultComponent {}
