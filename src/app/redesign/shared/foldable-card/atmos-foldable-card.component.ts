import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, input, model, output, signal, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/** Duration of the fold height transition; must match `$fold-duration` in the SCSS. */
const FOLD_DURATION = 300;

/**
 * Atmospheric card with an optional collapsible body.
 *
 * Projects a `[header]` slot next to the fold chevron and the default slot into
 * the card body. `folded` is a two-way model so the parent can drive or observe
 * the fold state; `lazy` defers rendering the body until it is first unfolded.
 */
@Component({
  selector: 'app-atmos-foldable-card',
  templateUrl: './atmos-foldable-card.component.html',
  styleUrl: './atmos-foldable-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class AtmosFoldableCardComponent implements OnDestroy {
  readonly title = input<string | undefined>(undefined);
  readonly foldable = input<boolean>(true);
  readonly folded = model<boolean>(false);
  /** Defers rendering the projected body until the card is first unfolded. */
  readonly lazy = input<boolean>(false);

  /** Fires once the fold transition has finished, with the resulting fold state. */
  readonly afterFold = output<boolean>();

  private readonly _body = viewChild.required<ElementRef<HTMLDivElement>>('body');

  private readonly _loaded = signal(false);
  readonly renderBody = computed<boolean>(() => !this.lazy() || this._loaded() || !this.folded());

  private _timeout?: number;

  ngOnDestroy(): void {
    clearTimeout(this._timeout);
  }

  /** Unfolds a folded card; used to make the collapsed body itself clickable. */
  unfold(): void {
    if (!this.foldable() || !this.folded()) { return; }
    this.toggleFold();
  }

  toggleFold(): void {
    if (!this.foldable()) { return; }

    const fold = !this.folded();
    const body = this._body().nativeElement;

    // Pin the current height so the transition has a start value to leave from.
    body.style.height = fold ? `${body.scrollHeight}px` : '0px';
    this._loaded.set(true);
    this.folded.set(fold);

    setTimeout(() => {
      body.style.height = fold ? '0px' : `${body.scrollHeight}px`;
    });

    clearTimeout(this._timeout);
    this._timeout = window.setTimeout(() => {
      // Release the fixed height so the body can grow with its content again.
      if (!fold) { body.style.height = ''; }
      this.afterFold.emit(fold);
    }, FOLD_DURATION);
  }
}
