# バカラアドバイザー モジュラー実装ガイド

## ⚠️ 重要な警告

このアプリケーションはギャンブルに関連します。ギャンブルは中毒性があり、深刻な経済的・精神的被害をもたらす可能性があります。この実装ガイドは純粋に技術的な教育目的であり、実際のギャンブルでの使用は推奨しません。

## 実装手順

### 1. プロジェクト構造の作成

```
baccarat-advisor/
├── index.html
├── manifest.json
├── css/
│   └── styles.css
└── js/
    ├── translations.js
    ├── state.js
    ├── utils.js
    ├── components.js
    ├── gameLogic.js
    ├── riskManagement.js
    ├── ui.js
    └── app.js
```

### 2. ファイルの準備

#### A. index.html の変更点

提供されたHTMLから以下を変更する必要があります：

**削除する部分：**
- `<style>` タグ内のすべてのCSS
- `<script>` タグ内のすべてのJavaScript
- manifest のbase64エンコードされた内容

**変更する部分：**
- manifest参照を外部ファイルに変更: `<link rel="manifest" href="manifest.json">`
- CSSファイルの読み込み追加: `<link rel="stylesheet" href="css/styles.css">`
- HTMLの構造を簡素化（コンポーネントコンテナのみ残す）

#### B. CSS分離 (css/styles.css)

元のHTMLファイルの `<style>` タグ内のすべての内容をこのファイルに移動します。

#### C. manifest.json の作成

```json
{
  "name": "バカラ戦略アドバイザー",
  "short_name": "BaccaratAdvisor",
  "description": "バカラの戦略をサポートする多言語アドバイザー",
  "icons": [
    {
      "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9IiNhNmE4MjciIHhtbG5zPSJodHRwczovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICA4Y0dGMGFDQmtQU0p0TmpRZ05qUkROalFnTWpjdU5UWWdNamN1TlRZZ05qUWdOalJETVRBd0xqUTBJRFkwSURFeU9DQTJOREF4TlM0ME5DQXlOeTQxTmlBNU5pQXlOeTQxTmlBNU5pQTVOa001TmlBeE1EQXVORFFnTmpRZ01UQTRJRFkwSURFeU9VTTNOQ0V4TURndU5EUWdNamN1TlRZZ01UQXdMalEwSURJM0xqVTJJRFkwSURFMklEWTBJajQ4TDNOMlp6ND0iLCJ0eXBlIjoiaW1hZ2Uvc3ZnK3htbCIsInNpemVzIjoiMTI4eDEyOCJ9",
      "type": "image/svg+xml",
      "sizes": "128x128"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1b2c3e",
  "background_color": "#0f472a"
}
```

### 3. モジュールファイルの配置

私が提供した以下のモジュールを対応するディレクトリに配置：

1. **js/translations.js** - 多言語サポート
2. **js/state.js** - 状態管理
3. **js/utils.js** - ユーティリティ関数
4. **js/components.js** - UIコンポーネント生成
5. **js/gameLogic.js** - ゲームロジック
6. **js/riskManagement.js** - リスク管理
7. **js/ui.js** - UI更新とイベント処理
8. **js/app.js** - メイン初期化

### 4. 主な違い

#### 元のHTMLとの違い：

| 要素 | 元のHTML | モジュラー版 |
|------|----------|-------------|
| CSS | HTMLファイル内 | 外部ファイル (css/styles.css) |
| JavaScript | HTMLファイル内 | 8つの個別モジュール |
| コンポーネント | 静的HTML | 動的生成 |
| manifest | Base64エンコード | 外部JSONファイル |

#### 動的コンポーネント生成：

元のHTMLでは静的だった部分が、モジュラー版では以下のコンテナに動的に生成されます：

```html
<!-- 元のHTML: 静的なコンポーネント -->
<div class="card">
  <h3>クイック入力</h3>
  <!-- 固定の内容 -->
</div>

<!-- モジュラー版: 動的生成 -->
<div id="quickInputComponent"></div>
<!-- JavaScriptで動的に内容が生成される -->
```

### 5. 開発環境での実行

#### ローカルサーバーの起動

モジュールファイルの読み込みには適切なMIMEタイプが必要なため、ローカルサーバーが必要です：

**Python使用:**
```bash
cd baccarat-advisor
python -m http.server 8000
```

**Node.js使用:**
```bash
npx serve . -p 8000
```

**Live Server (VS Code拡張):**
右クリック → "Open with Live Server"

#### ブラウザでのアクセス
```
http://localhost:8000
```

### 6. デバッグとトラブルシューティング

#### コンソールコマンド：

```javascript
// デバッグモードの有効化
toggleDebugMode()

// 現在の状態確認
BaccaratApp.dev.getState()

// ゲーム状態の詳細
BaccaratApp.dev.debugGame()

// バージョン情報
BaccaratApp.dev.version
```

#### よくある問題：

1. **モジュールが読み込まれない**
   - ファイルパスを確認
   - ローカルサーバーを使用しているか確認
   - ブラウザの開発者ツールでネットワークエラーを確認

2. **コンポーネントが表示されない**
   - `ComponentsModule.initializeComponents()` が実行されているか確認
   - HTMLのコンテナIDが正しいか確認

3. **状態が更新されない**
   - `AppState.setState()` を使用しているか確認
   - 状態リスナーが正しく設定されているか確認

### 7. 本番環境への展開

#### 必要な準備：
1. すべてのファイルを適切なウェブサーバーにアップロード
2. HTTPS接続の設定（PWA要件）
3. 適切なMIMEタイプの設定
4. セキュリティヘッダーの設定

#### 推奨設定：

**.htaccess (Apache):**
```apache
# JavaScript MIMEタイプ
AddType application/javascript .js

# セキュリティヘッダー
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
```

**nginx.conf:**
```nginx
location ~* \.js$ {
    add_header Content-Type application/javascript;
}
```

### 8. カスタマイズ方法

#### 新しい言語の追加：

1. `translations.js` の `translations` オブジェクトに新しい言語を追加
2. `languageOptions` 配列に新しい言語オプションを追加

#### 新しい戦略の追加：

1. `gameLogic.js` の `verifyPattern()` 関数を修正
2. `generateBetSuggestion()` 関数に新しいロジックを追加

#### UIコンポーネントの変更：

1. `components.js` で対応するコンポーネント生成関数を修正
2. `css/styles.css` で必要なスタイルを追加

### 9. 注意事項

1. **ギャンブルの危険性**: このアプリケーションの使用は教育目的に留め、実際の賭博には使用しないでください
2. **法的規制**: 居住地域の法律を確認してください
3. **依存症のリスク**: ギャンブル依存症の兆候がある場合は専門家に相談してください
4. **財務リスク**: いかなる「戦略」も損失を保証するものではありません

この実装ガイドは技術的な学習目的のものです。実際のギャンブルでの使用は強く推奨しません。