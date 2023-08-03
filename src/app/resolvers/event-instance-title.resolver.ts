import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { DataService } from '../services/data.service';
import { Observable, first, switchMap } from 'rxjs';
import { IEventInstance } from '../interfaces/event.interface';

@Injectable({
  providedIn: 'root'
})
export class EventInstanceTitleResolver implements Resolve<string> {
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
          const item = this._dataService.guidMap.get(guid) as IEventInstance;
          const name = (typeof item?.event?.name === 'string') ? `${item.event.name} - ${this._default}` : this._default;
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

