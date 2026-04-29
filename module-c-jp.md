# テストプロジェクト概要 - モジュールC - REST API

## 競技時間

競技者はこのモジュールを完了するために **3時間** 与えられます。

## はじめに

SkillShare Academy（SSA）は、ユーザーがコースに登録してクレジットを獲得し、メンターセッションを予約できる学習プラットフォームです。これまで、システムは以下の構成でした：

- SSAメインバックエンド
- SSAダッシュボードフロントエンド
- **簡略化された**コンテンツサービスバックエンド

コンテンツサービスはメインバックエンドからのみアクセス可能で、基本的なコースとチャプターのデータを提供していました。メインバックエンドはSSAダッシュボードフロントエンド向けのエンドポイントを公開しており、ユーザーはサインアップ、ログイン、コース登録、メンターセッション予約が可能でした。ダッシュボードから**コースコンテンツを閲覧することはできず**、**無効化**された「**Continue Learning**」ボタンが表示されるだけで、レッスンやクイズへのルートはありませんでした。

モジュールDでは、コースコンテンツを表示するための**独立したサイト**（LMSサイト）が実装されます。  
このCモジュールは、リッチな学習コンテンツとクイズをサポートする**より高度なコンテンツサービス**の構築に焦点を当てています。このサービスは公開アクセス可能となり、**メインバックエンドと認証・認可システムを共有**します。  
ユーザー管理、登録、クレジット、メンターセッションはメインバックエンドに残り、このモジュールのスコープ外です。

提供されているSkillShare Academyメインバックエンドは、新しい構造に合わせてすでに変更されています。いくつかの新しいエンドポイント（例：チャプター完了、コース登録）が追加され、一部のエンドポイント（例：コース一覧取得）が削除されていますが、既存のほとんどのエンドポイントは変更されていません。

コンテンツサービスはLMSコンテンツ（コース、チャプター、リッチテキスト、メディア、クイズ）を保存・提供します。アクセスはメインバックエンドと共有される認証・認可システムによって制御されます。

## プロジェクトとタスクの概要

