import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { AtmosQuickActionsService } from './atmos-quick-actions.service';

/** Rows shorter than this fit a narrow window without wrapping, so they are never collapsed. */
const COLLAPSE_THRESHOLD = 4;

let nextId = 0;

/**
 * Wrapper for a `.atmos-page__quick-actions` row that collapses behind a single
 * pill on narrow windows, where the full row wraps to several lines and pushes
 * the page content off-screen.
 *
 * Projected content is the row itself — any number of `.atmos-btn` children.
 * Open state is shared app-wide by `AtmosQuickActionsService`.
 */
@Component({
  selector: 'atmos-quick-actions',
  templateUrl: './atmos-quick-actions.component.html',
  styleUrl: './atmos-quick-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class AtmosQuickActionsComponent {
  private readonly _service = inject(AtmosQuickActionsService);
  private readonly _host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _injector = inject(Injector);

  /** Set false to keep a row always expanded, whatever its length. */
  readonly collapsible = input<boolean>(true);

  readonly expanded = this._service.expanded;

  private readonly _count = signal(0);

  /** A short row is left alone; only long ones get a disclosure. */
  readonly showToggle = computed(() => this.collapsible() && this._count() >= COLLAPSE_THRESHOLD);

  readonly panelId = `atmos-quick-actions-${nextId++}`;

  constructor() {
    // The row is projected content whose length varies per route, so it is
    // counted from the DOM after render rather than derived from inputs.
    afterNextRender(() => this.readCount());

    inject(Router).events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      afterNextRender(() => this.readCount(), { injector: this._injector });
    });
  }

  toggle(): void {
    this._service.toggle();
  }

  private readCount(): void {
    // Descendant, not child: some actions are rendered by a wrapper component
    // whose host is `display: contents`, so the button is a grandchild.
    const actions = this._host.nativeElement.querySelectorAll('.atmos-page__quick-actions .atmos-btn');
    this._count.set(actions.length);
  }
}
