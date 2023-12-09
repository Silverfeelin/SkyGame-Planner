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
  let sqlWhere = '';
  let sqlValues = [];

  // Add a where clause to the SQL query if the query parameter is present.
  const url = new URL(context.request.url);
  const addWhere = (q: string, c: string): boolean => {
    const value = +url.searchParams.get(q) || undefined;
    if (!value) { return false; }
    sqlWhere += `AND ${c} = ?`;
    sqlValues.push(value);
    return true;
  };

  // Check at least one required parameter is present.
  const requiredParams = { outfitId: 'o', maskId: 'm', hairId: 'h', capeId: 'c' };
  if (!Object.keys(requiredParams).some(key => addWhere(requiredParams[key], key))) {
    return invalidRequest('Missing a required parameter.');
  }

  // Check optional parameters.
  const optionalParams = { shoesId: 's', faceAccessoryId: 'f', necklaceId: 'n', hatId: 't', propId: 'p' };
  Object.keys(optionalParams).forEach(key => addWhere(optionalParams[key], key));

  // Get 100 records matching the item selection.
  const resOutfits = await context.env.DB.prepare(`
    SELECT TOP 100 * FROM outfits
    WHERE 1=1 ${sqlWhere}
  `).bind(...sqlValues).run<IOutfit>();

  // Return request data.
  const response = {
    items: resOutfits.results
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

  const requiredKeys = new Set(['outfitId', 'maskId', 'hairId', 'capeId']);
  const optionalKeys = new Set(['shoesId', 'faceAccessoryId', 'necklaceId', 'hatId', 'propId']);

  // Check required keys.
  for (const key of requiredKeys.values()) {
    if (!json[key]) { return invalidRequest('Missing key.'); }
  }

  // Validate key values.
  for (const key of Object.keys(json)) {
    if (key === 'link') { continue; }
    if (!requiredKeys.has(key) && !optionalKeys.has(key)) { return invalidRequest('Invalid key.'); }
    if (json[key] && (typeof json[key] !== 'number' || json[key] > 99999)) { return invalidRequest('Invalid key value.'); }
    json[key] ||= null;
  }

  // Save outfit.
  let dbKeys = [];
  let dbValues = [];
  for (const key of Object.keys(json)) {
    dbKeys.push(key);
    dbValues.push(json[key]);
  }

  const ipAddress = context.request.headers.get('CF-Connecting-IP');
  try {
    await context.env.DB.prepare(`
      INSERT INTO outfits (ip, ${dbKeys.join(',')})
      VALUES (?, ${dbKeys.map(() => '?').join(',')})
    `).bind(ipAddress,...dbValues).run();
  } catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return invalidRequest('Outfit already saved.');
    }

    console.error(e.message);
    return invalidRequest('Failed to save outfit.');
  }

  return new Response('OK');
}

