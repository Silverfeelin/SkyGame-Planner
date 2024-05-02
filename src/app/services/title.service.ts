import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  constructor(
    private readonly _title: Title
  ) { }

  setTitle(title: string): void {
    this._title.setTitle(title ? `${title} - Sky Planner` : 'Sky Planner');
  }
}
