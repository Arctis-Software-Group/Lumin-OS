# 🌟 Lumin OS

**Lumin OS**は、HTML/CSS/JavaScriptのみで構築された完全クライアントサイド型の仮想OSです。ブラウザで開けばすぐに使え、PWA対応によりオフラインでも動作します。

## ✨ 特徴

### 📦 インストール不要
開けばそこにOSがある。ブラウザだけでフル機能を利用できます。

### 🌐 オフライン自由
ネット接続がなくても作業可能。PWA技術により、一度アクセスすればオフラインでも起動します。

### 🔓 完全オープンソース
MITライセンスの下、世界中の知恵と情熱を集めています。

### 🚀 無限の拡張性
HTML/CSS/JSでアプリを作れば即座にOS内で動作。自由にカスタマイズ可能です。

### 💎 心を惹きつけるUI
光をテーマにしたガラスモーフィズムデザインで、美しく直感的な操作体験を提供します。

## 📱 標準搭載アプリ

- **📝 メモ帳** - Markdown対応のテキストエディタ、リアルタイムプレビュー付き
- **🖼️ 画像ビューア** - ローカル画像ファイルの閲覧、ズーム機能
- **🎵 音楽プレイヤー** - ローカル音楽ファイルの再生、プレイリスト管理
- **🎨 ドローアプリ** - シンプルなお絵描きツール
- **📊 簡易表計算** - セル参照に対応した軽量スプレッドシート
- **⏰ 時計＆タイマー** - デジタル時計、タイマー、ストップウォッチ
- **🎮 ミニゲーム** - クラシックなブロック崩しゲーム
- **📁 ファイルマネージャー** - IndexedDBベースの仮想ファイルシステム

## 🚀 クイックスタート

### ダウンロードしてすぐに使う

1. リポジトリをダウンロードまたはクローン
2. `index.html` をダブルクリックしてブラウザで開く
3. そのまま全機能を利用できます（インストール不要）
   - PWA のインストール機能は HTTPS または localhost で自動的に有効になります

### ローカルで起動（オプション）

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/lumin-os.git
cd lumin-os

# 簡易HTTPサーバーを起動（Python 3の場合）
python3 -m http.server 8000

# ブラウザで開く
# http://localhost:8000
```

または、任意の静的サイトホスティングサービス（GitHub Pages、Netlify、Vercel等）にデプロイできます。

### PWAとしてインストール

1. ブラウザで開く
2. アドレスバーのインストールアイコンをクリック
3. 「インストール」を選択

これでデスクトップアプリのように使用できます！

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6 Modules)
- **ストレージ**: IndexedDB, LocalStorage
- **PWA**: Service Worker, Web App Manifest
- **デザイン**: ガラスモーフィズム、カスタムCSS

## 📂 プロジェクト構造

```
lumin-os/
├── index.html              # エントリーポイント
├── manifest.webmanifest    # PWAマニフェスト
├── service-worker.js       # Service Worker
├── css/
│   └── styles.css          # メインスタイルシート
├── js/
│   ├── main.js             # メインエントリー
│   ├── os-core.js          # OSコア機能
│   ├── window-manager.js   # ウィンドウ管理
│   ├── file-system.js      # 仮想ファイルシステム
│   └── apps/               # アプリケーション
│       ├── notepad.js
│       ├── clock.js
│       ├── breakout.js
│       ├── image-viewer.js
│       ├── music-player.js
│       ├── draw-app.js
│       ├── spreadsheet.js
│       └── file-manager.js
└── assets/
    └── icons/              # アイコン
```

## 🎨 カスタマイズ

### 新しいアプリを追加する

1. `js/apps/` ディレクトリに新しいファイルを作成
2. アプリオブジェクトをエクスポート:

```javascript
import { createWindow } from '../window-manager.js';

export const myApp = {
  id: 'my-app',
  name: 'マイアプリ',
  icon: '🚀',
  description: 'アプリの説明',
  
  launch() {
    const content = document.createElement('div');
    content.textContent = 'Hello, Lumin OS!';
    createWindow(this.id, this.name, content, { width: 600, height: 400 });
  }
};
```

3. `js/main.js` でアプリをインポート・登録:

```javascript
import { myApp } from './apps/my-app.js';

bootApps([
  // 既存のアプリ...
  myApp
]);
```

### テーマのカスタマイズ

`css/styles.css` の `:root` セクションで色やスタイルを変更できます:

```css
:root {
  --color-primary: #38bdf8;
  --color-secondary: #facc15;
  --color-bg-dark: #0f172a;
  /* ... */
}
```

## 🤝 コントリビューション

コントリビューションは大歓迎です！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m '素晴らしい機能を追加'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

## 🌐 ブラウザ対応

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 💡 今後の展開

- [ ] テキストエディタの構文ハイライト
- [ ] カレンダー・スケジューラー
- [ ] ターミナルエミュレータ
- [ ] PDFビューア
- [ ] コードエディタ
- [ ] チャット・メッセージアプリ
- [ ] ウィジェット機能
- [ ] テーマ切替機能
- [ ] マルチウィンドウのスナップ機能
- [ ] ドラッグ&ドロップでのファイルアップロード

---

**Lumin OS** - 制限はありません。創造力がOSの限界を決めるのです。 ✨
