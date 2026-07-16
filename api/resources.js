// /api/resources — Vercel serverless function
// Securely reads the three Airtable tables and returns combined JSON.
// The Airtable token lives ONLY here (from env var), never exposed to the browser.

const BASE_ID = 'app27PVNHNRU74Yl7';
const TABLES = ['Resources', 'Modules', 'Events'];

// simple in-memory cache (per warm serverless instance)
let cache = { data: null, ts: 0 };
const CACHE_MS = 1 * 60 * 1000; // 1 minute

async function fetchTable(table, token) {
  let records = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable ${table} ${res.status}: ${body.slice(0,200)}`);
    }
    const json = await res.json();
    records = records.concat(json.records || []);
    offset = json.offset || null;
  } while (offset);
  return records;
}

// Convert a Google Drive share link into a direct-view URL.
function driveDirect(url) {
  if (!url) return url;
  // https://drive.google.com/file/d/FILEID/view?...  ->  https://drive.google.com/uc?export=view&id=FILEID
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/view`;
  return url;
}

export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'Server not configured (missing token).' });
    return;
  }

  // serve cache if fresh
  const now = Date.now();
  if (cache.data && (now - cache.ts) < CACHE_MS) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(cache.data);
    return;
  }

  try {
    const [resourcesRaw, modulesRaw, eventsRaw] = await Promise.all(
      TABLES.map(t => fetchTable(t, token))
    );

    // ---- Resources ----
    const resources = resourcesRaw
      .map(r => r.fields)
      .filter(f => f.Published)
      .map(f => ({
        title: f.Title || '',
        type: (f.Type || 'Link'),
        category: f.Category || '',
        description: f.Description || '',
        url: driveDirect(f.URL || ''),
        contactDetail: f['Contact Detail'] || '',
        order: f.Order ?? 999,
        featured: !!f.Featured,
      }))
      .sort((a,b) => a.order - b.order);

    // ---- Modules ----
    const modules = modulesRaw
      .map(r => r.fields)
      .filter(f => f.Published)
      .map(f => ({
        title: f.Title || '',
        track: f.Track || '',
        trackOrder: f['Track Order'] ?? 999,
        vimeoId: (f['Vimeo ID'] || '').toString().trim(),
        duration: f.Duration || '',
        description: f.Description || '',
        order: f.Order ?? 999,
        thumbnail: f['Thumbnail URL'] || '',
        resourceLinks: (f['Resource Links'] || '')
          .split('\n').map(s=>s.trim()).filter(Boolean)
          .map(line => {
            const [label, type, url] = line.split('|').map(x => (x||'').trim());
            return { label: label||'', type: type||'Link', url: url||'' };
          }),
      }))
      .sort((a,b) => a.trackOrder - b.trackOrder || a.order - b.order);

    // ---- Events ----
    const events = eventsRaw
      .map(r => r.fields)
      .filter(f => f.Published)
      .map(f => ({
        name: f.Name || '',
        date: f.Date || '',
        endDate: f['End Date'] || '',
        location: f.Location || '',
        team: f.Team || '',
        manager: f.Manager || '',
        status: f.Status || 'Pending',
        notes: f.Notes || '',
      }))
      .sort((a,b) => (a.date||'').localeCompare(b.date||''));

    const payload = { resources, modules, events, generatedAt: new Date().toISOString() };
    cache = { data: payload, ts: now };

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(payload);
  } catch (err) {
    // if we have stale cache, serve it rather than error
    if (cache.data) {
      res.setHeader('X-Cache', 'STALE');
      res.status(200).json(cache.data);
      return;
    }
    res.status(500).json({ error: String(err.message || err) });
  }
}
