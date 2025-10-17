import { Component, signal } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { DateTime } from "luxon";

const announcement = {
  guid: 'UancMoW12R',
  endDate: DateTime.local(2025, 10, 27)
}

@Component({
    selector: 'app-dashboard-announcement',
    templateUrl: './dashboard-announcement.component.html',
    styleUrls: [],
    imports: [ MatIcon, RouterLink ]
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
