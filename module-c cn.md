# 测试项目概要 - 模块 C - REST API

## 竞赛时间

选手将有 **3 小时** 完成本模块。

## 简介

SkillShare Academy（SSA）是一个学习平台，用户可以报名课程、完成章节以获得学分，并预约导师课程。此前，系统由以下部分组成：

- SSA 主后端
- SSA 仪表盘前端
- 一个**简化版**内容服务后端。

内容服务只能由主后端访问，并向其提供基础的课程和章节数据。主后端为 SSA 仪表盘前端暴露接口，用户可以在其中注册、登录、报名课程并预约导师课程。此前无法从仪表盘**查看课程内容**，只会显示一个标题为 **Continue Learning** 的**禁用**按钮，并且没有通往课程或测验的路由。

在模块 D 中，将实现一个用于展示课程内容的**独立站点**（LMS 站点）。  
本 C 模块重点是构建一个**更完善的内容服务**，以支持丰富的学习内容和测验。它将可以公开访问，并且会**与主后端共享认证与授权系统**。  
用户管理、报名、学分和导师课程仍由主后端负责，不属于本模块范围。

提供的 SkillShare Academy 主后端已经被修改，以匹配新的结构。它包含一些新的端点（例如章节完成、课程报名），也移除了一些端点（例如获取课程），而大多数现有端点保持不变。

内容服务用于存储并提供 LMS 内容，包括课程、章节、富文本、媒体和测验。访问控制通过与主后端共享的认证和授权系统完成。

## 项目和任务概述

