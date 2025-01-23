interface Env {
  DB: D1Database;
  DYE_TRUSTED_CSV: string;
}

interface IRequestBody {
  type?: 'marker' | 'plant';

  // Marker
  lat?: number;
  lng?: number;

  // Plant
  epoch: number;
  markerId?: number;
  size?: number;
  roots?: number;
  red?: number;
  yellow?: number;
  green?: number;
  cyan?: number;
  blue?: number;
  purple?: number;
  black?: number;
  white?: number;
}

interface IDbMarker {
  id: number;
  userId: string;
  username: string;
  lat: number;
  lng: number;
  createdOn: string;
  deleted: boolean;
  deletedOn?: string;
  deletedBy?: number;
}

interface IDbPlant {
  id: number;
  userId: string;
  username: string;
  epoch: number;
  markerId: number;
  size?: number;
  roots?: number;
  red?: number;
  yellow?: number;
  green?: number;
  cyan?: number;
  blue?: number;
  purple?: number;
  black?: number;
  white?: number;
  createdOn: string;
  deleted: boolean;
  deletedOn?: string;
  deletedBy?: string;
}

const invalidRequest = () => new Response('Invalid request.', { status: 400 });
const DISCORD_USER_URL = 'https://discord.com/api/users/@me';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const [userId, _] = await getUserIdAsync(context);
  if (!userId) { return invalidRequest(); }

  const url = new URL(context.request.url);
  const markerId = +url.searchParams.get('markerId') || 0;

  const items = markerId
    ? await dbGetPlantsByMarkerAsync(context, markerId)
    : await dbGetMarkersAsync(context);

  const responseObj = { items };
  return new Response(JSON.stringify(responseObj), { status: 200 });
};

/** Fetch a request and return the stored data. */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const [userId, username] = await getUserIdAsync(context);
  if (!userId) { return invalidRequest(); }

  const body = await context.request.json() as IRequestBody;
  let id: number;
  switch (body.type) {
    case 'marker': id = await onRequestPostMarker(context, userId, username, body); break;
    case 'plant': id = await onRequestPostPlant(context, userId, username, body); break;
    default: return invalidRequest();
  }

  return new Response(JSON.stringify({
    id, userId, username
  }), { status: 200 });
}

async function onRequestPostMarker(context: EventContext<Env, any, Record<string, unknown>>, userId: string, username: string, body: IRequestBody): Promise<number> {
  const marker: Partial<IDbMarker> = {
    userId, username,
    lat: body.lat,
    lng: body.lng
  };

  return await dbAddMarkerAsync(context, marker);
}

async function onRequestPostPlant(context: EventContext<Env, any, Record<string, unknown>>, userId: string, username: string, body: IRequestBody): Promise<number> {
  const plant: Partial<IDbPlant> = {
    userId, username,
    markerId: body.markerId,
    epoch: body.epoch,
    size: body.size,
    roots: body.roots,
    red: body.red,
    yellow: body.yellow,
    green: body.green,
    cyan: body.cyan,
    blue: body.blue,
    purple: body.purple,
    black: body.black,
    white: body.white
  };

  return await dbAddPlantAsync(context, plant);
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const [userId, _] = await getUserIdAsync(context);
  if (!userId) { return invalidRequest(); }

  const url = new URL(context.request.url);
  const markerId = +url.searchParams.get('markerId') || 0;
  const plantId = +url.searchParams.get('plantId') || 0;

  const success = markerId
    ? await dbDeleteMarkerAsync(context, userId, markerId)
    : plantId ? await dbDeletePlantAsync(context, userId, plantId)
    : false;

  return success
    ? new Response('Deleted.', { status: 200 })
    : new Response('Failed to delete.', { status: 400 });
}

/**
 * Fetches the user ID using the provided Discord Authorization header.
 * This call happens server-side to prevent client-side control over which user ID is used.
 */
async function getUserIdAsync(context: EventContext<Env, any, Record<string, unknown>>): Promise<[string, string]> {
  const accessToken = context.request.headers.get('Authorization');
  if (!accessToken) { return [undefined, undefined]; }

  const userResponse = await fetch(DISCORD_USER_URL, {
    headers: { Authorization: `${accessToken}` },
  });

  const userData = await userResponse.json() as any;
  const id = (userData?.id) || '';
  const username = (userData?.username) || '';
  return id && username ? [id, username] : [undefined, undefined];
}

