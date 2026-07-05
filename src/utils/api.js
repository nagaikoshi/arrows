// フロントエンドAPI層
// 本番: Vercelサーバーレス関数 (/api/*) を呼ぶ → APIキーはブラウザに露出しない
// ローカル/キー未設定: モックデータに自動フォールバック

// ---------------------------------------------------------------------------
// スポット検索
// ---------------------------------------------------------------------------

export async function searchSpots(query) {
  try {
    const res = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('places api error');
    const data = await res.json();
    if (data.mock) return { places: mockSearchResults(query), isMock: true };
    return { places: data.places, isMock: false };
  } catch (e) {
    // サーバーレス関数が動いていないローカル環境などではモックにフォールバック
    return { places: mockSearchResults(query), isMock: true };
  }
}

// ---------------------------------------------------------------------------
// Claude API 呼び出し
// ---------------------------------------------------------------------------

async function callClaude(prompt, maxTokens = 1500) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Claude API error');
  return data.text;
}

function parseJsonResponse(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ---------------------------------------------------------------------------
// AI行程生成
// ---------------------------------------------------------------------------

export async function generateItinerary(spots, conditions) {
  const spotList = spots
    .map(s => `・${s.name}（${s.address}、カテゴリ: ${s.category || '不明'}、推定滞在: ${s.estimatedStayMinutes || 45}分）`)
    .join('\n');

  const prompt = `あなたはプロの旅行プランナーです。以下のスポットリストと条件をもとに、効率的で楽しい1日の旅行行程を作成してください。

【スポットリスト】
${spotList}

【旅行条件】
- 旅行日: ${conditions.date}
- 出発時間: ${conditions.startTime}
- 終了希望時間: ${conditions.endTime}
- 移動手段: ${transportLabel(conditions.transport)}
- ペース: ${conditions.pace}
- 人数: ${conditions.people}名

【重要な考慮事項】
- 各スポットの一般的な混雑時間帯を考慮し、混雑を避けるように時間を調整してください
- 地理的に近いスポットをまとめて回れるようにルートを最適化してください
- 食事系スポットは昼食・夕食の自然な時間帯に配置してください
- 移動時間は移動手段を考慮して現実的に見積もってください

以下のJSON形式のみで返答してください。前置き・説明・マークダウン記法は不要です:
{
  "itinerary": [
    {
      "time": "HH:MM",
      "name": "スポット名",
      "duration": "XX分",
      "tip": "混雑回避や楽しみ方のアドバイス（1〜2文）",
      "tags": ["タグ1", "タグ2"]
    }
  ],
  "transits": [
    { "from": 0, "to": 1, "minutes": 15, "method": "電車" }
  ],
  "summary": "この行程の全体的なコンセプトや特徴（1〜2文）"
}`;

  const text = await callClaude(prompt, 2000);
  return parseJsonResponse(text);
}

// ---------------------------------------------------------------------------
// モデルコース生成
// ---------------------------------------------------------------------------

export async function generateModelCourse(destination) {
  const prompt = `あなたは旅行のプロです。「${destination}」の魅力的な1日モデルコースを提案してください。

以下のJSON形式のみで返答してください:
{
  "title": "コースタイトル（魅力的に）",
  "subtitle": "コンセプト（1文）",
  "duration": "所要時間の目安（例: 8時間）",
  "bestSeason": "おすすめシーズン",
  "spots": [
    {
      "name": "スポット名",
      "category": "カテゴリ",
      "desc": "見どころや楽しみ方（1〜2文）",
      "estimatedStayMinutes": 60
    }
  ],
  "tips": ["旅のアドバイス1", "旅のアドバイス2"]
}`;

  const text = await callClaude(prompt, 1200);
  return parseJsonResponse(text);
}

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------

function transportLabel(value) {
  return { transit: '電車・バス', walking: '徒歩', driving: '車', cycling: '自転車' }[value] || value;
}

export function getCategoryIcon(types = [], category = '') {
  const str = [...types, category].join(' ').toLowerCase();
  if (/restaurant|food|ramen|sushi|レストラン|食/.test(str)) return '🍽️';
  if (/cafe|coffee|カフェ/.test(str)) return '☕';
  if (/bar|night|バー/.test(str)) return '🍸';
  if (/museum|gallery|美術|博物/.test(str)) return '🏛️';
  if (/shrine|temple|church|寺|神社/.test(str)) return '⛩️';
  if (/park|garden|公園|庭/.test(str)) return '🌿';
  if (/shopping|store|market|ショップ|買/.test(str)) return '🛍️';
  if (/tourist|attraction|landmark|観光/.test(str)) return '📍';
  if (/spa|onsen|温泉/.test(str)) return '♨️';
  if (/amusement|遊園/.test(str)) return '🎡';
  if (/hotel|宿/.test(str)) return '🏨';
  return '📌';
}

export function estimateStayMinutes(types = [], category = '') {
  const str = [...types, category].join(' ').toLowerCase();
  if (/amusement|遊園/.test(str)) return 180;
  if (/zoo|aquarium|動物|水族/.test(str)) return 120;
  if (/museum|美術|博物/.test(str)) return 90;
  if (/shopping_mall|department/.test(str)) return 90;
  if (/restaurant|レストラン/.test(str)) return 60;
  if (/tourist|attraction|観光/.test(str)) return 60;
  if (/cafe|カフェ/.test(str)) return 40;
  if (/park|公園/.test(str)) return 45;
  if (/shrine|temple|寺|神社/.test(str)) return 30;
  if (/store|shop/.test(str)) return 30;
  return 45;
}

// ---------------------------------------------------------------------------
// モックデータ（APIキー未設定時のフォールバック）
// ---------------------------------------------------------------------------

const MOCK_POOL = [
  { name: '一蘭 渋谷店', address: '東京都渋谷区神南1丁目', types: ['restaurant'], category: 'ラーメン', rating: 4.1, ratingCount: 5200 },
  { name: '東京タワー', address: '東京都港区芝公園4丁目', types: ['tourist_attraction'], category: '観光スポット', rating: 4.5, ratingCount: 98000 },
  { name: '浅草寺', address: '東京都台東区浅草2丁目', types: ['temple', 'tourist_attraction'], category: '寺院', rating: 4.5, ratingCount: 120000 },
  { name: 'ブルーボトルコーヒー 清澄白河', address: '東京都江東区平野1丁目', types: ['cafe'], category: 'カフェ', rating: 4.2, ratingCount: 3100 },
  { name: '表参道ヒルズ', address: '東京都渋谷区神宮前4丁目', types: ['shopping_mall'], category: 'ショッピング', rating: 4.0, ratingCount: 21000 },
  { name: '明治神宮', address: '東京都渋谷区代々木神園町', types: ['shrine'], category: '神社', rating: 4.6, ratingCount: 75000 },
];

function mockSearchResults(query) {
  // クエリに部分一致するものを優先、なければ全部返す
  const matched = MOCK_POOL.filter(p => p.name.includes(query) || p.category.includes(query));
  const pool = matched.length > 0 ? matched : MOCK_POOL.slice(0, 4);
  return pool.map((p, i) => ({
    ...p,
    id: `mock-${p.name}-${i}`,
    isMock: true,
  }));
}
