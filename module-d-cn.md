# 测试项目概要 - 模块 D - LMS 前端（学习站点）

## 竞赛时间

选手将有 **3 小时** 完成本模块。

## 简介

模块 D 重点是为 **SkillShare Academy 内容服务**实现一个前端，即一个独立的 **LMS（学习）站点**。已报名的学习者可以在该站点打开课程，按顺序学习章节，阅读丰富的课程内容，并完成每章末尾的测验。

## 项目和任务概述

SkillShare Academy（SSA）使用一个**主后端**处理账号、报名、学分和章节完成状态，并使用一个**内容服务**存储和提供课程元数据、章节内容块、媒体和测验。**模块 D** 只是与**内容服务**通信的**浏览器应用**。

内容服务和主后端均已提供。LMS 必须使用学习者在 SkillShare Academy 主平台（仪表盘）登录时获得的**同一个 Bearer token**。通常，仪表盘会在查询字符串中携带 **token** 打开 LMS；LMS 前端存储该 token，并在后续 API 调用中使用它。**Token 有效期：** 主后端签发的 token 会在登录后 **60 秒**过期；过期后应预期收到 `401 Unauthorized`，直到用户在仪表盘重新登录。

### 仪表盘和 LMS URL

一个完整可用的 **SSA 仪表盘**应用已提供，用于评分和开发。它部署在：

`https://cXX-YYYY-dashboard.ssa.skillsit.hu`

（使用你的竞赛 `cXX` 用户名和 `YYYY` PIN。）

**测试：** 所有种子用户在仪表盘登录时都使用密码 `password123`（例如 **[alice@example.com](mailto:alice@example.com)** / **password123**），用于开发和测试。

**长效测试 token（约 7 天）：** 为了在开发时避免仪表盘登录 token 的 **60 秒**过期限制，你可以使用这个属于 **[alice@example.com](mailto:alice@example.com)** 的 Bearer token（与模块 C 相同）。将 `?token=` 加上该 token 追加到你的 LMS URL，或按你的应用预期方式存储它（例如 `localStorage`）。

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IlNTQSJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzc4NjUxNjI5fQ.SupdoOSna89QLZejnwZMHTUqsS7lPC_OWvY3Q7_RXIU
```

**提示：** 开发和 UI 测试建议打开 **Tailwind CSS & ShadCN UI Tutorial** 课程，路径为 **`/courses/tailwind-css-shadcn-ui-tutorial`**。它在种子数据中拥有最丰富的课程内容（标题、段落、列表、图片、视频、链接、测验），因此最适合测试每种内容块和布局规则。如果 **[alice@example.com](mailto:alice@example.com)** 尚未报名该课程，请在仪表盘中为她报名。

默认情况下，仪表盘到 LMS 的**所有导航**都会指向选手已**部署**的 LMS 前端：

`https://cXX-YYYY-module-d.ssa.skillsit.hu`

**本地开发：** 若要使用**同一个仪表盘**访问**本地运行**的 LMS（例如 Vite 在 `http://localhost:5173`），请在浏览器的 **localStorage** 中（仪表盘源下）将 **`lmsSiteUrl`** 条目设置为你的开发 LMS 基础 URL（末尾不带斜杠）。仪表盘会使用该值，使“open course / continue learning”链接跳转到你的开发站点，而不是默认部署的 LMS。删除或重置 `lmsSiteUrl` 即可恢复默认行为。

**与模块 C 的关系：** 模块 C 定义并实现**内容服务** API 和数据模型。模块 D 仅消费**该 API** 来完成所有必需的 LMS 行为（课程详情、章节内容、测验验证）。主后端仍然处理账号和完成状态记录，但 **LMS 前端不得调用主后端的 HTTP API**；需要时由内容服务与主后端协调（例如测验通过时）。

**内容服务的基础 URL：** `https://cXX-YYYY-module-c-solution.ssa.skillsit.hu`，其中 `cXX` 是你的用户名，`YYYY` 是你的 PIN 码（确切模式见模块 C handout）。

**API 文档：** 内容服务的 OpenAPI 规范位于 `assets` 目录：[`/assets/module-c/api/ssa-content-service-openapi.yaml`](/assets/module-c/api/ssa-content-service-openapi.yaml)。它是 LMS 必须调用的所有端点的参考。

**数据库：** 选手**不能**直接访问内容服务数据库。Schema 和行为由 API 文档定义。

你必须使用 JavaScript **框架**实现前端。应用必须是一个**单页应用（SPA）**。**路由必须由框架处理。** 重新加载一个深链接 URL 时，应显示用户在应用内导航到该地址时会看到的同一视图（在从存储恢复认证状态后），但未保存的用户输入除外。

## 需求

此前端的目标是通过内容服务 API，为学习者提供一个清晰的界面，用于学习课程材料并完成测验。

前端必须实现以下功能需求：

