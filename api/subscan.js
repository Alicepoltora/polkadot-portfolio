/**
 * Vercel Serverless Function — Subscan API proxy.
 * Proxies POST requests to Subscan so the browser avoids CORS issues.
 * The API key is kept server-side via VITE_SUBSCAN_KEY env var.
 *
 * Usage from frontend:
 *   POST /api/subscan
 *   Body: { slug: "polkadot", path: "/api/v2/scan/transfers", payload: { address, row, page } }
 */

export default async function handler(req, res) {
  // Allow browser CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, path, payload } = req.body;

  if (!slug || !path) {
    return res.status(400).json({ error: 'Missing slug or path' });
  }

  const apiKey = process.env.VITE_SUBSCAN_KEY;
  if (!apiKey) {
    return res.status(503).json({ code: 503, message: 'No Subscan API key configured' });
  }

  const url = `https://${slug}.api.subscan.io${path}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload ?? {}),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ code: 502, message: err.message });
  }
}
