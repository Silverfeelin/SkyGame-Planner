import { nanoid } from '../nanoid';

interface Env {
	REQUESTS: KVNamespace;
}

const invalidRequest = () => new Response('Invalid request.', { status: 400 });

/** Fetch a request and return the stored data. */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  // Get request key.
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key');
  if (!key) { return invalidRequest(); }

  // Get request data.
  const request = await context.env.REQUESTS.get(key, 'text');

  // Return request data.
  return new Response(request);
}

/** Request body for storing an outfit request under a short key. */
interface OutfitRequest {
  /** "Available": Items marked as available. */
  a: string;
  /** "Red": Items marked with red. */
  r: string;
  /** "Yellow": Items marked with yellow. */
  y: string;
  /** "Green": Items marked with green. */
  g: string;
  /** "Blue": Items marked with blue. */
  b: string;
}

/** Save a request and return a random storage key.  */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Get request body.
  const json = await context.request.json() as OutfitRequest;
  const jsonKeys = Object.keys(json);
  const validKeys = new Set(['a', 'r', 'y', 'g', 'b']);

  // Quick data sanitization.
  if (jsonKeys.some(k => !validKeys.has(k) || typeof(json[k]) !== 'string' || json[k]?.length > 10000)) {
    return invalidRequest();
  }

  // Store request
  const key = nanoid();
  await context.env.REQUESTS.put(key, JSON.stringify(json), { expirationTtl: 86400 });
  const response = { key };

  // Return key to site.
  return new Response(JSON.stringify(response));

}