/** Checks if the user ID is trusted and allowed to alter records by other users. */
const trustedUserIds = [ '232201687086006274' ];
function isTrustedUserId(userId: string): boolean {
  return trustedUserIds.includes(userId);
}

/** Gets all markers from the database. */
async function dbGetMarkersAsync(context: EventContext<Env, any, Record<string, unknown>>): Promise<IDbMarker[]> {
  const sql = `SELECT * FROM dyePlantMarkers WHERE deleted = 0;`;
  const data = await context.env.DB.prepare(sql).all<IDbMarker>();
  return data.results;
}

/** Gets all plant data for a specific marker from the database. */
async function dbGetPlantsByMarkerAsync(context: EventContext<Env, any, Record<string, unknown>>, markerId: number): Promise<IDbPlant[]> {
  const sql = `SELECT * FROM dyePlants WHERE markerId = ? AND deleted = 0;`;
  const data = await context.env.DB.prepare(sql).bind(markerId).all<IDbPlant>();
  return data.results;
}

/** Adds a marker to the database.  */
async function dbAddMarkerAsync(context: EventContext<Env, any, Record<string, unknown>>, data: Partial<IDbMarker>): Promise<number> {
  const query = `
    INSERT INTO dyePlantMarkers (userId, username, lat, lng, createdOn)
    VALUES (?, ?, ?, ?, datetime('now'));
  `;

  const result = await context.env.DB.prepare(query)
    .bind(data.userId, data.username, data.lat, data.lng)
    .run();
  return result.meta.last_row_id;
}

/** Adds a dye plant to the database. */
async function dbAddPlantAsync(context: EventContext<Env, any, Record<string, unknown>>, data: Partial<IDbPlant>): Promise<number> {
  const query = `
    INSERT INTO dyePlants (userId, username, epoch, markerId, size, roots, red, yellow, green, cyan, blue, purple, black, white, createdOn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
  `;

  console.log(data);
  const result = await context.env.DB.prepare(query)
    .bind(data.userId, data.username, data.epoch, data.markerId,
      data.size ?? null, data.roots ?? null,
      data.red ?? null, data.yellow ?? null, data.green ?? null, data.cyan ?? null,
      data.blue ?? null, data.purple ?? null, data.black ?? null, data.white ?? null
    )
    .run();
  return result.meta.last_row_id;
}

/** Soft-deletes a marker from the database. */
async function dbDeleteMarkerAsync(context: EventContext<Env, any, Record<string, unknown>>, userId: string, markerId: number): Promise<boolean> {
  if (isTrustedUserId(userId)) {
    const query = `UPDATE dyePlantMarkers SET deleted = 1, deletedBy = ?, deletedOn = datetime('now') WHERE id = ?;`
    const res = await context.env.DB.prepare(query).bind(userId, markerId).run();
    return res.meta.rows_written > 0;
  }

  const query = `UPDATE dyePlantMarkers SET deleted = 1, deletedBy = ?, deletedOn = datetime('now') WHERE userId = ? AND id = ?;`;
  const res = await context.env.DB.prepare(query).bind(userId, userId, markerId).run();
  return res.meta.rows_written > 0;
}

/** Soft-deletes a dye plant from the database. */
async function dbDeletePlantAsync(context: EventContext<Env, any, Record<string, unknown>>, userId: string, plantId: number): Promise<boolean> {
  if (isTrustedUserId(userId)) {
    const query = `UPDATE dyePlants SET deleted = 1, deletedBy = ?, deletedOn = datetime('now') WHERE id = ?;`
    const res = await context.env.DB.prepare(query).bind(userId, plantId).run();
    return res.meta.rows_written > 0;
  }

  const query = `UPDATE dyePlants SET deleted = 1, deletedBy = ?, deletedOn = datetime('now') WHERE userId = ? AND id = ?;`;
  const res = await context.env.DB.prepare(query).bind(userId, userId, plantId).run();
  return res.meta.rows_written > 0;
}
