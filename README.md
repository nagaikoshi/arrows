# arrows →

行きたいスポットをリストアップすると、AIが混雑時間・滞在時間を考慮して最適な旅行行程を自動生成する旅行プランニングアプリ。

## 機能

| 機能 | 説明 |
|------|------|
| 🔍 スポット検索 | Google Places APIで本物のマップデータを検索・リスト追加（キー未設定時はサンプルデータで動作） |
| ✨ AI行程生成 | 混雑時間帯・滞在時間・移動手段を考慮してClaudeが1日の最適ルートをタイムライン生成 |
| 🧭 モデルコース | 地名を入力するだけでAIがおすすめコースを提案。ワンタップでプラン作成に取り込み可能 |
| 💾 プラン保存 | 生成した行程をブラウザに保存していつでも見返せる（localStorage） |

## アーキテクチャ

```
ブラウザ (React)
   │
   ├── /api/claude   ← Vercelサーバーレス関数（Claude APIプロキシ）
   │        └── ANTHROPIC_API_KEY はサーバー側にのみ保存
   │
   └── /api/places   ← Vercelサーバーレス関数（Places APIプロキシ）
            └── GOOGLE_PLACES_API_KEY はサーバー側にのみ保存
```

**APIキーはブラウザに一切露出しません。** サーバーレス関数が代理でAPIを呼び出します。

## デプロイ手順（Vercel）

### 1. GitHubにpush

```bash
cd arrows
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/あなたのユーザー名/arrows.git
git push -u origin main
```

### 2. Vercelでデプロイ

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. **Add New Project** → `arrows` リポジトリをインポート
3. Framework Preset: **Create React App**（自動検出されます）
4. **Environment Variables** に以下を追加:

| Key | Value | 必須 |
|-----|-------|------|
| `ANTHROPIC_API_KEY` | Claude APIキー | ✅（AI機能に必要） |
| `GOOGLE_PLACES_API_KEY` | Google Places APIキー | 任意（未設定ならモック検索） |

5. **Deploy** をクリック

数分で `https://arrows-xxx.vercel.app` が発行されます。

### APIキーの取得先

- **Claude API**: [console.anthropic.com](https://console.anthropic.com) → API Keys
- **Google Places API**: [console.cloud.google.com](https://console.cloud.google.com) → 「Places API (New)」を有効化 → 認証情報でAPIキー作成

## ローカル開発

```bash
npm install
npm start        # http://localhost:3000
```

ローカルでは `/api/*` が動かないため、スポット検索は自動的にサンプルデータになります。
サーバーレス関数込みでローカル実行する場合は Vercel CLI を使います:

```bash
npm i -g vercel
cp .env.example .env   # APIキーを記入
vercel dev
```

## ディレクトリ構成

```
arrows/
├── api/                  # Vercelサーバーレス関数
│   ├── claude.js         # Claude APIプロキシ
│   └── places.js         # Google Places APIプロキシ
├── src/
│   ├── components/       # SpotSearch, SpotCard, Timeline
│   ├── pages/            # PlanPage, CoursePage, SavedPage
│   ├── utils/            # api.js（API層+モック）, storage.js（保存）
│   └── styles/           # global.css（デザインシステム）
└── public/
```

## 今後のロードマップ

- [ ] Google Places APIキー取得 → 本番データで検索
- [ ] Routes APIで実際の移動時間計算
- [ ] スマホアプリ化（React Native）
- [ ] おすすめ掲載のマネタイズ機能
