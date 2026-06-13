import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type VaultMode = 'selection' | 'picking' | 'results' | 'submit';

@Component({
  selector: 'atmos-vault-selection',
  templateUrl: './atmos-vault-selection.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class AtmosVaultSelectionComponent {
  mode = input<VaultMode>('selection');
  modeChange = output<VaultMode>();

  selectMode(m: VaultMode): void {
    this.modeChange.emit(m);
  }
}
