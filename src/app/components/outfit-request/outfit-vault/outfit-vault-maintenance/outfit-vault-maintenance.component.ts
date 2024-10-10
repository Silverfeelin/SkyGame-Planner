import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-outfit-vault-maintenance',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './outfit-vault-maintenance.component.html',
  styleUrl: './outfit-vault-maintenance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutfitVaultMaintenanceComponent {

}
