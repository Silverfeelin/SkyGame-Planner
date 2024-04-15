// Only season spirits
var spirits = skyData.spiritConfig.items.filter(s => s.type === 'Season');

// Take their last TS / RS / Season start date.
var lastVisits = spirits.map(s => {
  const returnDate = s.returns?.at(-1)?.return?.date;
  const tsDate = s.ts?.at(-1)?.date;
  const seasonDate = s.season?.date;
  const dates = [returnDate, tsDate, seasonDate].filter(d => d);
  const lastDate = DateTime.max(...dates);
  return [s.name, lastDate];
});

// Sort lastVisits by lastDate
var r = lastVisits.sort((a, b) => a[1].diff(b[1]).as('milliseconds')).map(v => [v[0], v[1].toFormat('yyyy-MM-dd')]);
r = r.map(v => v.join(', ')).join('\n');
console.log(r);
