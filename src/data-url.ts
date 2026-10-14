import { environment } from './environments/environment';

/** Sandbox and Cloudflare Pages preview branch deployments (preview-NAME.sky-planner.pages.dev). */
export function isSandboxHost(host = location.host): boolean {
  return host === 'sandbox.sky-planner.com' || /^preview-[a-z0-9-]+\.sky-planner\.pages\.dev$/.test(host);
}

/**
 * Modifies the environment to load PR preview data from R2.
 * Only functions when executed within the sandbox, a preview branch or locally.
 */
export function loadDataUrl(): void {
  const isAllowed = isSandboxHost() || location.host === 'localhost:4200';
  if (!isAllowed) { return; }

  const url = new URL(window.location.href);
  let dataUrl = url.searchParams.get('dataUrl') || '';
  if (!dataUrl) { return; }

  if (/\d+/g.test(dataUrl)) {
    dataUrl = `https://bucket.sky-planner.com/assets/${dataUrl}-everything.json`;
    environment.urls.everything = dataUrl;
  }
}
