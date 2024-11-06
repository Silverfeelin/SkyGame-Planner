import { filter, Observable } from 'rxjs';

/** Subscribes to the event as long as it's not cancelled. */
export function cancellableEvent() {
  return <T extends Event>(source: Observable<T>) =>
    source.pipe(filter(e => !e.defaultPrevented));
}

export function noInputs() {
  return <T extends Event>(source: Observable<T>) =>
    source.pipe(filter(e => {
      return !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement);
    }));
}