競技者は、LMSサイト（モジュールD）とシームレスに連携するコンテンツサービスを実装します。以下はメインタスクの概要です。詳細な仕様は[要件](#requirements)セクションに記載されています：

- 認証・認可システムの実装
- エラーハンドリングの実装
- 認証済みユーザーが特定のコースまたはチャプターへのアクセス権を持つかの検証
- コース詳細の提供
- コンテンツ要素のパース
- チャプターのコンテンツとクイズの提供
- クイズの評価
- チャプター完了をメインバックエンドへ通知

このモジュールでは、完全に機能する**メインバックエンド**が `https://cXX-YYYY-main-backend.ssa.skillsit.hu` で提供されます。`cXX` は割り当てられたユーザー名、`YYYY` はPINコードです。メインバックエンドの全エンドポイントのリファレンスはOpenAPI形式で `[/assets/module-c/api/ssa-main-backend-openapi.yaml](/assets/module-c/api/ssa-main-backend-openapi.yaml)` にあります。

### 認証と認可

コンテンツサービスはメインバックエンドに基づく認証・認可システムを使用します。ユーザーはメインのSkillShare Academyプラットフォームで認証し、メインバックエンドのログインエンドポイントが**署名済みBearerトークン**を発行します。このトークンはコンテンツサービスでも使用されます。

**テスト用:** 提供されているメインバックエンドとダッシュボードでは、**すべてのユーザーが同じパスワードを共有します：** `password123`。例えば **[alice@example.com](mailto:alice@example.com)** / **password123** でサインインしてBearerトークンを取得したり、登録・チャプターフローを試したりできます。

トークンはJWT風の構造に従います：

`header.payload.signature`

各部分：

- `header` はBase64URLエンコードされたJSONオブジェクト
- `payload` はBase64URLエンコードされたJSONオブジェクト
- `signature` は**HMAC-SHA256**と**共有シークレット**を使用して、エンコードされたヘッダーとペイロードから生成されます

**共有シークレット:** 提供されているメインバックエンドで使用される共有シークレットは以下の通りです。コンテンツサービスは全く同じUTF-8文字列の値を使用する必要があります：

`38344ac35d91bfd0c8f43963b0ca188d2a039504e825ff968b0366855bdbca5b`

ペイロードには少なくとも以下が含まれている必要があります：

- `sub`: ユーザーID
- `exp`: 有効期限タイムスタンプ

**トークンの有効期間:** メインバックエンドが発行するトークンは、発行から**60秒後**に期限切れとなります。`exp` クレームはその時刻を反映するUnixタイムスタンプです。コンテンツサービスと手動テストでは、この短命なトークンを適切に扱う必要があります。

**長期有効なテストトークン（約7日間）:** 繰り返しログインせずにテストするために、**alice@example.com**（ペイロードのsubject `1`）向けの事前発行済みBearerトークンを使用できます。発行から約**7日間**有効です（`exp` を参照）。

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IlNTQSJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzc1MTYyNzA0fQ.xGCNwuEthwy6iGWkS8FkCk5Wm9VYV7cLF41T6CLl_b0
```

`Authorization: Bearer <token>` で使用するか、LMSを `?token=<token>` で開く際に使用します。通常のダッシュボードログインでは引き続き**60秒**トークンが発行されます。このトークンは開発および手動テストの便宜のためのみです。

**ヒント:** 手動のAPIおよび統合テストには、**Tailwind CSS & ShadCN UI Tutorial** コース（スラッグ **`tailwind-css-shadcn-ui-tutorial`**）の使用を推奨します。このコースはシードデータの中で最もリッチなチャプターコンテンツ（多くのブロックタイプ、メディア、リスト、クイズ）を持つため、パース、シーケンシャルアクセス、クイズフローをエンドツーエンドで検証するのに最適です。必要に応じてダッシュボードから **alice@example.com** をそのコースに登録してください。

コンテンツサービスはすべての保護されたリクエストでトークンをローカルに検証します：

1. トークンが存在し、正しい構造を持つ必要があります。
2. 署名が有効である必要があります。
3. トークンが有効期限切れでない必要があります。
4. トークンが有効であれば、リクエストを処理できます。
5. トークンが欠如、不正形式、無効、または期限切れの場合、リクエストを拒否する必要があります（`401 Unauthorized`）。

コンテンツサービスはこれらのトークンをローカルで検証する必要があります。

**リファレンス:** `[/assets/module-c/handouts/handout-hmac-sha256-token-signing.md](/assets/module-c/handouts/handout-hmac-sha256-token-signing.md)` （HMAC-SHA256による `header.payload.signature` の署名と検証）。

トークン検証に外部の認証またはJWTライブラリを使用**してはいけません**。

### コンテンツリポジトリとユーザーフロー

- ユーザーはコンテンツにアクセスする前にコースに登録されている必要があります。
- コンテンツはチャプター（モジュール）に構造化されています。ユーザーは順番に進み、前のモジュールを完了した後にのみ次のモジュールが利用可能になります。
- 各モジュールは短い多肢選択クイズで終わります。ユーザーはモジュールを完了するためにすべての問題に正解する必要があります。

### モジュール構成

各学習モジュールは以下で構成されます：

- **タイトル**
- **画像**
- **コンテンツ**
- **クイズ**

### コンテンツ

コンテンツは以下のタイプのコンテンツブロックをさまざまな組み合わせで構成されます：

- h1, h2, h3, h4 ヘッダー
- 段落（Paragraph）
- リストアイテム（ListItem）
- 画像（Image）
- 動画（Video）
- リンク（Link）

コンテンツブロックはデータベースの `content_blocks` テーブルに**保存されます**。各コンテンツブロックは以下のフィールドを持つ行です：


| フィールド  | 型                                                              | 説明                                       |
| ----------- | --------------------------------------------------------------- | ------------------------------------------ |
| id          | integer                                                         | 主キー                                     |
| chapter_id  | integer                                                         | チャプターを参照する外部キー               |
| type        | enum (h1, h2, h3, h4, paragraph, list_item, image, video, link) | コンテンツブロックのタイプ                 |
| order_index | integer                                                         | チャプター内の表示順序                     |
| text        | string                                                          | 見出しテキスト（h1-h4）または段落ラベル    |
| img_alt     | string                                                          | 画像の代替テキスト                         |
| url         | string                                                          | 画像、動画、またはリンクブロックのURL      |
| raw_text    | longtext                                                        | 段落ブロックの生のリッチテキストコンテンツ |


**例：** 4つのコンテンツブロックを持つチャプター（`order_index` により順序保持）：


| id  | chapter_id | type      | order_index | text              | img_alt                         | url                                                                                                            | raw_text |
| --- | ---------- | --------- | ----------- | ----------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | 3          | h1        | 1           | Introduction      | NULL                            | NULL                                                                                                           | NULL     |
| 2   | 3          | paragraph | 2           | NULL              | NULL                            | NULL                                                                                                           | `[...]`  |
| 3   | 3          | image     | 3           | NULL              | HTML document structure diagram | [https://content.example.com/images/html-structure.png](https://content.example.com/images/html-structure.png) | NULL     |
| 4   | 3          | link      | 4           | MDN Documentation | NULL                            | [https://developer.mozilla.org/en-US/docs/Web/HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)         | NULL     |


### 段落リッチテキスト形式

リッチテキスト段落は別の `chunks` テーブルにデータベースに**保存されます**。各チャンクは以下のフィールドを持つ行です：


| フィールド | 型      | 説明                       |
| ---------- | ------- | -------------------------- |
| text       | string  | テキストコンテンツ         |
| bold       | boolean | テキストが太字かどうか     |
| italic     | boolean | テキストが斜体かどうか     |


APIから返されるとき、これらはHTMLにパースされ、フロントエンドは表示用のHTMLを受け取ります。

**例：** データベースに保存された2つのチャンク（`orderIndex` により順序保持）：


| orderIndex | text              | bold  | italic |
| ---------- | ----------------- | ----- | ------ |
| 1          | "CSS allows you " | false | false  |
| 2          | "to style"        | true  | false  |


HTMLにパースされると： `<p>CSS allows you <strong>to style</strong></p>`

### このコンテンツを提供するエンドポイント

チャプターの学習コンテンツ（ブロック、レンダリングされたリッチテキスト、メディア、チャプタークイズ）はコンテンツサービスから単一のレスポンスとして返されます：


| メソッド | パス                                     | 認証                  |
| -------- | ---------------------------------------- | --------------------- |
| `GET`    | `/api/courses/:slug/chapters/:chapterId` | Bearerトークン必須    |


**動作（概要）：**

- リクエストされたチャプターのすべての `content_blocks` を `order_index` 順で読み込みます。
- `**h1`-`h4`:** `text` からの見出しテキスト（および必要に応じた関連フィールド）。
- `**paragraph` / `list_item`:** リッチテキストはサーバー上でリンクされた `chunks` 行から組み立てられます（上記参照）。APIは `type` `paragraph` または `list_item`、`html`、および `rawText`（`raw_text` から）を公開し、以下のレスポンススキーマと一致します。チャンク行はJSONに含まれません。
- `**image`、`video`、`link`:** 画像には `url`、`img_alt` を使用し、動画/リンクには該当する場合にタイトルを使用します。
- 同じレスポンスにはLMSが必要とするチャプターの**クイズ**とメタデータ（例：クレジット）が含まれます。

シーケンシャルアクセス（前のチャプター完了）、登録、完全なJSON例、エラーコード（`404`、`403` など）は**[チャプター/モジュールコンテンツ](#chaptermodule-content)**で指定されています。

### コンテンツサービスの要件

コンテンツサービスは、コースカタログ、モジュールコンテンツ、クイズ検証を提供するためにメインバックエンドが必要とするすべてのエンドポイントを提供する必要があります。メインバックエンド（SkillShare Academy API）はユーザー管理、登録、完了追跡、クレジット、メンターセッションを処理します。競技者はこれらのエンドポイントを実装**しません**。

### データベース構造

コンテンツサービスはコース、チャプター、コンテンツ、クイズを保存するための独自のデータベースを使用します。**データベースダンプが提供されます**。競技者は構造を**変更してはいけません**。採点前にデータベースは元の状態に復元されます。

```mermaid
erDiagram
    Course ||--o{ Chapter : "has"
    Chapter ||--o{ ContentBlock : "has"
    ContentBlock ||--o{ Chunk : "has"
    Chapter ||--o{ QuizQuestion : "has"
    QuizQuestion ||--o{ QuizOption : "has"

    Course {
        BIGINT id PK
        STRING title
        STRING slug UK
        STRING description
        ENUM difficulty
        INT totalChapters
        INT totalCredits
        DATETIME createdAt
    }

    Chapter {
        BIGINT id PK
        BIGINT courseId FK
        STRING title
        STRING description
        INT credits
        INT orderIndex
    }

    ContentBlock {
        BIGINT id PK
        BIGINT chapterId FK
        ENUM type "h1, h2, h3, h4, paragraph, list_item, image, video, link"
        INT orderIndex
        STRING text "h1-h4; link-video title; optional paragraph fallback"
        STRING imgAlt "image"
        STRING url "image, video, link"
        TEXT rawText "paragraph, list_item rich text source"
    }

    Chunk {
        BIGINT id PK
        BIGINT contentBlockId FK
        STRING text
        BOOLEAN bold
        BOOLEAN italic
        INT orderIndex
    }

    QuizQuestion {
        BIGINT id PK
        BIGINT chapterId FK
        STRING text
        INT orderIndex
    }

    QuizOption {
        BIGINT id PK
        BIGINT questionId FK
        STRING optionId "a, b, c, ..."
        STRING text
        BOOLEAN isCorrect
        INT orderIndex
    }
```



#### テーブルの説明


| テーブル           | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **courses**        | コースカタログ。`slug` はユニーク（URLセグメント）。`difficulty`：`beginner`、`intermediate`、`advanced`。`total_chapters` と `total_credits` はチャプターデータと一致するよう維持される保存済みカラム。                                                                                                                                                                                                                                                                                          |
| **chapters**       | コース内の学習モジュール。`order_index` がシーケンスを定義。各チャプターにはコンテンツブロックとクイズがあります。                                                                                                                                                                                                                                                                                                                                                                                 |
| **content_blocks** | チャプター順のコンテンツ要素（`order_index`）。`type`：`h1`-`h4`、`paragraph`、`list_item`、`image`、`video`、`link`。カラムには `text`、`img_alt`、`url`、`raw_text` が含まれます（使用は `type` による。例：画像は `url` + `img_alt`；リンク/動画は `text` をラベル/タイトルとして使用）。APIはブロックを統一された `content` 配列にマッピングします（`paragraph` / `list_item` は `html` と `rawText`；リストHTMLは行ごとに `<li>…</li>` でクライアント側で1つの `<ul>` にまとめられる）。チャンク行はサーバー側のみ。 |
| **chunks**         | `paragraph` または `list_item` ブロック内の細粒度リッチテキスト用のオプション行（`text`、`bold`、`italic`）。`order_index` はそのブロック内のセグメントを順序付けします。使用しない場合、HTMLは `content_blocks.raw_text` / `text` のみで提供されることがあります。                                                                                                                                                                                                                                  |
| **quiz_questions** | チャプターのクイズ問題。`order_index` が表示順序を定義します。                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **quiz_options**   | 多肢選択肢。`option_id`（例："a"、"b"、"c"）はAPIと一致します。`is_correct` は検証のみに使用され、クライアントには公開されません。                                                                                                                                                                                                                                                                                                                                                                |


## 要件

コンテンツサービスは提供されたフレームワークのいずれかを使用して実装する必要があります。競技者はコンテンツサービスのみを実装します。メインバックエンドは提供されています。

**重要：** メインSkillShare Academy APIの仕様（`skillshare-academy-api.yaml`）からエンドポイントを**再実装しないでください**。その仕様はメインSSAバックエンド（ユーザー登録、ログイン、コース、登録、チャプター完了、メンターセッション）を定義しており、提供済みでこのモジュールのスコープ外です。

**コンテンツサービスURL：** コンテンツサービスは `https://cXX-YYYY-module-c.ssa.skillsit.hu`（`cXX` はユーザー名、`YYYY` はPINコード）で到達可能です。

**APIドキュメント：** コンテンツサービスのOpenAPI仕様は `assets` ディレクトリにあります：`[/assets/module-c/api/ssa-content-service-openapi.yaml](/assets/module-c/api/ssa-content-service-openapi.yaml)`。

**データベース：** コンテンツサービスのデータベースダンプが提供されます。その構造は上記の[データベース構造](#database-structure)セクションに記載されています。競技者はスキーマを**変更してはいけません**。採点前にデータベースは元の状態に復元されます。メインバックエンド（ユーザー、登録など）のダンプは参照用として `assets/db` に用意されていますが、コンテンツサービスには適用されません。

### エラーハンドリング

コンテンツサービスのエンドポイントはエラーを処理し、エラーメッセージを含むJSONオブジェクトと適切なHTTPステータスコードを返す必要があります：

- `400` Bad Request（不正なリクエスト）：リクエストが不正な形式か、必須フィールドが欠けています。
- `401` Unauthorized（未認証）：Bearerトークンが欠如、無効、または期限切れです。
- `403` Forbidden（アクセス拒否）：ユーザーがリクエストされたリソースへのアクセス権を持っていません（例：前のチャプターが未完了）。
- `404` Not Found（見つかりません）：リクエストされたコースまたはチャプター/モジュールが見つかりませんでした。
- `500` Internal Server Error（サーバー内部エラー）：予期しないエラーが発生しました。

### コンテンツサービスに実装するエンドポイント

#### コンテンツサービスAPIの一般規則

- レスポンスボディの例にはサンプルデータ構造が含まれています。コンテンツサービス自身のストレージからの動的データを使用してください。
- URLのプレースホルダーパラメーターは先行するコロンで示されます *（例：:id）*
- オブジェクト内のプロパティの順序は問いませんが、配列内の順序は重要です。
- レスポンスの `Content-Type` ヘッダーは、特に指定がない限り常に `application/json` です。
- 指定されたURLはコンテンツサービスのベース（例：`/api`）からの相対パスです。
- すべてのコンテンツエンドポイント（`health` チェックと `GET /api/courses` を除く）は `Authorization` ヘッダーに有効なBearerトークンが必要です。トークンはコンテンツサービスがローカルで検証する必要があります。

#### ヘルスチェック

##### GET /health

コンテンツサービスが動作していることを確認するためのシンプルなエンドポイント。認証不要。

**レスポンス：** 200 OK

```json
{
  "status": "ok",
  "timestamp": "2026-03-25T15:28:34.755Z",
  "version": "1.0.0"
}
```

---

#### コースカタログ

##### GET /api/courses

利用可能なすべてのコースのリストを取得し、各コースにはチャプターが順番に含まれます。認証不要。

**レスポンス：** 200 OK

```json
{
  "courses": [
    {
      "id": 1,
      "slug": "web-development-fundamentals",
      "title": "Web Development Fundamentals",
      "description": "Learn the basics of HTML, CSS, and JavaScript for modern web development",
      "difficulty": "beginner",
      "totalChapters": 6,
      "totalCredits": 26,
      "createdAt": "2026-03-25T15:27:42.530Z",
      "chapters": [
        {
          "id": 1,
          "title": "HTML Structure and Semantics",
          "credits": 4,
          "orderIndex": 1
        },
        {
          "id": 2,
          "title": "CSS Styling and Layout",
          "credits": 4,
          "orderIndex": 2
        }
      ]
    },
    {
      "id": 10,
      "slug": "cybersecurity-fundamentals",
      "title": "Cybersecurity Fundamentals",
      "description": "Essential security concepts and practices for modern applications",
      "difficulty": "intermediate",
      "totalChapters": 0,
      "totalCredits": 0,
      "createdAt": "2024-12-31T23:00:00.000Z",
      "chapters": []
    }
  ]
}
```

---

#### コース詳細

##### GET /api/courses/:slug

スラッグで特定のコースの詳細情報を取得します。認証済みユーザーの完了状態を含むチャプターのリストも含まれます。有効なBearerトークンが必要。

**注意：** コンテンツサービスはユーザーの進捗を追跡しません。`isCompleted` の値はメインバックエンドの `/users/me/completed-chapters` エンドポイントから取得する必要があります。

**レスポンス：** 200 OK

```json
{
  "course": {
    "id": 1,
    "slug": "web-development-fundamentals",
    "title": "Web Development Fundamentals",
    "description": "Learn the basics of HTML, CSS, and JavaScript for modern web development",
    "difficulty": "beginner",
    "totalChapters": 6,
    "totalCredits": 26,
    "createdAt": "2026-03-25T15:27:42.530Z",
    "chapters": [
      {
        "id": 1,
        "title": "HTML Structure and Semantics",
        "description": "Learn proper HTML document structure and semantic elements",
        "credits": 4,
        "isCompleted": true
      },
      {
        "id": 2,
        "title": "CSS Styling and Layout",
        "description": "Master CSS selectors, properties, and layout techniques",
        "credits": 4,
        "isCompleted": true
      },
      {
        "id": 3,
        "title": "JavaScript Basics",
        "description": "Variables, functions, and control structures in JavaScript",
        "credits": 5,
        "isCompleted": false
      }
    ]
  }
}
```

**レスポンス（コースが見つからない場合）：** 404 Not Found

```json
{
  "error": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

**レスポンス（トークンが欠如または無効の場合）：** 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**レスポンス（ユーザーがこのコースに登録していない場合）：** 403 Forbidden

```json
{
  "error": "Not enrolled in this course",
  "code": "NOT_ENROLLED"
}
```

**注意：** コンテンツサービスはユーザーの登録状態を追跡しません。登録情報はメインバックエンドの `/users/me/enrolled-courses` エンドポイントから取得する必要があります。

---

#### チャプター/モジュールコンテンツ

##### GET /api/courses/:slug/chapters/:chapterId

1つのチャプター（モジュール）の完全なコンテンツを返します：メタデータ、順序付きコンテンツ要素、クイズ。有効なBearerトークンが必要です（[認証と認可](#authentication-and-authorization)を参照）。

**シーケンシャルアクセス：** ユーザーはコース順序（チャプターの `orderIndex`）で前のチャプターを完了している必要があります。完了していない場合、`403` `CHAPTER_LOCKED` で応答します。`orderIndex` 1のチャプターは登録済みユーザーには常にアクセス可能です。ユーザーが登録しているかどうかはメインバックエンドによって決定されます。コンテンツサービスは他の保護されたルートと同じチェックを利用できます。

**レスポンス：** 200 OK

```json
{
  "courseId": 1,
  "chapterId": 2,
  "title": "CSS Styling and Layout",
  "description": "Master CSS selectors, properties, and layout techniques",
  "credits": 4,
  "content": [
    {
      "type": "h2",
      "orderIndex": 0,
      "text": "Introduction to CSS"
    },
    {
      "type": "paragraph",
      "orderIndex": 1,
      "html": "<p>CSS allows you <strong>to style</strong> HTML elements.</p>",
      "rawText": "CSS allows you to style HTML elements."
    },
    {
      "type": "image",
      "orderIndex": 2,
      "url": "https://content.example.com/images/css-selectors.png",
      "alt": "CSS selectors diagram"
    },
    {
      "type": "video",
      "orderIndex": 3,
      "url": "https://content.example.com/videos/css-intro.mp4",
      "title": "CSS Introduction"
    },
    {
      "type": "link",
      "orderIndex": 4,
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS",
      "title": "MDN CSS Documentation"
    }
  ],
  "quiz": {
    "questions": [
      {
        "id": 1,
        "text": "Which property is used to change the text color?",
        "options": [
          { "id": "a", "text": "color" },
          { "id": "b", "text": "text-color" },
          { "id": "c", "text": "font-color" }
        ]
      }
    ]
  }
}
```

**コンテンツ配列：** 各アイテムは `content_blocks.order_index`（各アイテムの `orderIndex` として公開）に従います。タイプはストレージとLMSのニーズを反映します：


| `type`                   | ソース / フィールド                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `h1`, `h2`, `h3`, `h4`   | `orderIndex`、`text`（ブロックの `text` カラムから）のプレーンな見出しテキスト。                                                                                                                 |
| `paragraph`, `list_item` | `orderIndex`、`html`（サーバー側で `chunks` からレンダリングのみ）、`content_blocks.raw_text` からの `rawText`（例：markdownソース；`null` の場合あり）。チャンク行はレスポンスに**含まれません**。 |
| `image`                  | `orderIndex`、`url`、`alt`（`url`、`img_alt` から）。                                                                                                                                            |
| `video`                  | `orderIndex`、`url`、`title`（例：`url` と `text` から）                                                                                                                                         |
| `link`                   | `orderIndex`、`url`、`title`                                                                                                                                                                     |


各クイズ問題の正解はこのレスポンスに**含めてはいけません**。クイズ検証エンドポイントでのみ使用されます。

**レスポンス（トークンが欠如または無効の場合）：** 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**レスポンス（コースまたはチャプターが見つからない場合）：** 404 Not Found

```json
{
  "error": "Chapter not found",
  "code": "CHAPTER_NOT_FOUND"
}
```

**レスポンス（ユーザーがこのコースに登録していない場合）：** 403 Forbidden

```json
{
  "error": "Not enrolled in this course",
  "code": "NOT_ENROLLED"
}
```

**レスポンス（前のチャプターが未完了の場合）：** 403 Forbidden

```json
{
  "error": "Previous chapter must be completed first",
  "code": "CHAPTER_LOCKED"
}
```

---

#### クイズ検証

##### POST /api/courses/:slug/chapters/:chapterId/quiz/validate

送信されたクイズの解答を検証します。メインバックエンドがこのエンドポイントを呼び出して学習者がクイズに合格したかを確認します。レスポンスは**すべて**の解答が正しいかどうかを示します。結果が合格（`passed: true`）の場合、**コンテンツサービス**はメインバックエンドのチャプター完了エンドポイント（`POST /courses/:id/chapters/:id/complete`）を呼び出して、チャプターが完了としてマークされ、クレジットが付与されるようにする必要があります。

**リクエストボディ：**

```json
{
  "answers": [
    { "questionId": 1, "selectedOptionId": "a" },
    { "questionId": 2, "selectedOptionId": "b" }
  ]
}
```

**レスポンス（すべて正解の場合）：** 200 OK

```json
{
  "passed": true
}
```

**レスポンス（1つ以上不正解の場合）：** 200 OK

```json
{
  "passed": false
}
```

**レスポンス（コースまたはチャプターが見つからない場合）：** 404 Not Found

```json
{
  "error": "Chapter not found",
  "code": "CHAPTER_NOT_FOUND"
}
```

---

#### コース管理


| メソッド | パス               | 認証                  |
| -------- | ------------------ | --------------------- |
| `POST`   | `/api/courses`     | Bearerトークン必須    |
| `PUT`    | `/api/courses/:id` | Bearerトークン必須    |


`:id` はコースの**数値主キー**（スラッグではありません）。

##### POST /api/courses

最初は**チャプターなし**で新しいコースを作成します（`totalChapters` と `totalCredits` は `0`；`chapters` は空の配列）。スラッグはユニークで**小文字、数字、ハイフン**のみ使用する必要があります（例：`new-course-slug`）。

**リクエストボディ：** `**title`** と `**slug**` を**トップレベル**のJSONプロパティとして送信します（`course` の中ではなく）。オプション：`description`、`difficulty`。  
レスポンスとの対称性のために、同じフィールドを `**course`** の下にネストすることもできます（例：`{ "course": { "title": "...", "slug": "..." } }`）。


| フィールド    | 必須 | 説明                                                                |
| ------------- | ---- | ------------------------------------------------------------------- |
| `title`       | はい | 空でない文字列                                                      |
| `slug`        | はい | ユニークなURLスラッグ（上記のパターン）                             |
| `description` | いいえ | 文字列または省略；`null` でも可                                   |
| `difficulty`  | いいえ | `beginner`、`intermediate`、`advanced` のいずれか（デフォルト：`beginner`） |


**リクエスト例（`Content-Type: application/json`）：**

```json
{
  "title": "New Course Title",
  "slug": "new-course-slug",
  "description": "Optional description",
  "difficulty": "beginner"
}
```

**レスポンス：** `201 Created`

```json
{
  "course": {
    "id": 98,
    "slug": "new-course-slug",
    "title": "New Course Title",
    "description": "Optional description",
    "difficulty": "beginner",
    "totalChapters": 0,
    "totalCredits": 0,
    "createdAt": "2025-01-15T12:00:00.000Z",
    "chapters": []
  }
}
```

**エラーレスポンス（例）：** `400`（`INVALID_COURSE_PAYLOAD`、`INVALID_COURSE_SLUG`）、`409`（`DUPLICATE_COURSE_SLUG`）。

---

##### PUT /api/courses/:id

指定された**数値id**のコースの1つ以上のメタデータフィールドを更新します。少なくとも1つのフィールドを指定する必要があります。

**リクエストボディ（任意のサブセット）：**


| フィールド    | 説明                                     |
| ------------- | ---------------------------------------- |
| `title`       | 空でない文字列                           |
| `slug`        | 新しいユニークなスラッグ（POSTと同じパターン） |
| `description` | 文字列または `null`                      |
| `difficulty`  | `beginner` \| `intermediate` \| `advanced` |


**リクエスト例（`Content-Type: application/json`）** - **少なくとも1つ**のフィールドを含めること；部分的な更新が可能：

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**別の例**（スラッグと難易度のみを変更）：

```json
{
  "slug": "web-dev-fundamentals-v2",
  "difficulty": "intermediate"
}
```

更新が成功すると、`totalChapters` と `totalCredits` は既存のチャプター行から**再計算**され、データベースと一致した状態に保たれます。

**レスポンス：** `200 OK`

```json
{
  "course": {
    "id": 1,
    "slug": "web-development-fundamentals",
    "title": "Updated Title",
    "description": "Updated description",
    "difficulty": "beginner",
    "totalChapters": 6,
    "totalCredits": 26,
    "createdAt": "2024-12-31T23:00:00.000Z",
    "chapters": []
  }
}
```

（レスポンスの `chapters` は `orderIndex` 順でチャプターのサマリーをリストします。`GET /api/courses` と同じ形式。）

**エラーレスポンス（例）：** `400`（`INVALID_ID_FORMAT`、`INVALID_COURSE_PAYLOAD`、`INVALID_COURSE_SLUG`、`INVALID_DIFFICULTY`）、`404`（`COURSE_NOT_FOUND`）、`409`（`DUPLICATE_COURSE_SLUG`）。

---

## 評価

モジュールCは、競技者が作成したコンテンツサービスに直接アクセスする自動化ツールを使用して評価されます。以下の側面が評価されます：

- **エンドポイントの正確性：** レスポンスが指定された構造、HTTPステータスコード、JSONフィールド名と一致していること
- **エラーハンドリング：** すべての定義されたエラーシナリオ（`400`、`401`、`403`、`404`、`500`）で正しいステータスコードとエラーコードが返されること
- **認証：** トークンがローカルで検証され、欠如、不正形式、または期限切れの場合に正しく拒否されること
- **シーケンシャルアクセス制御：** 前のチャプターが完了するまでチャプターがロックされること（`CHAPTER_LOCKED`）
- **コンテンツレンダリング：** リッチテキストチャンクがサーバー上で正しいHTMLに組み立てられること
- **クイズ検証：** 解答が正しく評価され、合格時にチャプター完了がメインバックエンドに通知されること
- **APIドキュメント準拠：** すべてのエンドポイントが `assets/api/ssa-content-service-openapi.yaml` のOpenAPI仕様に準拠していること

## 得点配分


| WSOS セクション | 説明                                   | 点数  |
| --------------- | -------------------------------------- | ----- |
| 1               | 作業の組織化と自己管理                 | 1     |
| 2               | コミュニケーションと対人スキル         | 3.25  |
| 3               | デザイン実装                           | 0     |
| 4               | フロントエンド開発                     | 0     |
| 5               | バックエンド開発                       | 25.75 |
| **合計**        |                                        | 30    |