- 针对相关 HTTP 状态码的错误处理（见 [错误处理](#错误处理)）
- 如果内容服务返回 **`401 Unauthorized`**（任何请求：loader、测验提交等），**将浏览器重定向到 SSA 主仪表盘**，以便用户重新登录；见 [错误处理](#错误处理) 中的 `401` 规则
- 使用本地存储持久化 token，以便跨刷新保留
- 课程页面，包含顺序章节访问和完成状态
- 章节页面，渲染所有必需的内容块类型和章节测验

### 设计指南

handout 包含 **SkillShare Academy（SSA）设计指南**和**图形设计资源**（参考图片），覆盖课程页面和章节页面。选手必须遵循设计指南，并尽可能接近提供的视觉稿（布局、层级、间距、颜色和字体规范，以及组件处理方式）。

如果设计指南未覆盖某个细节（例如特定内容块或错误状态），应延续相同模式，使 UI 保持一致。实现必须在不同屏幕尺寸上保持**响应式**，包括下文章节页面所描述的视频布局。

### 错误处理

内容服务可能返回多种错误。前端必须处理这些错误，并显示**易理解**的消息（不要显示原始堆栈跟踪）。至少处理：

- `400 Bad Request` - 请求格式错误；简要告知用户。
- `401 Unauthorized` - token 缺失、无效或已过期。**将用户重定向到 SSA 主仪表盘应用**（使用 [仪表盘和 LMS URL](#仪表盘和-lms-url) 中的仪表盘基础 URL，例如 `https://cXX-YYYY-dashboard.ssa.skillsit.hu`，通常是应用根路径或 handout 中给出的入口点）。必须使用**整页导航**（`window.location` 或等价方式），让用户离开 LMS 并重新认证。同时，在处理前或处理过程中清除已存储的 LMS token。不要只在 LMS 中以内联错误形式让用户停留在当前页面。
- `403 Forbidden` - 用户无权访问该资源（例如章节被锁定）；说明该章节尚不可用。
- `404 Not Found` - 课程或章节未找到；告知用户内容不可用。
- `500 Internal Server Error` - 服务器错误；告知用户出现临时问题。

测验验证可能返回应用特定的 payload（例如测验已通过，但章节完成状态无法同步到主平台）。UI 必须按照 OpenAPI / 模块 C 文档中的说明展示这些情况。

### 页面

必须实现以下视图（确切路径名可遵循参考实现）：

#### 课程页面（`/courses/:slug`）

通过 `GET /api/courses/:slug` 加载课程详情，并携带 `Authorization: Bearer <token>`。

页面必须包含：

- **课程头部：** 标题、描述、难度、总章节数、总学分（均按 API 返回）。
- **Hero / 图片：** 从 SSA bucket 获取 hero 图片：`https://bucket.ssa.skillsit.hu/<slug>.webp`（将 `<slug>` 替换为 API 返回的课程 slug）。
- **章节列表：** 按顺序列出所有章节，每项包含标题、简短描述、学分和**已完成**状态。
- **顺序访问：** 只有第一章，或其**前一章**已完成的章节是**解锁**的（链接到章节）。锁定章节必须清晰标示，并且**不得**导航到章节视图。
- **已完成章节**必须有视觉区分（例如徽章或样式）。

#### 章节页面（`/courses/:slug/chapters/:chapterId`）

通过 `GET /api/courses/:slug/chapters/:chapterId` 加载章节内容（需要 Bearer）。

**`content` 数组（课程正文）：** JSON body 是单个**章节 payload**（不是包在外层 `chapter` 对象中）：见 [`/assets/module-c/api/ssa-content-service-openapi.yaml`](/assets/module-c/api/ssa-content-service-openapi.yaml) 中的 schema `ChapterContentResponse`。除了元数据（`courseId`、`chapterId`、`title`、可选 `description`、`credits`）和 `quiz` 外，字段 **`content`** 是一个**有序的学习块列表**。

- 每个项目都是一个通过 **`type`** 区分的对象，并带有 **`orderIndex`**，用于定义章节内的显示顺序（升序排序）。
- 允许的 **`type`** 值对应已存储的内容块：**`h1`**、**`h2`**、**`h3`**、**`h4`**、**`paragraph`**、**`list_item`**、**`image`**、**`video`**、**`link`**。
- **标题**（`h1`-`h4`）通过 **`text`** 暴露标题文本。
- **`paragraph`** 和 **`list_item`**：服务端会组装富文本；客户端收到可直接嵌入的 **`html`**。**`rawText`** 可能作为源表示存在；展示时应使用 **`html`**。对于 **`list_item`**，每个数组元素通常是一行列表；**`html`** 通常是类似 `<li>…</li>` 的片段，见下方渲染规则。
- **`image`**：**`url`** 和 **`alt`**。
- **`video`**：**`url`** 和 **`title`**（title 可能为空）。
- **`link`**：**`url`** 和 **`title`**（锚点标签）。

同一响应中的 **`quiz`** 对象包含章节末尾的多选题；它与 **`content`** 分离。

页面必须包含：

- **粘性章节栏：** 实现一个**粘性**子标题栏，在学习者滚动课程时保持可见。在**同一行**中包含：(1) 返回父课程页面（`/courses/:slug`）的 **Back to course** 链接，以及 (2) 打开目录抽屉的**按钮**。**不要**只把 TOC 控件放在全局站点头部；它属于这个粘性栏中，与 **Back to course** 并列。视觉参考：[`chapter-page-light-with-toc.png`](/assets/module-d/design/chapter-page-light-with-toc.png)、[`chapter-page-dark-with-toc.png`](/assets/module-d/design/chapter-page-dark-with-toc.png)。
- **目录（抽屉）：** 按钮打开一个标题为 **Contents** 的**抽屉**（从侧边滑出的面板）。从章节 **`content`** 数组填充它：包含所有 **`type`** 为 **`h1`**、**`h2`** 或 **`h3`** 的块，按 **`orderIndex`** 升序排列，并使用每个块的 **`text`**。显示**标题层级**（例如将 **`h2`** 缩进到 **`h1`** 下，将 **`h3`** 缩进到 **`h2`** 下）。每个条目必须是一个**导航控件**，用于滚动或移动焦点到课程正文中的对应标题。**`h4`** 标题会在正文中渲染，但**不**列入 TOC。
- **头部：** 章节标题、可选描述、学分，以及 API 响应中适当的课程/章节标识（位于粘性栏下方，如参考布局所示）。
- **课程内容：** 按 **`orderIndex`** 顺序渲染 `content` 数组。支持的块类型：
  - **标题** `h1`-`h4`：使用 API 返回的纯文本。
  - **段落：** 渲染服务端提供的 HTML；使用适合阅读的正文样式。
  - **列表项：** 连续的 `list_item` 行必须合并为**单个** `<ul>`；每个项目的 `html` 通常是一个 `<li>…</li>`。
  - **图片：** 使用带有 `url` 和 `alt` 的 `<img>`；若存在 `alt`，使用它作为说明文字。
  - **视频：** 使用 `<video controls playsInline>`，其 `src` 来自 `url`。如果存在**标题**，在**桌面端**宽度（例如约 900px 起）将播放器布局为约占行宽的 **2/3**，标题（以及可选标签）约占 **1/3**；在较小屏幕上，**堆叠**为视频在上、文本在下。
  - **链接：** 外部链接使用 `rel="nofollow noopener noreferrer"` 和 `target="_blank"`。

- **测验：** 如果章节定义了问题：
  - 显示每个问题及其**单选**选项（每题一个选择）。
  - 只有在**所有**问题都已回答时才允许**提交**。
  - 按 OpenAPI 指定，将答案 `POST` 到 `.../quiz/validate`。
  - 对通过、未通过、错误和特殊情况（例如测验通过但完成状态同步失败）显示清晰反馈。
  - 成功完成后，**刷新**课程/章节状态，使课程页面反映更新后的完成状态（例如重新获取数据或触发路由重新验证）。

#### 布局与主题

- **Header：** logo 或标题链接到**仪表盘**首页 URL；链接到**仪表盘课程**（使用 [仪表盘和 LMS URL](#仪表盘和-lms-url) 中相同的仪表盘基础 URL，例如 `https://cXX-YYYY-dashboard.ssa.skillsit.hu`）；深色/浅色主题切换保存在 `localStorage`。
- **主题切换：** 应用必须同时支持**深色主题**（默认）和**浅色主题**。两种主题都在 SSA 样式指南（`assets/style-guide/ssa-style-guide.md`）中定义。当前主题必须持久化到 `localStorage`，以便页面刷新后恢复用户偏好。打开页面时不应出现主题颜色闪烁。
- 当存在 token 时，显示用户已**登录**（例如 "Signed in"）；从主后端加载用户的**姓名**是**可选**的。
- **加载：** 导航或请求较慢时显示可见的加载状态。

## 评分

模块 D 将使用提供版本的 **Google Chrome** 进行评分。评分包括**功能**行为和**用户体验**（清晰度、响应式、错误处理）。

**重要：** 选手只能使用 OpenAPI 中指定的**已记录内容服务**端点。修改提供的后端或数据库不属于前端评分范围。

## 分数分布

| WSOS SECTION | 描述                         | 分数 |
| ------------ | ---------------------------- | ---- |
| 1            | 工作组织和自我管理           | 1    |
| 2            | 沟通和人际交往技能           | 2    |
| 3            | 设计实现                     | 0    |
| 4            | 前端开发                     | 28   |
| 5            | 后端开发                     | 0    |
| **Total**    |                              | 31   |