选手需要实现内容服务，使其能够与 LMS 站点（模块 D）无缝协作。以下是主要任务的高层概述；详细规范见 [需求](#需求) 部分：

- 实现认证与授权系统
- 实现错误处理
- 验证已认证用户是否有权限访问指定课程或章节
- 提供课程详情
- 解析内容元素
- 提供章节内容和测验
- 评估测验
- 将章节完成情况通知主后端

本模块提供一个功能完整的**主后端**，地址为 `https://cXX-YYYY-main-backend.ssa.skillsit.hu`，其中 `cXX` 是分配给你的用户名，`YYYY` 是你的 PIN 码。你可以在 `[/assets/module-c/api/ssa-main-backend-openapi.yaml](/assets/module-c/api/ssa-main-backend-openapi.yaml)` 中找到主后端所有端点的 OpenAPI 格式参考。

### 认证与授权

内容服务使用基于主后端的认证与授权系统。用户在 SkillShare Academy 主平台上完成认证；主后端登录端点签发一个**已签名的 Bearer token**，随后内容服务也使用该 token。

**测试：** 在提供的主后端和仪表盘中，**所有用户共享同一个密码：** `password123`。你可以用它进行手动测试，例如使用 **[alice@example.com](mailto:alice@example.com)** / **password123** 登录，以获得 Bearer token，或测试报名和章节流程。

token 遵循类似 JWT 的结构：

`header.payload.signature`

其中：

- `header` 是 Base64URL 编码的 JSON 对象，
- `payload` 是 Base64URL 编码的 JSON 对象，
- `signature` 使用 **HMAC-SHA256** 和一个**共享密钥**，根据已编码的 header 和 payload 生成。

**共享密钥：** 提供的主后端使用以下共享密钥；内容服务必须使用完全相同的 UTF-8 字符串值：

`38344ac35d91bfd0c8f43963b0ca188d2a039504e825ff968b0366855bdbca5b`

payload 至少必须包含：

- `sub`：用户 ID
- `exp`：过期时间戳

**Token 有效期：** 主后端签发的 token 会在签发后 **60 秒**过期。`exp` 声明是反映该时间的 Unix 时间戳；你的内容服务和任何手动测试都必须据此处理这种短生命周期 token。

**长效测试 token（约 7 天）：** 为了避免反复登录进行测试，你可以使用这个预签发的 Bearer token，它属于 **[alice@example.com](mailto:alice@example.com)**（payload subject 为 `1`）。它从签发时起大约**七天**内有效（见 `exp`）。

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IlNTQSJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzc1MTYyNzA0fQ.xGCNwuEthwy6iGWkS8FkCk5Wm9VYV7cLF41T6CLl_b0
```

可在 `Authorization: Bearer <token>` 中使用它，或在打开 LMS 时通过 `?token=<token>` 使用。正常的仪表盘登录仍会签发 **60 秒** token；该 token 仅用于开发和手动测试便利。

**提示：** 手动 API 和集成测试建议使用 **Tailwind CSS & ShadCN UI Tutorial** 课程，slug 为 **`tailwind-css-shadcn-ui-tutorial`**。它在种子数据中拥有最丰富的章节内容（多种块类型、媒体、列表和测验），因此最适合端到端验证解析、顺序访问和测验流程。如有需要，请通过仪表盘将 **[alice@example.com](mailto:alice@example.com)** 报名到该课程。

内容服务需要在每个受保护请求上本地验证 token：

1. token 必须存在，并且结构正确。
2. 签名必须有效。
3. token 不能过期。
4. 如果 token 有效，则可以处理该请求。
5. 如果 token 缺失、格式错误、无效或已过期，则必须拒绝该请求（`401 Unauthorized`）。

内容服务必须本地验证这些 token。

**参考：** `[/assets/module-c/handouts/handout-hmac-sha256-token-signing.md](/assets/module-c/handouts/handout-hmac-sha256-token-signing.md)`（使用 HMAC-SHA256 对 `header.payload.signature` 进行签名和验证）。

不得使用外部认证库或 JWT 库进行 token 验证。

### 内容仓库和用户流程

- 用户必须先报名某门课程，才能访问其内容。
- 内容被组织为章节（模块）。用户按顺序推进：只有完成前一个模块后，下一个模块才会开放。
- 每个模块以一个简短的多选测验结束。用户必须正确回答所有问题才能完成该模块。

### 模块结构

每个学习模块包含：

- **标题**
- **图片**
- **内容**
- **测验**

### 内容

内容由以下类型的内容块按不同组合构成：

- h1、h2、h3、h4 标题
- 段落
- 列表项
- 图片
- 视频
- 链接

内容块**存储在数据库**的 `content_blocks` 表中。每个内容块是一行，包含以下字段：

| 字段        | 类型                                                            | 描述                                  |
| ----------- | --------------------------------------------------------------- | ------------------------------------- |
| id          | integer                                                         | 主键                                  |
| chapter_id  | integer                                                         | 引用章节的外键                        |
| type        | enum (h1, h2, h3, h4, paragraph, list_item, image, video, link) | 内容块类型                            |
| order_index | integer                                                         | 在章节中的显示顺序                    |
| text        | string                                                          | 标题文本（h1-h4）或段落标签           |
| img_alt     | string                                                          | 图片替代文本                          |
| url         | string                                                          | 图片、视频或链接块的 URL              |
| raw_text    | longtext                                                        | 段落块的原始富文本内容                |

**示例：** 一个包含四个内容块的章节（顺序由 `order_index` 保留）：

| id  | chapter_id | type      | order_index | text              | img_alt                         | url                                                                                                            | raw_text |
| --- | ---------- | --------- | ----------- | ----------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | 3          | h1        | 1           | Introduction      | NULL                            | NULL                                                                                                           | NULL     |
| 2   | 3          | paragraph | 2           | NULL              | NULL                            | NULL                                                                                                           | `[...]`  |
| 3   | 3          | image     | 3           | NULL              | HTML document structure diagram | [https://content.example.com/images/html-structure.png](https://content.example.com/images/html-structure.png) | NULL     |
| 4   | 3          | link      | 4           | MDN Documentation | NULL                            | [https://developer.mozilla.org/en-US/docs/Web/HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)         | NULL     |

### 段落富文本格式

富文本段落**存储在数据库**的独立 `chunks` 表中。每个 chunk 是一行，包含以下字段：

| 字段   | 类型    | 描述                 |
| ------ | ------- | -------------------- |
| text   | string  | 文本内容             |
| bold   | boolean | 文本是否加粗         |
| italic | boolean | 文本是否斜体         |

通过 API 返回时，这些内容会被解析为 HTML，因此前端会收到可直接展示的 HTML。

**示例：** 数据库中存储的两个 chunk（顺序由 `orderIndex` 保留）：

| orderIndex | text              | bold  | italic |
| ---------- | ----------------- | ----- | ------ |
| 1          | "CSS allows you " | false | false  |
| 2          | "to style"        | true  | false  |

解析为 HTML：`<p>CSS allows you <strong>to style</strong></p>`。

### 提供该内容的端点

章节学习内容（块、渲染后的富文本、媒体和章节测验）由内容服务作为单个响应返回：

| Method | Path                                     | Auth             |
| ------ | ---------------------------------------- | ---------------- |
| `GET`  | `/api/courses/:slug/chapters/:chapterId` | 需要 Bearer token |

**行为（摘要）：**

- 加载请求章节的所有 `content_blocks`，按 `order_index` 排序。
- `h1`-`h4`：标题文本来自 `text`（以及需要的相关字段）。
- `paragraph` / `list_item`：富文本在服务端由关联的 `chunks` 行组装；API 暴露 `type` 为 `paragraph` 或 `list_item`，并返回 `html` 和 `rawText`（来自 `raw_text`），与下面的响应 schema 保持一致。chunk 行不会在 JSON 中返回。
- `image`、`video`、`link`：使用 `url`、图片的 `img_alt`，以及适用时的视频/链接标题。
- 同一响应还会包含章节**测验**和元数据（例如学分），以满足 LMS 的需求。

顺序访问（前一章节已完成）、报名、完整 JSON 示例和错误码（`404`、`403` 等）在 **[章节/模块内容](#章节模块内容)** 中说明。

### 内容服务需求

内容服务必须提供主后端所需的所有端点，以服务课程目录、模块内容和测验验证。主后端（SkillShare Academy API）负责用户管理、报名、完成进度跟踪、学分和导师课程，选手**不需要**实现这些端点。

### 数据库结构

内容服务使用自己的数据库来存储课程、章节、内容和测验。将提供一个**数据库转储**；选手**不得**更改结构。评分前数据库会恢复到原始状态。

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

#### 表说明

| 表                 | 描述                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **courses**        | 课程目录。`slug` 是唯一的（URL 片段）。`difficulty`：`beginner`、`intermediate`、`advanced`。`total_chapters` 和 `total_credits` 是存储列（维护为与章节数据一致）。                                                                                                                                                                                                |
| **chapters**       | 课程内的学习模块。`order_index` 定义顺序。每个章节都有内容块和测验。                                                                                                                                                                                                                                                                                              |
| **content_blocks** | 按章节顺序排列的内容元素（`order_index`）。`type`：`h1`-`h4`、`paragraph`、`list_item`、`image`、`video`、`link`。列包括 `text`、`img_alt`、`url`、`raw_text`（用途取决于 `type`；例如图片使用 `url` + `img_alt`；链接/视频使用 `text` 作为标签/标题）。API 将块映射到统一的 `content` 数组（`paragraph` / `list_item` 带有 `html` 和 `rawText`；列表 HTML 每行是 `<li>…</li>`，客户端会合并为一个 `<ul>`）。chunk 行仅在服务端使用。 |
| **chunks**         | `paragraph` 或 `list_item` 块内用于细粒度富文本的可选行（`text`、`bold`、`italic`）。`order_index` 对该块内的片段排序。如果未使用，HTML 可以仅由 `content_blocks.raw_text` / `text` 提供。                                                                                                                                                                        |
| **quiz_questions** | 章节的测验问题。`order_index` 定义显示顺序。                                                                                                                                                                                                                                                                                                                     |
| **quiz_options**   | 多选题选项。`option_id`（例如 "a"、"b"、"c"）与 API 匹配。`is_correct` 仅用于验证，绝不能暴露给客户端。                                                                                                                                                                                                                                                          |

## 需求

内容服务应使用提供的框架之一实现。选手只实现内容服务；主后端已提供。

**重要：** 不要重新实现 SkillShare Academy 主 API 规范（`skillshare-academy-api.yaml`）中的任何端点。该规范定义的是主 SSA 后端，包括用户注册、登录、课程、报名、章节完成、导师课程等，这些都已提供，且不属于本模块范围。

**内容服务 URL：** 内容服务将通过 `https://cXX-YYYY-module-c.ssa.skillsit.hu` 访问，其中 `cXX` 是你的用户名，`YYYY` 是你的 PIN 码。

**API 文档：** 内容服务的 OpenAPI 规范位于 `assets` 目录：`[/assets/module-c/api/ssa-content-service-openapi.yaml](/assets/module-c/api/ssa-content-service-openapi.yaml)`。

**数据库：** 将提供内容服务的数据库转储；其结构在上方 [数据库结构](#数据库结构) 部分描述。选手**不得**修改 schema。评分前数据库会恢复到原始状态。主后端（用户、报名等）的转储仅作为参考位于 `assets/db`，不适用于内容服务。

### 错误处理

内容服务端点必须处理错误，并返回合适的 HTTP 状态码以及包含错误消息的 JSON 对象：

- `400` Bad Request：请求格式错误或缺少必需字段。
- `401` Unauthorized：Bearer token 缺失、无效或已过期。
- `403` Forbidden：用户无权访问请求的资源（例如前一章节未完成）。
- `404` Not Found：请求的课程或章节/模块未找到。
- `500` Internal Server Error：发生意外错误。

### 内容服务需要实现的端点

#### 内容服务 API 通用规则

- 示例响应体包含示例数据结构。应使用内容服务自身存储中的动态数据。
- URL 中的占位参数以前置冒号标记（例如 :id）。
- 对象中属性的顺序无关紧要，但数组中的顺序有意义。
- 除非另有说明，响应的 `Content-Type` header 始终为 `application/json`。
- 给定的 URL 都是相对于内容服务 base 的路径（例如 `/api`）。
- 所有内容端点（除 `health` 检查和 `GET /api/courses` 外）都要求在 `Authorization` header 中提供有效的 Bearer token。该 token 必须由内容服务本地验证。

#### 健康检查

##### GET /health

用于验证内容服务正在运行的简单端点。无需认证。

**响应：** 200 OK

```json
{
  "status": "ok",
  "timestamp": "2026-03-25T15:28:34.755Z",
  "version": "1.0.0"
}
```

---

#### 课程目录

##### GET /api/courses

获取所有可用课程列表，每门课程都包含按顺序排列的章节。无需认证。

**响应：** 200 OK

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

#### 课程详情

##### GET /api/courses/:slug

根据 slug 获取指定课程的详细信息，包括章节列表以及已认证用户的完成状态。需要有效的 Bearer token。

**注意：** 内容服务不跟踪用户进度；`isCompleted` 值必须通过主后端的 `/users/me/completed-chapters` 端点获取。

**响应：** 200 OK

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

**响应（课程未找到时）：** 404 Not Found

```json
{
  "error": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

**响应（token 缺失或无效时）：** 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**响应（用户未报名该课程时）：** 403 Forbidden

```json
{
  "error": "Not enrolled in this course",
  "code": "NOT_ENROLLED"
}
```

**注意：** 内容服务不跟踪用户报名信息；用户报名值必须通过主后端的 `/users/me/enrolled-courses` 端点获取。

---

#### 章节/模块内容

##### GET /api/courses/:slug/chapters/:chapterId

返回一个章节（模块）的完整内容：元数据、有序内容元素和测验。需要有效的 Bearer token（见 [认证与授权](#认证与授权)）。

**顺序访问：** 用户必须已完成课程顺序中的前一章节（章节上的 `orderIndex`）。否则，返回 `403` `CHAPTER_LOCKED`。`orderIndex` 为 1 的章节对已报名用户始终可访问。用户是否已报名由主后端决定；内容服务可以依赖与其他受保护路由相同的检查。

**响应：** 200 OK

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

**Content 数组：** 项目遵循 `content_blocks.order_index`（在每个项目上暴露为 `orderIndex`）。类型与存储和 LMS 需求一致：

| `type`                   | 来源 / 字段                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `h1`, `h2`, `h3`, `h4`   | `orderIndex`，`text` 中的纯标题文本（来自块的 `text` 列）。                                                                                                        |
| `paragraph`, `list_item` | `orderIndex`，`html`（仅在服务端由 `chunks` 渲染），`rawText` 来自 `content_blocks.raw_text`（例如 markdown 源；可以为 `null`）。chunk 行**不会**包含在响应中。 |
| `image`                  | `orderIndex`，`url`，`alt`（来自 `url`、`img_alt`）。                                                                                                              |
| `video`                  | `orderIndex`，`url`，`title`（例如来自 `url` 和 `text`）。                                                                                                         |
| `link`                   | `orderIndex`，`url`，`title`                                                                                                                                       |

每个测验问题的正确答案**不得**出现在此响应中；它只由测验验证端点使用。

**响应（token 缺失或无效时）：** 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**响应（课程或章节未找到时）：** 404 Not Found

```json
{
  "error": "Chapter not found",
  "code": "CHAPTER_NOT_FOUND"
}
```

**响应（用户未报名该课程时）：** 403 Forbidden

```json
{
  "error": "Not enrolled in this course",
  "code": "NOT_ENROLLED"
}
```

**响应（前一章节未完成时）：** 403 Forbidden

```json
{
  "error": "Previous chapter must be completed first",
  "code": "CHAPTER_LOCKED"
}
```

---

#### 测验验证

##### POST /api/courses/:slug/chapters/:chapterId/quiz/validate

验证提交的测验答案。主后端调用此端点来确认学习者是否通过测验；响应会指示是否**所有**答案都正确。当结果为通过（`passed: true`）时，**内容服务**必须调用主后端的章节完成端点 `POST /courses/:id/chapters/:id/complete`，以便将章节标记为完成并授予学分。

**请求体：**

```json
{
  "answers": [
    { "questionId": 1, "selectedOptionId": "a" },
    { "questionId": 2, "selectedOptionId": "b" }
  ]
}
```

**响应（全部正确）：** 200 OK

```json
{
  "passed": true
}
```

**响应（一个或多个错误）：** 200 OK

```json
{
  "passed": false
}
```

**响应（课程或章节未找到时）：** 404 Not Found

```json
{
  "error": "Chapter not found",
  "code": "CHAPTER_NOT_FOUND"
}
```

---

#### 课程管理

| Method | Path               | Auth             |
| ------ | ------------------ | ---------------- |
| `POST` | `/api/courses`     | 需要 Bearer token |
| `PUT`  | `/api/courses/:id` | 需要 Bearer token |

`:id` 是课程的**数字主键**（不是 slug）。

##### POST /api/courses

创建一门初始时**没有章节**的新课程（`totalChapters` 和 `totalCredits` 为 `0`；`chapters` 为空数组）。slug 必须唯一，并且只能使用**小写字母、数字和连字符**（例如 `new-course-slug`）。

**请求体：** 将 `title` 和 `slug` 作为**顶层** JSON 属性发送（不要放在 `course` 内）。可选：`description`、`difficulty`。  
为了与响应保持对称，也可以将相同字段嵌套在 `course` 下（例如 `{ "course": { "title": "...", "slug": "..." } }`）。

| 字段          | 必需 | 描述                                                          |
| ------------- | ---- | ------------------------------------------------------------- |
| `title`       | yes  | 非空字符串                                                    |
| `slug`        | yes  | 唯一 URL slug（模式同上）                                     |
| `description` | no   | 字符串或省略；可以为 `null`                                   |
| `difficulty`  | no   | `beginner`、`intermediate`、`advanced` 之一（默认：`beginner`） |

**请求示例（`Content-Type: application/json`）：**

```json
{
  "title": "New Course Title",
  "slug": "new-course-slug",
  "description": "Optional description",
  "difficulty": "beginner"
}
```

**响应：** `201 Created`

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

**错误响应（示例）：** `400`（`INVALID_COURSE_PAYLOAD`、`INVALID_COURSE_SLUG`），`409`（`DUPLICATE_COURSE_SLUG`）。

---

##### PUT /api/courses/:id

更新给定**数字 id** 的课程上的一个或多个元数据字段。必须至少提供一个字段。

**请求体（任意子集）：**

| 字段          | 描述                                      |
| ------------- | ----------------------------------------- |
| `title`       | 非空字符串                                |
| `slug`        | 新的唯一 slug（模式同 POST）              |
| `description` | 字符串或 `null`                           |
| `difficulty`  | `beginner` / `intermediate` / `advanced`  |

**请求示例（`Content-Type: application/json`）** - 至少包含**一个**字段；允许部分更新：

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**另一个示例**（仅更改 slug 和 difficulty）：

```json
{
  "slug": "web-dev-fundamentals-v2",
  "difficulty": "intermediate"
}
```

成功更新后，`totalChapters` 和 `totalCredits` 会根据现有章节行**重新计算**，以确保它们与数据库保持一致。

**响应：** `200 OK`

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

（响应中的 `chapters` 会以 `orderIndex` 顺序列出章节摘要，结构与 `GET /api/courses` 相同。）

**错误响应（示例）：** `400`（`INVALID_ID_FORMAT`、`INVALID_COURSE_PAYLOAD`、`INVALID_COURSE_SLUG`、`INVALID_DIFFICULTY`），`404`（`COURSE_NOT_FOUND`），`409`（`DUPLICATE_COURSE_SLUG`）。

---

## 评分

模块 C 将使用自动化工具进行评分，这些工具会直接访问选手创建的内容服务。以下方面将被评估：

- **端点正确性：** 响应匹配指定结构、HTTP 状态码和 JSON 字段名
- **错误处理：** 对所有已定义错误场景（`400`、`401`、`403`、`404`、`500`）返回正确状态码和错误码
- **认证：** token 在本地验证，并在缺失、格式错误或过期时被正确拒绝
- **顺序访问控制：** 在前一章节完成前，章节保持锁定（`CHAPTER_LOCKED`）
- **内容渲染：** 富文本 chunk 在服务端组装为正确的 HTML
- **测验验证：** 正确评估答案，并在通过时通知主后端完成章节
- **API 文档合规性：** 所有端点都遵循 `assets/api/ssa-content-service-openapi.yaml` 中的 OpenAPI 规范

## 分数分布

| WSOS SECTION | 描述                         | 分数  |
| ------------ | ---------------------------- | ----- |
| 1            | 工作组织和自我管理           | 1     |
| 2            | 沟通和人际交往技能           | 3.25  |
| 3            | 设计实现                     | 0     |
| 4            | 前端开发                     | 0     |
| 5            | 后端开发                     | 25.75 |
| **Total**    |                              | 30    |
