import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, GuardResult, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { IconService } from '@app/services/icon.service';

let hasIcons = false; // Data is static so we only need to load it once.

export const canActivateIcons: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  if (hasIcons) { return true; }

  const router = inject(Router);
  const iconService = inject(IconService);
  return new Observable<GuardResult>(observer => {
    iconService.loadData().subscribe({
      next: data => {
        hasIcons = true;
        observer.next(true);
        observer.complete();
      },
      error: err => {
        console.error('Loading icons failed.', err);
        observer.next(router.createUrlTree(['/no-data']));
        observer.complete();
      }
    });
  });
};

export const canActivateIconsChild: CanActivateFn = canActivateIcons;
