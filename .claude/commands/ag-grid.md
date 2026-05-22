# Convert page to AG-Grid

Convert the component specified by the user (or the currently open file) to use AG-Grid, following the patterns established in the existing grid components.

## Step 1 — Read the target component

Read the full `.ts` and `.html` files for the target component. Understand:
- What data is displayed (source, shape, fields)
- What the current table/list columns are
- Whether images, links, or dates are rendered
- Any existing sorting or filtering behaviour

## Step 2 — Choose the default sort

Infer the most natural default sort from context:

| Data present | Default sort |
|---|---|
| A date column (event date, start date, release date, etc.) | That date column, `desc` |
| A named sequential ordering (realms → areas → spirits, seasons in order, etc.) | Preserve that ordering via `initialSort: 'asc'` on a `nr` row-number column |
| Alphabetical list with no other meaningful order | Name column, `asc` |

Add a `#` number column **only** when no natural sort can be inferred. When preserving data-source ordering, assign row numbers (`i + 1`) from the already-ordered source array and set `initialSort: 'asc'` on that column — this is equivalent to "default order" without a dedicated sort concept.

## Step 3 — Build column definitions

Follow these rules for every column:

### Sizing
- Use `flex: 1, minWidth: Npx` for text columns that should grow.
- Use `width: Npx` (fixed) for images, dates, numbers, and short-label columns.
- Auto-size image columns in `onGridReady` and on breakpoint change via `api.autoSizeColumns(['img'])`.

### Text / link columns
```typescript
{
  field: 'name',
  headerName: 'Name',
  filter: 'agTextColumnFilter',
  flex: 1, minWidth: 200,
  cellRenderer: AgRouteRendererComponent,           // when a link is needed
  valueFormatter: (p: ValueFormatterParams) => p.value?.label ?? '',
  comparator: (a: any, b: any) => (a?.label ?? '').localeCompare(b?.label ?? ''),
  filterValueGetter: (p: ValueGetterParams) => p.data.name?.label ?? ''
}
```
Store link data as `{ label: string, route: any[], queryParams?: any }` in the row object.

### Date columns (Luxon `DateTime`)
```typescript
{
  field: 'date',
  headerName: 'Date',
  width: 140,
  cellRenderer: AgDateRendererComponent,
  filter: 'agDateColumnFilter',
  filterValueGetter: (p: ValueGetterParams) =>
    p.data.date ? (p.data.date as DateTime).toLocal().startOf('day').toJSDate() : null,
  valueFormatter: (p: ValueFormatterParams) => p.value ?? '',
  comparator: (a: DateTime | undefined, b: DateTime | undefined) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return a.diff(b).as('milliseconds');
  }
}
```

### Image columns
```typescript
{
  field: 'img',
  headerName: 'Image',
  width: 100,
  sortable: false,
  filter: false,
  cellRenderer: AgImageRendererComponent
}
```
Store the image URL string directly in `rowData[n].img`. Set row height to 64 (narrow) / 128 (wide) via `getRowHeight`.

### Number columns
```typescript
{ field: 'nr', headerName: '#', width: 90, filter: 'agNumberColumnFilter', initialSort: 'asc', sortingOrder: ['asc', 'desc'] }
```

### Unlocked/progress columns
```typescript
{
  field: 'unlocked',
  headerName: 'Unlocked',
  width: 150,
  filter: 'agNumberColumnFilter',
  cellRenderer: (p: any) => {
    if (!p.data.total) return '';
    const cls = p.data.completed ? 'completed' : p.data.partial ? 'partial' : '';
    return `<span class="${cls}">${p.value} / ${p.data.total}</span>`;
  }
}
```

## Step 4 — Implement the component

### TypeScript skeleton

```typescript
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getAgTheme } from '@app/components/grid/ag-grid-theme';
// Import only the renderers you actually use:
import { AgImageRendererComponent } from '@app/components/grid/renderers/ag-image-renderer/ag-image-renderer.component';
import { AgRouteRendererComponent } from '@app/components/grid/renderers/ag-route-renderer/ag-route-renderer.component';
import { AgDateRendererComponent } from '@app/components/grid/renderers/ag-date-renderer/ag-date-renderer.component';

@Component({
  selector: 'app-...',
  templateUrl: '....component.html',
  styleUrls: ['....component.scss'],
  imports: [AgGridAngular, /* other imports */]
})
export class MyComponent {
  theme = getAgTheme();
  rowData: any[] = [];
  api?: GridApi;

  readonly WIDE_WIDTH = 992;

  colDefs: ColDef[] = [
    // columns here
  ];

  constructor(
    private readonly _dataService: DataService,
    private readonly _breakpointObserver: BreakpointObserver
  ) {
    this._breakpointObserver
      .observe([`(min-width: ${this.WIDE_WIDTH}px)`])
      .pipe(takeUntilDestroyed())
      .subscribe(s => this.updateColumns(s.matches));

    this.rowData = /* build rows from data source */;
  }

  onGridReady(evt: GridReadyEvent<any, any>) {
    this.api = evt.api;
    this.updateColumns(this._breakpointObserver.isMatched(`(min-width: ${this.WIDE_WIDTH}px)`));
  }

  getRowHeight = (): number | undefined => this.wide ? 128 : 64;

  private wide = false;
  private updateColumns(wide: boolean): void {
    this.wide = wide;
    if (!this.api) return;
    this.api.resetRowHeights();
    this.api.autoSizeColumns(['img']); // only when image column is present
  }
}
```

Omit `BreakpointObserver`, `wide`, and `updateColumns` if there is no image column.

### HTML template

Replace the existing table/list markup. Keep the existing `sky-card` header block unchanged; replace only the content below it:

```html
<div class="mt">
  <ag-grid-angular
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [theme]="theme"
    [getRowHeight]="getRowHeight"
    [suppressDragLeaveHidesColumns]="true"
    (gridReady)="onGridReady($event)"
  />
</div>
```

Omit `[getRowHeight]` when there is no image column (fixed height isn't needed).

## Step 5 — Styles

Add completed/partial highlight classes to the HTML only if unlocked/progress columns are present:

Completed: `.c-new fw-bold`, partial: `.c-old fw-bold`.

## Step 6 — Clean up

- Remove the old table/list HTML, `*ngFor` loops, and any imports that are no longer used.
- Remove any component-level `ChangeDetectorRef` or `async` pipe patterns replaced by the grid.
- Do **not** add comments explaining what you changed.
- Do **not** add AG-Grid feature flags or settings not present in the existing grid components.

## Available renderers (use only what's needed)

| Renderer | Import path | Use for |
|---|---|---|
| `AgImageRendererComponent` | `@app/components/grid/renderers/ag-image-renderer/ag-image-renderer.component` | Spirit/item image URLs |
| `AgRouteRendererComponent` | `@app/components/grid/renderers/ag-route-renderer/ag-route-renderer.component` | Clickable router links |
| `AgDateRendererComponent` | `@app/components/grid/renderers/ag-date-renderer/ag-date-renderer.component` | Luxon DateTime values |
| `AgSpiritTypeRendererComponent` | `@app/components/grid/renderers/ag-spirit-type-renderer/ag-spirit-type-renderer.component` | Spirit type icons |
| `AgSpiritsRendererComponent` | `@app/components/grid/renderers/ag-spirits-renderer/ag-spirits-renderer.component` | Multiple spirit images in one cell |

For simple styled values (e.g. a coloured number), use an inline `cellRenderer` string function rather than a new component.
