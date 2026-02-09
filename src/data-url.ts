import { environment } from './environments/environment';

/**
 * Modifies the environment to load PR preview data from R2.
 * Only functions when executed within the sandbox or locally.
 */
export function loadDataUrl(): void {
  const isSandbox = location.host === 'sandbox.sky-planner.com';
  if (!isSandbox) { return; }

  const url = new URL(window.location.href);
  let dataUrl = url.searchParams.get('dataUrl') || '';
  if (!dataUrl) { return; }

  if (/\d+/g.test(dataUrl)) {
    dataUrl = `https://bucket.sky-planner.com/assets/${dataUrl}-everything.json`;
    environment.urls.everything = dataUrl;
  }
}
