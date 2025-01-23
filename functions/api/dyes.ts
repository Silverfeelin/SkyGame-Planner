interface Env {
  DB: D1Database;
}

interface IRequestBody {
  type?: 'marker' | 'plant';
  epoch: number;
  markerId?: string;
  lat?: number;
  lng?: number;
}

const invalidRequest = () => new Response('Invalid request.', { status: 400 });
const DISCORD_USER_URL = 'https://discord.com/api/users/@me';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = await getUserId(context);
  if (!userId) { return invalidRequest(); }

  const url = new URL(context.request.url);
  const markerId = +url.searchParams.get('markerId') || 0;

  if (markerId) {
    return await getPlants(context, userId, markerId);
  } else {
    return await getMarkers(context, userId);
  }
};

async function getMarkers(context: EventContext<Env, any, Record<string, unknown>>, userId: number): Promise<Response> {
  const markerQuery = `
    SELECT * FROM dyePlantMarkers;
  `;
  const markers = await context.env.DB.prepare(markerQuery).all();

  return new Response(JSON.stringify({
    markers: { items: markers.results || [] }
  }), { status: 200 });
}

async function getPlants(context: EventContext<Env, any, Record<string, unknown>>, userId: number, markerId: number): Promise<Response> {
  const plantQuery = `
    SELECT * FROM dyePlants WHERE markerId = ?;
  `;
  const plants = await context.env.DB.prepare(plantQuery)
  .bind(markerId)
  .all();

  return new Response(JSON.stringify({
    plants: { items: plants.results || [] }
  }), { status: 200 });
}

/** Fetch a request and return the stored data. */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const userId = await getUserId(context);
  if (!userId) { return invalidRequest(); }

  const body = await context.request.json() as IRequestBody;
  let id: number;
  switch (body.type) {
    case 'marker': id = await addMarker(context, userId, body); break;
    case 'plant': id = await addPlant(context, userId, body); break;
    default: return invalidRequest();
  }

  return new Response(JSON.stringify({
    id, userId, epoch: body.epoch
  }), { status: 200 });
}

async function getUserId(context: EventContext<Env, any, Record<string, unknown>>): Promise<number> {
  const accessToken = context.request.headers.get('Authorization');
  if (!accessToken) { return -1; }

  const userResponse = await fetch(DISCORD_USER_URL, {
    headers: { Authorization: `${accessToken}` },
  });

  const userData = await userResponse.json() as any;
  console.log(accessToken, userData);
  return userData?.id ?? 0;
}

async function addMarker(context: EventContext<Env, any, Record<string, unknown>>, userId: number, body: IRequestBody): Promise<number> {
  const query = `
    INSERT INTO dyePlantMarkers (userId, lat, lng, date)
    VALUES (?, ?, ?, ?);
  `;

  const date = new Date(body.epoch);
  const result = await context.env.DB.prepare(query)
    .bind(userId, body.lat, body.lng, date.toISOString())
    .run();
  return result.meta.last_row_id;
}

async function addPlant(context: EventContext<Env, any, Record<string, unknown>>, userId: number, body: IRequestBody): Promise<number> {
  const query = `
  INSERT INTO dyePlants (userId, epoch, markerId, date)
  VALUES (?, ?, ?, ?);
`;

const date = new Date(body.epoch);
const result = await context.env.DB.prepare(query)
  .bind(userId, body.epoch, body.markerId, date.toISOString())
  .run();
return result.meta.last_row_id;
}
