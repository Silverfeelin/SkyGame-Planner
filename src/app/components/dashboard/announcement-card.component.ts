import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { RouterLink } from '@angular/router';

const announcement = {
  guid: 'p4exRjdm7R',
  endDate: DateTime.local(2027, 1, 1),
  dismissable: true
};

@Component({
  selector: 'app-dashboard-announcement',
  templateUrl: './announcement-card.component.html',
  styleUrl: './announcement-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, RouterLink]
})
export class DashboardAnnouncementComponent {
  readonly dismissable = announcement.dismissable;
  readonly isVisible = signal(
    localStorage.getItem('announcement.dismissed') !== announcement.guid
    && DateTime.now() < announcement.endDate
  );

  dismiss(): void {
    localStorage.setItem('announcement.dismissed', announcement.guid);
    this.isVisible.set(false);
  }
}
