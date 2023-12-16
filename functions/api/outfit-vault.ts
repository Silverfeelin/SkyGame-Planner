interface Env {
  DB: D1Database;
}

interface IOutfit {
  id: number;
  link: string;
  // Outfit
  outfitId: number;
  maskId: number;
  hairId: number;
  capeId: number;
  shoesId?: number;
  faceAccessoryId?: number;
  necklaceId?: number;
  hatId?: number;
  propId?: number;
  // Metadata
  sizeId?: number;
  lightingId?: number;
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
  const addSqlWhere = (key: string): boolean => {
    const value = +url.searchParams.get(key) || undefined;
    if (!value) { return false; }
    sqlWhere += `AND ${key} = ?`;
    sqlValues.push(value);
    return true;
  };

  // Check at least one outfit parameter is present.
  const itemParams = [ 'outfitId', 'maskId', 'hairId', 'capeId', 'shoesId', 'faceAccessoryId', 'necklaceId', 'hatId', 'propId' ];
  itemParams.forEach(key => addSqlWhere(key));
  if (sqlValues.length === 0) {
    return invalidRequest('Missing an item selection.');
  }

  // Add size and lighting.
  addSqlWhere('sizeId');
  addSqlWhere('lightingId');

  // Check page.
  const pageSize = 100;
  const page = +url.searchParams.get('page') || 1;
  if (page < 1) { return invalidRequest('Invalid page.'); }
  const offset = (page - 1) * pageSize;

  // Get pageSize records matching the item selection.
  const sql = `
    SELECT id, date, link, sizeId, lightingId, outfitId, maskId, hairId, capeId, shoesId, faceAccessoryId, necklaceId, hatId, propId
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
  if (typeof(json.key) === 'string') {
    if (json.key.length > 100) { return invalidRequest('Invalid key.'); }
    key = json.key.length ? cyrb53(json.key).toString() : undefined;
    delete json.key;
  }

  const requiredKeys = new Set(['outfitId', 'maskId', 'hairId', 'capeId']);
  const optionalKeys = new Set(['shoesId', 'faceAccessoryId', 'necklaceId', 'hatId', 'propId']);
  const extraKeys = new Set(['link', 'sizeId', 'lightingId']);

  // Check required keys. Outfits always have these item types.
  for (const key of requiredKeys.values()) {
    if (!json[key]) { return invalidRequest('Missing item.'); }
  }

  // Validate items.
  for (const key of Object.keys(json)) {
    if (extraKeys.has(key)) { continue; }
    if (!requiredKeys.has(key) && !optionalKeys.has(key)) { return invalidRequest('Invalid key.'); }
    if (json[key] && (typeof json[key] !== 'number' || json[key] > 99999)) { return invalidRequest('Invalid key value.'); }
    json[key] ||= 0;
  }

  // Validate metadata.
  if (json.sizeId && (typeof json.sizeId !== 'number' || json.sizeId < 0 || json.sizeId > 99999)) {
    return invalidRequest('Invalid size.');
  }
  if (json.lightingId && (typeof json.lightingId !== 'number' || json.lightingId < 0 || json.lightingId > 99999)) {
    return invalidRequest('Invalid lighting.');
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

