import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(
    private readonly _http: HttpClient
  ) {}

  get(url: string): ReplaySubject<string> {
    const obs = new ReplaySubject<string>(1);
    this._http.get(url, {
      responseType: 'blob'
    }).subscribe({
      next: blob => {
        const objectUrl = window.URL.createObjectURL(blob);
        obs.next(objectUrl);
        obs.complete();
      },
      error: e => obs.error(e)
    });
    return obs;
  }
}
