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
  key?: string;
}

const invalidRequest = (msg: string) => new Response(`Invalid request: ${msg}`, { status: 400 });
/* Hashing function from https://stackoverflow.com/a/52171480 by bryc */
const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

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
  Object.keys(requiredParams).forEach(key => addWhere(requiredParams[key], key));
  if (sqlValues.length === 0) {
    return invalidRequest('Missing a required parameter.');
  }

  // Check optional parameters.
  const optionalParams = { shoesId: 's', faceAccessoryId: 'f', necklaceId: 'n', hatId: 't', propId: 'p' };
  Object.keys(optionalParams).forEach(key => addWhere(optionalParams[key], key));

  // Check page.
  const pageSize = 100;
  const page = +url.searchParams.get('page') || 1;
  if (page < 1) { return invalidRequest('Invalid page.'); }
  const offset = (page - 1) * pageSize;

  // Get pageSize records matching the item selection.
  const sql = `
    SELECT id, link, outfitId, maskId, hairId, capeId, shoesId, faceAccessoryId, necklaceId, hatId, propId
    FROM outfits
    WHERE 1=1 ${sqlWhere}
    ORDER BY id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;
  const resOutfits = await context.env.DB.prepare(sql).bind(...sqlValues).run<IOutfit>();

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

  // Validate secret key.
  let key: string;
  if (json.key) {
    if (json.key.length > 100) { return invalidRequest('Invalid key.'); }
    key = cyrb53(json.key).toString();
    delete json.key;
  }

  const requiredKeys = new Set(['outfitId', 'maskId', 'hairId', 'capeId']);
  const optionalKeys = new Set(['shoesId', 'faceAccessoryId', 'necklaceId', 'hatId', 'propId']);

  // Check required keys.
  for (const key of requiredKeys.values()) {
    if (!json[key]) { return invalidRequest('Missing key.'); }
  }

  // Validate key values.
  for (const key of Object.keys(json)) {
    if (key === 'link' || key === 'key') { continue; }
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

  const ipAddress = context.request.headers.get('CF-Connecting-IP') ?? '127.0.0.1';
  let id: number;
  try {
    const result = await context.env.DB.prepare(`
      INSERT INTO outfits (date, ip, key, ${dbKeys.join(',')})
      VALUES (?, ?, ?, ${dbKeys.map(() => '?').join(',')})
    `).bind(new Date().toISOString(), ipAddress, key, ...dbValues).run<number>();
    id = result.meta.last_row_id;
  } catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return invalidRequest('Outfit already saved.');
    }

    console.error(e.message);
    return invalidRequest('Failed to save outfit.');
  }

  const responseModel = { id };
  return new Response(JSON.stringify(responseModel));
}

