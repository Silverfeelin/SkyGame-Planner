import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

export interface ISetFilterOption { value: string; label: string; }

export interface ISetFilterParams extends IFilterParams {
  /** Fixed options to show; plain strings or `{ value, label }` pairs. */
  values: Array<string | ISetFilterOption>;
  /** Adds a "(Blanks)" entry matching empty/null cell values. Default false. */
  includeBlanks?: boolean;
  /** Label for the blanks entry. Default '(Blanks)'. */
  blanksLabel?: string;
}

/** Serializable filter model; `null` means inactive (no values checked). */
export interface ISetFilterModel { values: Array<string>; }

/** Internal sentinel for the "(Blanks)" option; never a real cell value. */
const BLANK = '__blank__';

/**
 * Set-style column filter (checkbox list of fixed options) for AG Grid Community,
 * replacing text search on columns with a small enumerable value set.
 * Configure via `filterParams` ({@link ISetFilterParams}).
 */
@Component({
  selector: 'app-ag-set-filter',
  standalone: true,
  templateUrl: './ag-set-filter.component.html',
  styleUrl: './ag-set-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgSetFilterComponent implements IFilterAngularComp {
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private _params!: ISetFilterParams;

  readonly options = signal<Array<ISetFilterOption>>([]);
  readonly selected = signal<ReadonlySet<string>>(new Set());

  agInit(params: ISetFilterParams): void {
    this._params = params;
    const options = (params.values ?? []).map(v => typeof v === 'string' ? { value: v, label: v } : v);
    if (params.includeBlanks) {
      options.push({ value: BLANK, label: params.blanksLabel ?? '(Blanks)' });
    }
    this.options.set(options);
  }

  refresh(params: ISetFilterParams): boolean {
    this._params = params;
    return true;
  }

  isFilterActive(): boolean {
    return this.selected().size > 0;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    const selected = this.selected();
    if (!selected.size) { return true; }
    const value = this._params.getValue(params.node);
    const text = value == null ? '' : `${value}`;
    return text === '' ? selected.has(BLANK) : selected.has(text);
  }

  getModel(): ISetFilterModel | null {
    const selected = this.selected();
    return selected.size ? { values: [...selected] } : null;
  }

  setModel(model: ISetFilterModel | null): void {
    const valid = new Set(this.options().map(o => o.value));
    this.selected.set(new Set((model?.values ?? []).filter(v => valid.has(v))));
    this._changeDetectorRef.markForCheck();
  }

  getModelAsString(model: ISetFilterModel | null): string {
    if (!model?.values?.length) { return ''; }
    const labels = new Map(this.options().map(o => [o.value, o.label]));
    return model.values.map(v => labels.get(v) ?? v).join(', ');
  }

  toggle(value: string): void {
    const next = new Set(this.selected());
    next.has(value) ? next.delete(value) : next.add(value);
    this.selected.set(next);
    this._params.filterChangedCallback();
  }

  selectAll(): void {
    this.selected.set(new Set(this.options().map(o => o.value)));
    this._params.filterChangedCallback();
  }

  clear(): void {
    this.selected.set(new Set());
    this._params.filterChangedCallback();
  }
}
