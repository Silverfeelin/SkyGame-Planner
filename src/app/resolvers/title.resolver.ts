import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { DataService } from '../services/data.service';
import { Observable, first, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleResolver implements Resolve<string> {
  private _default = 'Sky Planner';
  constructor(
    private readonly _dataService: DataService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> | string {
    const guid = route.paramMap.get('guid');
    if (!guid) { return ''; }
    return new Observable<string>(observer => {
      this._dataService.onData.pipe(first()).subscribe({
        next: () => {
          const item = this._dataService.guidMap.get(guid) as any;
          const name = (typeof item?.name === 'string') ? `${item.name} - ${this._default}` : this._default;
          observer.next(name);
          observer.complete();
        },
        error: () => {
          observer.next(this._default);
          observer.complete();
        }
      });
    });
  }
}

