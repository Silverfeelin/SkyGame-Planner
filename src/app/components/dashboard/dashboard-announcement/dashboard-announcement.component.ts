import { Component, signal } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { DateTime } from "luxon";

const announcement = {
  guid: 'pR7kNzT4Xq',
  endDate: DateTime.local(2026, 9, 27),
  dismissable: false
}

@Component({
    selector: 'app-dashboard-announcement',
    templateUrl: './dashboard-announcement.component.html',
    styleUrls: [],
    imports: [ MatIcon ]
})
export class DashboardAnnouncementComponent {
  isAnnouncementVisible = signal(false);
  dismissable = signal(announcement.dismissable);

  constructor() {
    this.isAnnouncementVisible.set(localStorage.getItem('announcement.dismissed') !== announcement.guid
      && DateTime.now() < announcement.endDate);
  }

  dismiss(): void {
    localStorage.setItem('announcement.dismissed', announcement.guid);
    this.isAnnouncementVisible.set(false);
  }
}
