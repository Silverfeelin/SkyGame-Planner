import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';
import { ClosetExternalLinkService } from './closet-external-link.service';

@Component({
  selector: 'app-closet-leave-dialog',
  templateUrl: './closet-leave-dialog.component.html',
  styleUrl: './closet-leave-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [OverlayComponent]
})
export class ClosetLeaveDialogComponent {
  private readonly _links = inject(ClosetExternalLinkService);

  readonly url = this._links.pending;
  readonly host = computed(() => ClosetExternalLinkService.hostOf(this.url() || ''));
  readonly urlParts = computed(() => {
    const url = this.url() || '';
    const host = this.host();
    const i = host ? url.indexOf(host) : -1;
    return i < 0 ? { before: url, host: '', after: '' }
      : { before: url.slice(0, i), host, after: url.slice(i + host.length) };
  });
  readonly remember = signal(false);

  continue(): void {
    this._links.confirm(this.remember());
    this.remember.set(false);
  }

  cancel(): void {
    this._links.cancel();
    this.remember.set(false);
  }
}
