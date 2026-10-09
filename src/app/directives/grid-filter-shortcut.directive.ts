import { Directive, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import { EventService } from '@app/services/event.service';
import { cancellableEvent, noInputs } from '@app/rxjs/operators';

/**
 * Ctrl/Cmd+F opens the filter of a grid's name column instead of the browser's find, which can't see rows outside the
 * scroll box. A second press lands in the filter's input, which this skips, so the browser's find still opens.
 */
@Directive({
  selector: 'ag-grid-angular[gridFilterShortcut]'
})
export class GridFilterShortcutDirective {
  /** Column id of the column whose filter opens. */
  readonly gridFilterShortcut = input.required<string>();

  private readonly _grid = inject(AgGridAngular);
  private readonly _eventService = inject(EventService);

  constructor() {
    this._eventService.keydown.pipe(takeUntilDestroyed(), cancellableEvent(), noInputs()).subscribe(evt => {
      if (this._eventService.keyboardShortcutDisabledCount > 0) { return; }
      if (!(evt.ctrlKey || evt.metaKey) || evt.shiftKey || evt.altKey || evt.key.toLowerCase() !== 'f') { return; }
      const api = this._grid.api;
      if (!api || api.isDestroyed()) { return; }

      evt.preventDefault();
      const column = this.gridFilterShortcut();
      api.ensureColumnVisible(column);
      api.showColumnFilter(column);
    });
  }
}
