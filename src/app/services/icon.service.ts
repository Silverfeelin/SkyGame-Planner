import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface IIconConfig {
  files: Array<{
    file: string;
    coordinates: { [key: string]: { x: number, y: number }};
    width: number;
    height: number;
  }>;
}

export interface IMappedIcon {
  file: string;
  url: string;
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class IconService {
  config!: IIconConfig;
  icons: { [key: string]: IMappedIcon } = {};

  constructor(
    private readonly _http: HttpClient
  ) {}

  getSheets(): Array<string> {
    return this.config.files.map(entry => entry.file);
  }

  getIcon(path: string): IMappedIcon | undefined {
    return this.icons[path];
  }

  loadData(): Observable<unknown> {
    return this._http.get<IIconConfig>('/assets/game/icons.json').pipe(
      tap(data => this.onData(data))
    );
  }

  private onData(data: IIconConfig): void {
    this.config = data;
    for (const entry of data.files) {
      const url = `/assets/game/${entry.file}`;
      for (const key in entry.coordinates) {
        const value = entry.coordinates[key];
        this.icons[key] = {
          file: entry.file,
          url,
          x: value.x,
          y: value.y
        };
      }
    }
  }
}
