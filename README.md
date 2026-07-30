# 配信者向け視聴者参加型ガチャシステム（Firebase連携版）セットアップ手順

## ファイル構成

```
gacha-firebase/
├── index.html          配信用画面（OBSブラウザソースに設定するのはこれ）
├── post.html            投稿画面（視聴者に共有するURL。ログイン不要）
├── admin.html            管理画面（Firebase Authでログインした管理者専用・NEW）
├── firebase-config.js   Firebase接続設定（要編集）
├── firestore.rules      Firestoreセキュリティルール
└── README.md            この手順書
```

## 1. Firebaseプロジェクトを用意する

**既存プロジェクトを流用する場合**：技術的には問題ありません。Firebaseの1プロジェクトには複数の「アプリ」を追加でき、Firestoreのコレクションも `gacha_posts` という専用の名前にしてあるので、他のアプリのデータと混ざる心配はほぼありません。
既存プロジェクトを開き、「プロジェクトの設定」→「マイアプリ」→ ウェブアプリを追加（すでにウェブアプリがあればそれを流用してもOK）してください。

**新規に作る場合**：
1. https://console.firebase.google.com/ にアクセスしてプロジェクトを作成
2. 左メニュー「Firestore Database」→ データベースを作成（本番モードでOK。ルールは後で上書きします）
3. 「プロジェクトの設定」→「マイアプリ」→ ウェブアプリ（`</>` アイコン）を追加

いずれの場合も、追加/確認した際に表示される設定値（`apiKey` など）をコピーしておいてください。

## 2. `firebase-config.js` を編集する

ファイル冒頭の `firebaseConfig` オブジェクトを、手順1でコピーした値に置き換えてください。

```js
const firebaseConfig = {
  apiKey: "実際の値",
  authDomain: "実際の値",
  projectId: "実際の値",
  storageBucket: "実際の値",
  messagingSenderId: "実際の値",
  appId: "実際の値"
};
```

## 3. Firebase Authenticationで管理者アカウントを作る（NEW）

`admin.html`（管理画面）はFirebase Authのログインが必須です。

1. Firebaseコンソール →「Authentication」→「Sign-in method」タブ →「メール/パスワード」を有効化
2. 「Users」タブ →「ユーザーを追加」→ 管理者用のメールアドレス・パスワードを設定

`admin.html` に新規登録フォームは用意していません（意図的）。管理者を増やす／減らすのは、必ずFirebaseコンソール側の操作で行ってください。

## 4. Firestoreのセキュリティルールを設定する

Firebaseコンソール →「Firestore Database」→「ルール」タブを開き、`firestore.rules` の内容を貼り付けて「公開」してください。

今回のルールから、投稿の**更新（抽選結果の反映）・削除**、および画像/レイアウト設定の保存は、**Firebase Authでログイン済みの管理者のみ**が実行できるように締めています。配信画面(`index.html`)・投稿画面(`post.html`)は引き続き非ログインのままで、閲覧と投稿(create)のみ可能です。

## 5. GitHub Pagesへデプロイする

このフォルダの中身をそのままリポジトリに置き、GitHub Pagesを有効化してください。

- `index.html` の公開URLを **OBSのブラウザソース** に設定（幅・高さは配信画面の解像度に合わせてください。背景は透過表示されます）
- `post.html` の公開URLを **視聴者向けに概要欄やコメント欄などで共有**
- `admin.html` の公開URLは **配信者本人だけがブックマークして使う**（URLを知っていてもログインできなければ何もできませんが、目立つ場所での共有は避けてください）

⚠️ **モジュール(`import`)を使っているため、`file://` で直接ダブルクリックして開いても動作しません。** GitHub Pagesなど `https://` 経由で開くか、ローカルで確認する場合は `npx serve` などの簡易サーバー経由で開いてください。

## 6. 動作確認の流れ

1. `post.html` を開き、内容とカプセルの色（金/銀/銅）を選んで投稿する
2. `index.html` を開くと、投稿した内容が本体内のカプセルとして色付きで反映される（重力で下に積もります）
3. `admin.html` を開いてログインし、「投稿一覧」に同じ内容が表示されることを確認する
4. `admin.html` の「🎰 抽選を実行する」を押すと、`index.html` 側でガチャ本体が動き、排出→開封→紙が表示される演出が再生される
5. `admin.html` の「🔄 配信画面をリセット」を押すと、`index.html` 側の紙・スタンプが全削除される
6. `admin.html` の「画像登録」「レイアウト調整」を保存すると、`index.html` にリアルタイムで反映される（本体・ハンドル画像の差し替え、位置/サイズ調整）

紙は数秒後に左下へ収集され、クリックで拡大表示、ドラッグで移動、素早く2回クリックで「済」スタンプが押せます。

## 7. データモデル（Firestore）

### `gacha_posts`（投稿）
- `text`：string（投稿内容、最大60文字）
- `color`：`'gold' | 'silver' | 'bronze'`（視聴者・管理者が選択）
- `drawn`：boolean（抽選済みかどうか。初期値 `false`）
- `createdAt`：Firestoreサーバータイムスタンプ

### `gacha_state`（管理画面 → 配信画面への合図・NEW）
- `latest_draw`：`{ postId, text, color, drawnAt, triggeredBy }` — 抽選実行のたびに更新。配信画面はこれを購読して演出を再生する
- `reset_event`：`{ resetAt, triggeredBy }` — リセット実行のたびに更新。配信画面はこれを購読して紙を全削除する

### `gacha_settings`（管理画面が保存するレイアウト・画像・NEW）
- `layout`：`{ hx, hy, hs, cx, cy, cw, ch, l1s, l3s, updatedAt }`
- `images`：`{ layer1, layer3, handle, updatedAt }`（各画像はdata URL文字列。1ドキュメント1MBの制限に注意）

## 8. 管理画面（admin.html）でできること

- 投稿一覧のリアルタイム表示・個別削除
- 投稿の手動追加（視聴者の代わりにテスト/救済投稿）
- 抽選の実行（配信画面側は演出の再生のみを行い、Firestoreへの書き込み権限を持たない）
- 配信画面のリセット（紙・スタンプの全削除）
- ガチャ本体・ハンドル画像の登録（配信画面へリアルタイム反映）
- レイアウト（ハンドル位置・カプセルエリア・スケール）の調整（配信画面へリアルタイム反映）
- 50件超過分の投稿の自動削除（`admin.html` を開いている間のみ動作。常時稼働させるには将来的にCloud Functions化が望ましい）

## 今後の拡張予定（未実装）

- Cloud Functions化（50件超過分のFIFO削除を、管理画面を開いていなくても動作させる）
- 効果音・AIおすすめ設定（自動画像解析）・テーマのエクスポート/インポート・Undo・自動バックアップ・ガチャ履歴・投稿者名表示・紙の色変更・プラグイン設計など、元の仕様書にある項目の多くが未実装
- 画像を大きいまま保存したい場合のFirebase Storageへの移行（現状はFirestoreドキュメントにdata URLとして保存しているため、1ドキュメント1MBの制限あり）
