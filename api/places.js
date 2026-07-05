// Vercel Serverless Function: Google Places APIプロキシ
// APIキーはサーバー側の環境変数 GOOGLE_PLACES_API_KEY に保存

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.rating',
  'places.userRatingCount',
  'places.primaryTypeDisplayName',
  'places.regularOpeningHours',
  'places.currentOpeningHours',
].join(',');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // キー未設定の場合はフロント側でモックに切り替えるためのフラグを返す
    return res.status(200).json({ mock: true, places: [] });
  }

  const { query } = req.body || {};
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'ja',
        maxResultCount: 6,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Places API error' });
    }

    const places = (data.places || []).map(p => ({
      id: p.id,
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      location: p.location,
      types: p.types || [],
      category: p.primaryTypeDisplayName?.text || '',
      rating: p.rating,
      ratingCount: p.userRatingCount,
      isOpen: p.currentOpeningHours?.openNow ?? null,
      openingHours: p.regularOpeningHours?.weekdayDescriptions || [],
    }));

    return res.status(200).json({ places });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
