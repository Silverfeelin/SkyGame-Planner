import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, GuardResult, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';

let hasData = false; // Data is static so we only need to load it once.

export const canActivateData: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  if (hasData) { return true; }

  const router = inject(Router);
  const dataService = inject(DataService);
  return new Observable<GuardResult>(observer => {
    dataService.loadData().subscribe({
      next: data => {
        hasData = true;
        observer.next(true);
        observer.complete();
      },
      error: err => {
        console.error('Loading data failed.', err);
        observer.next(router.createUrlTree(['/no-data']));
        observer.complete();
      }
    });
  });
};

export const canActivateDataChild: CanActivateFn = canActivateData;
