import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, GuardResult, CanActivateChildFn, Router, CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageProviderFactory } from '../services/storage/storage-provider-factory';

export const canActivateStorage: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const storageProviderFactory = inject(StorageProviderFactory);

  return new Observable<GuardResult>(observer => {
    const storageProvider = storageProviderFactory.get();
    storageProvider.load().subscribe({
      next: () => {
        observer.next(true);
        observer.complete();
      },
      error: err => {
        console.error('Loading storage failed.', err);
        const storageUrl = router.parseUrl('/storage');
        storageUrl.queryParams = { error: err.message ?? 'Unknown error.' };

        observer.next(storageUrl);
        observer.complete();
      }
    });
  });
};

export const canActivateStorageChild: CanActivateChildFn = canActivateStorage;
