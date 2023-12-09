interface Env {
  DB: D1Database;
}

interface IOutfit {
  id: number;
  link: string;
  outfitId: number;
  maskId: number;
  hairId: number;
  capeId: number;
  shoesId?: number;
  faceAccessoryId?: number;
  necklaceId?: number;
  hatId?: number;
  propId?: number;
}

const invalidRequest = (msg: string) => new Response(`Invalid request: ${msg}`, { status: 400 });

/** Fetch a request and return the stored data. */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  // Get search values from url.
  const url = new URL(context.request.url);
  const outfitId = +url.searchParams.get('o') || undefined;
  const maskId = +url.searchParams.get('m') || undefined;
  const hairId = +url.searchParams.get('h') || undefined;
  const capeId = +url.searchParams.get('c') || undefined;
  if (!outfitId && !maskId && !hairId && !capeId) { return invalidRequest('Required parameters not present.'); }

  // Get request data.
  let where = '';
  let values = [];
  if (outfitId) {
    where += `AND outfitId = ?`;
    values.push(outfitId);
  }
  if (maskId) {
    where += `AND maskId = ?`;
    values.push(maskId);
  }
  if (hairId) {
    where += `AND hairId = ?`;
    values.push(hairId);
  }
  if (capeId) {
    where += `AND capeId = ?`;
    values.push(capeId);
  }

  const request = await context.env.DB.prepare(`
    SELECT TOP 100 * FROM outfits
    WHERE 1=1 ${where}
  `).bind(...values).run<IOutfit>();

  // Return request data.
  const response = {
    items: request.results
  };
  return new Response(JSON.stringify(response));
}

/** Save a request and return a random storage key.  */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Get request body.
  const json = await context.request.json() as IOutfit;
  delete json.id;

  // Only allow Skycord messages.
  if (!json.link) { return invalidRequest('Missing link.'); }
  const linkRegex = /^https:\/\/discord\.com\/channels\/575762611111592007\/\d{1,32}\/\d{1,32}$/;
  if (!linkRegex.test(json.link)) { return invalidRequest('Invalid link.'); }

  // Validate possible keys as integers.
  const keys = new Set([
    'outfitId', 'maskId', 'hairId', 'capeId',
    'shoesId', 'faceAccessoryId', 'necklaceId', 'hatId', 'propId'
  ]);
  for (const key of Object.keys(json)) {
    if (!keys.has(key) && key !== 'link') { return invalidRequest('Invalid key.'); }
    if (json[key] && (typeof json[key] !== 'number' || json[key] > 99999)) { return invalidRequest('Invalid key value.'); }
    json[key] ||= null;
  }

  // Save outfit.
  await context.env.DB.prepare(`
    INSERT INTO outfits (link, outfitId, maskId, hairId, capeId, shoesId, faceAccessoryId, necklaceId, hatId, propId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(json.link, json.outfitId, json.maskId, json.hairId, json.capeId, json.shoesId, json.faceAccessoryId, json.necklaceId, json.hatId, json.propId).run();

  return new Response('OK');
}

