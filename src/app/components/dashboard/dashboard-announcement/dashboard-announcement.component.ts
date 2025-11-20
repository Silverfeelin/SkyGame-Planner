import { Component, signal } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { DateTime } from "luxon";

const announcement = {
  guid: 'wJuf0SyLA8',
  endDate: DateTime.local(2025, 11, 27)
}

@Component({
    selector: 'app-dashboard-announcement',
    templateUrl: './dashboard-announcement.component.html',
    styleUrls: [],
    imports: [ MatIcon ]
})
export class DashboardAnnouncementComponent {
  isAnnouncementVisible = signal(false);

  constructor() {
    this.isAnnouncementVisible.set(localStorage.getItem('announcement.dismissed') !== announcement.guid
      && DateTime.now() < announcement.endDate);
  }

  dismiss(): void {
    localStorage.setItem('announcement.dismissed', announcement.guid);
    this.isAnnouncementVisible.set(false);
  }
}
