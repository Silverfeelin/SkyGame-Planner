import { environment } from 'src/environments/environment';

/**
 * Maps Planner-hosted asset URLs (https://sky-planner.com/assets/...) to the local dev server, in the environments that
 * configure `assetRewrite`. This shows assets that aren't deployed yet. Exports map them back.
 */
export class AssetUrlHelper {
  /** Returns the URL as served by this environment. */
  static toLocal(url: string): string;
  static toLocal(url: string | undefined): string | undefined;
  static toLocal(url: string | undefined): string | undefined {
    const rewrite = environment.assetRewrite;
    return rewrite && url?.startsWith(rewrite.from) ? rewrite.to + url.substring(rewrite.from.length) : url;
  }

  /** Returns the URL as stored in the data, undoing {@link toLocal}. */
  static toPublic(url: string): string;
  static toPublic(url: string | undefined): string | undefined;
  static toPublic(url: string | undefined): string | undefined {
    const rewrite = environment.assetRewrite;
    return rewrite && url?.startsWith(rewrite.to) ? rewrite.from + url.substring(rewrite.to.length) : url;
  }
}
