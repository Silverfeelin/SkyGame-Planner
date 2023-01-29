import { Component, OnInit } from '@angular/core';
import { ISeason } from 'src/app/interfaces/season.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-seasons',
  templateUrl: './seasons.component.html',
  styleUrls: ['./seasons.component.less']
})
export class SeasonsComponent implements OnInit {
  years: Array<number> = [];
  yearMap: { [year: number]: Array<ISeason> } = {};
  seasons!: Array<ISeason>;

  constructor(
    private readonly _dataService: DataService
  ) {
    this.seasons = _dataService.seasonConfig.items;
  }

  ngOnInit(): void {
    let year = this.seasons.at(-1)!.year + 1;
    for (let i = this.seasons.length -1; i >= 0; i--) {
      const season = this.seasons[i];
      if (season.year < year) {
        year = season.year;
        this.years.push(year);
        this.yearMap[year] = [];
      }
    }

    this.seasons.forEach(season => {
      this.yearMap[season.year].push(season);
    });
  }
}
