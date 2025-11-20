import { Component, OnInit } from '@angular/core';
import { DateHelper } from 'src/app/helpers/date-helper';
import { DataService } from 'src/app/services/data.service';
import { SeasonCardComponent } from '../season-card/season-card.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { IconComponent } from "../icon/icon.component";
import { CalendarLinkComponent } from "../util/calendar-link/calendar-link.component";
import { ISeason } from 'skygame-data';

@Component({
    selector: 'app-seasons',
    templateUrl: './seasons.component.html',
    styleUrls: ['./seasons.component.less'],
    imports: [WikiLinkComponent, RouterLink, MatIcon, NgFor, NgbTooltip, SeasonCardComponent, IconComponent, CalendarLinkComponent]
})
export class SeasonsComponent implements OnInit {
  seasons!: Array<ISeason>;
  reverseSeasons!: Array<ISeason>;
  currentSeason?: ISeason;

  years: Array<number> = [];
  yearMap!: { [year: number]: Array<ISeason> };

  constructor(
    private readonly _dataService: DataService
  ) {
    this.seasons = _dataService.seasonConfig.items;
    this.reverseSeasons = this.seasons.slice().reverse();
  }

  ngOnInit(): void {
    let year = this.seasons.at(-1)!.year + 1;
    this.yearMap = {};
    for (let i = this.seasons.length -1; i >= 0; i--) {
      const season = this.seasons[i];

      if (!this.currentSeason && DateHelper.isActive(season.date, season.endDate)) {
        this.currentSeason = season;
      }

      if (season.year < year) {
        year = season.year;
        this.years.push(year);
        this.yearMap[year] = [];
      }

      this.yearMap[year].push(season);
    }
  }
}
