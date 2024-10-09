import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CanonicalService {
  constructor(private meta: Meta, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setCanonical();
    });
  }

  setCanonical() {
    const path = this.router.url.split('?')[0];
    const canonical = `https://sky-planner.com${path}`;
    this.meta.updateTag({ rel: 'canonical', href: canonical });
  }
}
