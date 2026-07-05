// Vercel Serverless Function: Claude APIプロキシ
// APIキーはサーバー側の環境変数 ANTHROPIC_API_KEY に保存（ブラウザに露出しない）

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
  }

  const { prompt, maxTokens = 1500 } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: maxTokens,
        // このエンドポイントは構造化JSONの生成のみに使うため、推論(thinking)は不要。
        // 有効なままだとthinkingブロックがcontent[0]を占有し、かつmax_tokensの
        // 予算を消費してしまう（テキスト生成前に打ち切られる原因になっていた）。
        thinking: { type: 'disabled' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API error', response.status, data);
      return res.status(response.status).json({ error: data.error?.message || 'Claude API error' });
    }

    console.log('Claude API content blocks', JSON.stringify(data.content));

    const textBlock = (data.content || []).find(block => block.type === 'text');

    return res.status(200).json({ text: textBlock?.text || '', stopReason: data.stop_reason });
  } catch (err) {
    console.error('Claude API request failed', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
