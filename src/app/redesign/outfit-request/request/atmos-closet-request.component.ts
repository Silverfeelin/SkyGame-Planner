import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClosetComponent } from '@app/components/outfit-request/closet/closet.component';

/**
 * Chromeless host for the outfit-request flow. Mounted outside the atmospheric
 * shell (no sidebar / topbar / footer) so requests render cleanly when shared.
 * The legacy ClosetComponent inspects `location.pathname.endsWith('request')`
 * to flip into request mode — `/r/outfit-request/request` still satisfies that.
 */
@Component({
  selector: 'app-atmos-closet-request',
  templateUrl: './atmos-closet-request.component.html',
  styleUrl: './atmos-closet-request.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'atmospheric' },
  imports: [ClosetComponent]
})
export class AtmosClosetRequestComponent {}
