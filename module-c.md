# Test Project Outline - Module C - REST API

## Competition time

Competitors will have **3 hours** to complete this module.

## Introduction

SkillShare Academy (SSA) is a learning platform where users enroll in courses, complete chapters to earn credits, and book mentor sessions. Previously, the system consisted of:

- SSA main backend
- SSA dashboard frontend
- a **simplified** content service backend.

The content service was accessible only from the main backend and supplied it with basic course and chapter data. The main backend exposed endpoints for the SSA dashboard frontend, where users could sign up, log in, enroll in courses, and book mentor sessions. **Viewing course content was not possible** from the dashboard-only a **disabled** button titled **Continue Learning** was shown, with no route to lessons or quizzes.

In Module D, a **separate site** (LMS site) for displaying course content will be implemented.  
This C module focuses on building a **more sophisticated content service** that supports rich learning content and quizzes. It will be publicly accessible and will **share an authentication and authorization system with the main backend**.  
User management, enrollment, credits, and mentor sessions remain in the main backend and are out of scope of this module.

The provided SkillShare Academy main backend has already been modified to align with the new structure. It includes a few new endpoints (e.g. chapter completion, course enrollment) and removes a few others (e.g. get courses), while most existing endpoints remain unchanged.

The content service stores and serves LMS content - courses, chapters, rich text, media, and quizzes. Access is controlled through an authentication and authorization system shared with the main backend.

## General Description of Project and Tasks

