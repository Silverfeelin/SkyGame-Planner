
interface Env {
  ASSETS: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const data = await context.env.ASSETS.fetch(`${url.origin}/assets/data/everything.json`);
  const everything = await data.json();

  const guidMap = new Map<string, any>();

  for (const key of Object.keys(everything)) {
    const data = everything[key];
    if (!data.items?.length) { continue; }

    for (const item of data.items) {
      guidMap.set(item.guid, item);
    }
  }

  console.log(`Loaded ${guidMap.size} items by GUID.`);
  return new Response(JSON.stringify(everything), { headers: { 'Content-Type': 'application/json' } });
}