Competitors will implement the content service so that it works seamlessly with the LMS site (Module D). The following is a high-level overview of the main tasks; detailed specifications are in the [Requirements](#requirements) section:

- implement the authentication and authorization system
- implement error handling
- validate whether the authenticated user has permission to access a specific course or chapter
- serve course details
- parse content elements
- serve chapter contents and quizzes
- evaluate quizzes
- notify the main backend about chapter completion

A fully functional **main backend** is provided for this module at `https://cXX-YYYY-main-backend.ssa.skillsit.hu`, where `cXX` is your assigned username and `YYYY` is your PIN code. You can find the reference of all endpoints of the main backend in OpenAPI format in `[/assets/module-c/api/ssa-main-backend-openapi.yaml](/assets/module-c/api/ssa-main-backend-openapi.yaml)`.

### Authentication and Authorization

The content service uses an authentication and authorization system based on the main backend. Users authenticate on the main SkillShare Academy platform; the main backend login endpoint issues a **signed Bearer token**, which is then also used by the content service.

**Testing:** In the provided main backend and dashboard, **all users share the same password:** `password123`. You can use this for manual testing—for example, sign in with **[alice@example.com](mailto:alice@example.com)** / **password123** to obtain a Bearer token or exercise enrollment and chapter flows.

The token follows a JWT-like structure:

`header.payload.signature`

Where:

- `header` is a Base64URL-encoded JSON object,
- `payload` is a Base64URL-encoded JSON object,
- `signature` is generated from the encoded header and payload using **HMAC-SHA256** and a **shared secret**.

**Shared secret:** The following shared secret is used by the provided main backend; the content service must use exactly the same UTF-8 string value:

`38344ac35d91bfd0c8f43963b0ca188d2a039504e825ff968b0366855bdbca5b`

The payload must contain at least:

- `sub`: the user ID
- `exp`: expiration timestamp

**Token lifetime:** Tokens issued by the main backend expire **60 seconds** after they are issued. The `exp` claim is a Unix timestamp reflecting that time; your content service and any manual testing must treat short-lived tokens accordingly.

**Long-lived test token (~7 days):** For testing without repeated login, you can use this pre-issued Bearer token for **alice@example.com** (payload subject `1`). It is valid for approximately **seven days** from issuance (see `exp`).

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IlNTQSJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzc4NjUxNjI5fQ.SupdoOSna89QLZejnwZMHTUqsS7lPC_OWvY3Q7_RXIU
```

Use it in `Authorization: Bearer <token>` or when opening the LMS with `?token=<token>`. Normal dashboard login still issues **60-second** tokens; this token is only for development and manual testing convenience.

**Hint:** For manual API and integration testing, we recommend using the **Tailwind CSS & ShadCN UI Tutorial** course—slug **`tailwind-css-shadcn-ui-tutorial`**. It has the richest chapter content in the seed data (many block types, media, lists, and quizzes), so it is the best place to verify parsing, sequential access, and quiz flows end to end. Enroll **alice@example.com** in that course via the dashboard if needed.

The content service validates the token locally on every protected request:

1. The token must be present and have the correct structure.
2. The signature must be valid.
3. The token must not be expired.
4. If the token is valid, the request may be served.
5. If the token is missing, malformed, invalid, or expired, the request must be refused (`401 Unauthorized`).

The content service must validate these tokens locally.

**Reference:** `[/assets/module-c/handouts/handout-hmac-sha256-token-signing.md](/assets/module-c/handouts/handout-hmac-sha256-token-signing.md)` (signing and verifying `header.payload.signature` with HMAC-SHA256).

External authentication or JWT libraries must **not** be used for token validation.

### Content Repository and User Flow

- Users must be enrolled in a course before they can access its content.
- Content is structured into chapters (modules). Users proceed sequentially: the next module becomes available only after the previous one is completed.
- Each module ends with a short multiple-choice quiz. Users must answer all questions correctly to complete the module.

### Module Structure

Each learning module consists of:

- **Title**
- **Image**
- **Content**
- **Quiz**

### Content

Content is composed of the following types of content blocks in various combinations:

- h1, h2, h3, h4 header
- Paragraph
- ListItem
- Image
- Video
- Link

Content blocks are **stored in the database** in the `content_blocks` table. Each content block is a row with the following fields:

| Field       | Type                                                            | Description                                |
| ----------- | --------------------------------------------------------------- | ------------------------------------------ |
| id          | integer                                                         | Primary key                                |
| chapter_id  | integer                                                         | Foreign key referencing the chapter        |
| type        | enum (h1, h2, h3, h4, paragraph, list_item, image, video, link) | The type of content block                  |
| order_index | integer                                                         | Display order within the chapter           |
| text        | string                                                          | Heading text (h1-h4) or paragraph label    |
| img_alt     | string                                                          | Alt text for images                        |
| url         | string                                                          | URL for image, video, or link blocks       |
| raw_text    | longtext                                                        | Raw rich text content for paragraph blocks |

**Example:** A chapter with four content blocks (order preserved by `order_index`):

| id  | chapter_id | type      | order_index | text              | img_alt                         | url                                                                                                            | raw_text |
| --- | ---------- | --------- | ----------- | ----------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | 3          | h1        | 1           | Introduction      | NULL                            | NULL                                                                                                           | NULL     |
| 2   | 3          | paragraph | 2           | NULL              | NULL                            | NULL                                                                                                           | `[...]`  |
| 3   | 3          | image     | 3           | NULL              | HTML document structure diagram | [https://content.example.com/images/html-structure.png](https://content.example.com/images/html-structure.png) | NULL     |
| 4   | 3          | link      | 4           | MDN Documentation | NULL                            | [https://developer.mozilla.org/en-US/docs/Web/HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)         | NULL     |

### Paragraph Rich Text Format

Rich text paragraphs are **stored in the database** in a separate `chunks` table. Each chunk is a row with the following fields:

| Field  | Type    | Description                |
| ------ | ------- | -------------------------- |
| text   | string  | The text content           |
| bold   | boolean | Whether the text is bold   |
| italic | boolean | Whether the text is italic |

When returned via the API, these are parsed to HTML, so the frontend receives HTML ready for display.

**Example:** Two chunks stored in the database (order preserved by `orderIndex`):

| orderIndex | text              | bold  | italic |
| ---------- | ----------------- | ----- | ------ |
| 1          | "CSS allows you " | false | false  |
| 2          | "to style"        | true  | false  |

Parsed to HTML: `<p>CSS allows you <strong>to style</strong></p>`.

### Endpoint that serves this content

Chapter learning content (blocks, rendered rich text, media, and the chapter quiz) is returned by the content service as a single response:

| Method | Path                                     | Auth                  |
| ------ | ---------------------------------------- | --------------------- |
| `GET`  | `/api/courses/:slug/chapters/:chapterId` | Bearer token required |

**Behaviour (summary):**

- Loads all `content_blocks` for the requested chapter, ordered by `order_index`.
- `**h1`-`h4`:\*\* heading text from `text` (and related fields as needed).
- `**paragraph` / `list_item`:\*\* rich text is assembled from the linked `chunks` rows (see above) on the server; the API exposes `type` `paragraph` or `list_item`, `html`, and `rawText` (from `raw_text`), consistent with the response schema below. Chunk rows are not returned in the JSON.
- `**image`, `video`, `link`:\*\* use `url`, `img_alt` for images, and titles for video/link where applicable.
- The same response includes the chapter **quiz** and metadata (e.g. credits), as required by the LMS.

Sequential access (previous chapter completed), enrollment, full JSON examples, and error codes (`404`, `403`, etc.) are specified under **[Chapter/Module Content](#chaptermodule-content)**.

### Content Service Requirements

The content service must provide all endpoints required by the main backend to serve course catalog, module content, and quiz validation. The main backend (SkillShare Academy API) handles user management, enrollment, completion tracking, credits, and mentor sessions - competitors do **not** implement those endpoints.

### Database Structure

The content service uses its own database to store courses, chapters, content, and quizzes. A **database dump will be provided**; competitors must **not** change the structure. The database will be restored to the original state before marking.

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

#### Table Descriptions

| Table              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **courses**        | Course catalog. `slug` is unique (URL segment). `difficulty`: `beginner`, `intermediate`, `advanced`. `total_chapters` and `total_credits` are stored columns (maintained to match chapter data).                                                                                                                                                                                                                                                                                                  |
| **chapters**       | Learning modules within a course. `order_index` defines sequence. Each chapter has content blocks and a quiz.                                                                                                                                                                                                                                                                                                                                                                                      |
| **content_blocks** | Content elements in chapter order (`order_index`). `type`: `h1`-`h4`, `paragraph`, `list_item`, `image`, `video`, `link`. Columns include `text`, `img_alt`, `url`, `raw_text` (use depends on `type`; e.g. images use `url` + `img_alt`; link/video use `text` as label/title). The API maps blocks to a unified `content` array (`paragraph` / `list_item` with `html` and `rawText`; list HTML is `<li>…</li>` per row, merged into one `<ul>` in the client). Chunk rows are server-side only. |
| **chunks**         | Optional rows for fine-grained rich text inside a `paragraph` or `list_item` block (`text`, `bold`, `italic`). `order_index` orders segments within that block. If not used, HTML may be supplied only via `content_blocks.raw_text` / `text`.                                                                                                                                                                                                                                                     |
| **quiz_questions** | Quiz questions for a chapter. `order_index` defines display order.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **quiz_options**   | Multiple-choice options. `option_id` (e.g. "a", "b", "c") matches the API. `is_correct` is used only for validation; never exposed to clients.                                                                                                                                                                                                                                                                                                                                                     |

## Requirements

The content service shall be implemented using one of the provided frameworks. Competitors implement only the content service; the main backend is provided.

**Important:** Do **not** reimplement any endpoints from the main SkillShare Academy API specification (`skillshare-academy-api.yaml`). That specification defines the main SSA backend - user registration, login, courses, enrollment, chapter completion, mentor sessions - which is provided and out of scope for this module.

**Content Service URL:** The content service will be reachable at `https://cXX-YYYY-module-c.ssa.skillsit.hu` where `cXX` is your username and `YYYY` is your PIN code.

**API Documentation:** OpenAPI specification for the content service is available in the `assets` directory: `[/assets/module-c/api/ssa-content-service-openapi.yaml](/assets/module-c/api/ssa-content-service-openapi.yaml)`.

**Database:** A database dump for the content service will be provided; its structure is described in the [Database Structure](#database-structure) section above. Competitors must **not** modify the schema. The database will be restored to the original state before marking. A dump for the main backend (users, enrollments, etc.) is available in `assets/db` for reference only; it does not apply to the content service.

### Error Handling

The content service endpoints must handle errors and return the appropriate HTTP status code with a JSON object containing an error message:

- `400` Bad Request: The request is malformed or missing required fields.
- `401` Unauthorized: The Bearer token is missing, invalid, or expired.
- `403` Forbidden: The user is not allowed to access the requested resource (e.g. previous chapter not completed).
- `404` Not Found: The requested course or chapter/module was not found.
- `500` Internal Server Error: An unexpected error occurred.

### Endpoints to be implemented on the content service

#### General rules for the content service API

- The example response bodies contain example data structures. Dynamic data from the content service's own storage should be used.
- Placeholder parameters in the URL are marked with a preceding colon _(e.g. :id)_
- The order of properties in objects does not matter, but the order in an array does.
- The `Content-Type` header of a response is always `application/json` unless specified otherwise.
- The given URLs are relative to the content service base (e.g. `/api`).
- All content endpoints (except `health` check and `GET /api/courses`) require a valid Bearer token in the `Authorization` header. The token must be validated locally by the content service.

#### Health Check

##### GET /health

A simple endpoint to verify that the content service is running. No authentication required.

**Response:** 200 OK

```json
{
  "status": "ok",
  "timestamp": "2026-03-25T15:28:34.755Z",
  "version": "1.0.0"
}
```

---

#### Course Catalog

##### GET /api/courses

Get a list of all available courses, each including its chapters in sequential order. No authentication required.

**Response:** 200 OK

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

#### Course Details

##### GET /api/courses/:slug

Get detailed information about a specific course by its slug, including the list of chapters with the authenticated user's completion status. Requires a valid Bearer token.

**Note:** The content service does not track user progress; `isCompleted` values must be fetched from the main backend using the `/users/me/completed-chapters` endpoint.

**Response:** 200 OK

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

**Response (if course not found):** 404 Not Found

```json
{
  "error": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

**Response (if token is missing or invalid):** 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**Response (if user is not enrolled in this course):** 403 Forbidden

```json
{
  "error": "Not enrolled in this course",
  "code": "NOT_ENROLLED"
}
```

**Note:** The content service does not track user enrollment; the user enrollment values must be fetched from the main backend using the `/users/me/enrolled-courses` endpoint.

---

#### Chapter/Module Content

##### GET /api/courses/:slug/chapters/:chapterId

Returns the full content of one chapter (module): metadata, ordered content elements, and the quiz. Requires a valid Bearer token (see [Authentication and Authorization](#authentication-and-authorization)).

**Sequential access:** The user must have completed the previous chapter in course order (`orderIndex` on the chapter). If not, respond with `403` `CHAPTER_LOCKED`. Chapter `orderIndex` 1 is always reachable for enrolled users. Whether the user is enrolled is determined by the main backend; the content service may rely on the same checks as for other protected routes.

**Response:** 200 OK

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

**Content array:** Items follow `content_blocks.order_index` (exposed as `orderIndex` on each item). Types mirror storage and LMS needs:

| `type`                   | Source / fields                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `h1`, `h2`, `h3`, `h4`   | `orderIndex`, plain heading text in `text` (from the block's `text` column).                                                                                                                     |
| `paragraph`, `list_item` | `orderIndex`, `html` (rendered from `chunks` server-side only), `rawText` from `content_blocks.raw_text` (e.g. markdown source; may be `null`). Chunk rows are **not** included in the response. |
| `image`                  | `orderIndex`, `url`, `alt` (from `url`, `img_alt`).                                                                                                                                              |
| `video`                  | `orderIndex`, `url`, `title` (e.g. from `url` and `text`).                                                                                                                                       |
| `link`                   | `orderIndex`, `url`, `title`                                                                                                                                                                     |

The correct answer for each quiz question must **not** appear in this response; it is used only by the quiz validation endpoint.

**Response (if token is missing or invalid):** 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**Response (if course or chapter not found):** 404 Not Found

```json
{
  "error": "Chapter not found",
  "code": "CHAPTER_NOT_FOUND"
}
```

**Response (if user is not enrolled in this course):** 403 Forbidden

```json
{
  "error": "Not enrolled in this course",
  "code": "NOT_ENROLLED"
}
```

**Response (if previous chapter not completed):** 403 Forbidden

```json
{
  "error": "Previous chapter must be completed first",
  "code": "CHAPTER_LOCKED"
}
```

---

#### Quiz Validation

##### POST /api/courses/:slug/chapters/:chapterId/quiz/validate

Validates submitted quiz answers. The main backend invokes this endpoint to verify whether the learner passed the quiz; the response indicates whether **all** answers are correct. When the result is a pass (`passed: true`), the **content service** must call the main backend's chapter-completion endpoint - `POST /courses/:id/chapters/:id/complete` - so the chapter is marked complete and credits are awarded.

**Request Body:**

```json
{
  "answers": [
    { "questionId": 1, "selectedOptionId": "a" },
    { "questionId": 2, "selectedOptionId": "b" }
  ]
}
```

**Response (all correct):** 200 OK

```json
{
  "passed": true
}
```

**Response (one or more incorrect):** 200 OK

```json
{
  "passed": false
}
```

**Response (if course or chapter not found):** 404 Not Found

```json
{
  "error": "Chapter not found",
  "code": "CHAPTER_NOT_FOUND"
}
```

---

#### Course administration

| Method | Path               | Auth                  |
| ------ | ------------------ | --------------------- |
| `POST` | `/api/courses`     | Bearer token required |
| `PUT`  | `/api/courses/:id` | Bearer token required |

`:id` is the course **numeric primary key** (not the slug).

##### POST /api/courses

Creates a new course with **no chapters** initially (`totalChapters` and `totalCredits` are `0`; `chapters` is an empty array). The slug must be unique and use only **lowercase letters, digits, and hyphens** (e.g. `new-course-slug`).

**Request body:** send `**title`** and `**slug**` as **top-level** JSON properties (not inside `course`). Optional: `description`, `difficulty`.  
You may also nest the same fields under `**course`** (e.g. `{ "course": { "title": "...", "slug": "..." } }`) for symmetry with the response.

| Field         | Required | Description                                                         |
| ------------- | -------- | ------------------------------------------------------------------- |
| `title`       | yes      | Non-empty string                                                    |
| `slug`        | yes      | Unique URL slug (pattern as above)                                  |
| `description` | no       | String or omit; may be `null`                                       |
| `difficulty`  | no       | One of `beginner`, `intermediate`, `advanced` (default: `beginner`) |

**Request example (`Content-Type: application/json`):**

```json
{
  "title": "New Course Title",
  "slug": "new-course-slug",
  "description": "Optional description",
  "difficulty": "beginner"
}
```

**Response:** `201 Created`

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

**Error responses (examples):** `400` (`INVALID_COURSE_PAYLOAD`, `INVALID_COURSE_SLUG`), `409` (`DUPLICATE_COURSE_SLUG`).

---

##### PUT /api/courses/:id

Updates one or more metadata fields on the course with the given **numeric id**. At least one field must be supplied.

**Request body (any subset):**

| Field         | Description                            |
| ------------- | -------------------------------------- | -------------- | ---------- |
| `title`       | Non-empty string                       |
| `slug`        | New unique slug (same pattern as POST) |
| `description` | String or `null`                       |
| `difficulty`  | `beginner`                             | `intermediate` | `advanced` |

**Request example (`Content-Type: application/json`)** - include **at least one** field; partial updates are allowed:

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Another example** (change slug and difficulty only):

```json
{
  "slug": "web-dev-fundamentals-v2",
  "difficulty": "intermediate"
}
```

After a successful update, `totalChapters` and `totalCredits` are **recomputed** from existing chapter rows so they stay consistent with the database.

**Response:** `200 OK`

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

(`chapters` in the response lists chapter summaries in `orderIndex` order, same shape as `GET /api/courses`.)

**Error responses (examples):** `400` (`INVALID_ID_FORMAT`, `INVALID_COURSE_PAYLOAD`, `INVALID_COURSE_SLUG`, `INVALID_DIFFICULTY`), `404` (`COURSE_NOT_FOUND`), `409` (`DUPLICATE_COURSE_SLUG`).

---

## Assessment

Module C will be assessed using automated tools that directly access the content service created by competitors. The following aspects will be evaluated:

- **Endpoint correctness:** responses match the specified structure, HTTP status codes, and JSON field names
- **Error handling:** correct status codes and error codes are returned for all defined error scenarios (`400`, `401`, `403`, `404`, `500`)
- **Authentication:** tokens are validated locally and correctly rejected when missing, malformed, or expired
- **Sequential access control:** chapters are locked (`CHAPTER_LOCKED`) until the previous chapter is completed
- **Content rendering:** rich text chunks are assembled into correct HTML on the server
- **Quiz validation:** answers are evaluated correctly and chapter completion is notified to the main backend on pass
- **API documentation compliance:** all endpoints adhere to the OpenAPI specification in `assets/api/ssa-content-service-openapi.yaml`

## Mark distribution

| WSOS SECTION | Description                            | Points |
| ------------ | -------------------------------------- | ------ |
| 1            | Work organization and self-management  | 1      |
| 2            | Communication and interpersonal skills | 3.25   |
| 3            | Design Implementation                  | 0      |
| 4            | Front-End Development                  | 0      |
| 5            | Back-End Development                   | 25.75  |
| **Total**    |                                        | 30     |
