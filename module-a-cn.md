# 测试项目大纲 - 模块 A - 前端

## 比赛时长

参赛者有 **3 小时** 完成模块 A。

## 简介

模块 A 聚焦于实现一个**单页前端游戏**，无需后端，也不依赖外部服务。该游戏是面向 **SkillShare Academy**（一个高级 IT 学习平台）的经典贪吃蛇品牌化版本。

游戏必须使用你选择的 **JavaScript 框架**或 **原生 JavaScript（Vanilla JavaScript）**实现。

## 项目与任务总体说明

你的任务是实现 **"开发者的学习路径（The Developer's Learning Path）"**：一款贪吃蛇风格游戏。玩家需要引导 **Student** 在固定网格中移动，收集 **IT Skills** 来扩展自己的 **Knowledge Base**，同时避免 **Burnout** 和 **Spaghetti Code**。

### 术语说明

- **Student**：蛇头，代表玩家角色。
- **Knowledge Base**：蛇身（或尾巴），会随着玩家收集 IT Skills 而增长。
- **IT Skills**：玩家需要收集的道具，用于增长 Knowledge Base 并提高分数。
- **Burnout**：当 Student 撞墙时触发的游戏结束条件。
- **Spaghetti Code**：当 Student 与自己的 Knowledge Base 发生碰撞时触发的游戏结束条件。
- **Heads-Up Display**：棋盘上方显示的 3 项统计信息。

### 设计指南

资源文件中包含该游戏的**示例视频**。你不应照搬视频中的视觉设计。请将其视为线框参考：只遵循布局与元素结构，在符合 style-guide 的前提下做出有创意且独特的设计。

- 遵循所示的布局结构与组件位置。
- 应用 **SkillShare Academy** 的视觉方向。遵循 assets 文件夹中的 style-guide。请使用**深色**配色。
- 确保响应式布局：在常见分辨率（包括全高清）下，棋盘和控制区域必须可用且不出现不可用裁切；整体体验应在无需强制垂直滚动的情况下完整呈现。布局还需在较小视口下保持视觉适配且不破坏结构，但不要求触控滑动操作。
- 使用现代 UI/UX 实践；交互元素的对比度与焦点状态应对仅键盘操作的用户足够友好。

### 页面/视图

必须实现以下页面：

#### 开始界面

页面首次加载、首次运行前显示。该界面可实现为游戏棋盘上的模态框或覆盖层。

该视图必须包含：

- **标题**，需提及 **"The Developer's Learning Path"** 和 **SkillShare Academy**。
- **简要说明**：如何移动（**方向键** / **WASD**）、如何**暂停**（**Space**），以及 **IT Skills** 的含义。
- 主要按钮 **"Start Learning Path"**，点击后开始新一局：重置分数，放置初始 **Student** 与 **Knowledge Base**，生成一个 **IT Skill**，并启动游戏循环。

#### 游戏棋盘视图

游戏处于**进行中**或**暂停中**时的主视图。

该视图必须包含：

- 一个 20×20 单元格的游戏**网格**。
- 网格内清晰可区分的 **Student**、**Knowledge Base** 与当前 **IT Skill**。**IT Skills** 必须使用 assets 文件夹中提供的图标显示。
- 一个 **HUD（Heads-Up Display）**，展示 **Scoring** 部分定义的 3 项分数（**Certificates earned**、**Developer level**、**Best run**）。请用用户友好的方式在 UI 中说明 HUD 的计算方式。

在**暂停**状态下，游戏必须显示一个说明当前已暂停并提供 **Resume** 的**模态框或覆盖层**。暂停时游戏不得继续推进。

#### 游戏结束界面

当一局因 **Burnout** 或 **Spaghetti Code** 结束时显示。该界面可实现为游戏棋盘上的模态框或覆盖层。

该视图必须包含：

- 明确标注的**死亡原因**：**Burnout**（撞墙）或 **Spaghetti Code**（自撞），并简要解释其在本游戏语境下的含义。
- **最终分数**：本局结束时的 **Certificates earned** 与 **Developer level**。
- 主要按钮 **"Start new learning path"**，点击后立即按与开始界面相同的规则开启新一局。

### 计分

游戏过程中，HUD 必须显示以下 3 项分数：

1. **Certificates earned**：当前局分数（当前局收集到的 **IT Skills** 数量）。
2. **Developer level**：根据当前 **Certificates earned** 计算得到的等级数值。计算公式为 `level = 1 + floor(certificates / 2)`（每获得 2 个 certificates，等级提升 1 级，初始为 1 级）。
3. **Best run**：个人历史最高 **certificates** 分数，需在页面刷新后仍然保留。

## 游戏机制与实现要求

游戏必须遵循以下机制与规则：

- **Grid**：游戏区域为 **20×20** 网格。每个格子可为空，或被 **Student**、一段 **Knowledge Base**、或一个 **IT Skill** 占据（同一时刻每格只能有其中一种）。
- **Initial game state**：每局开始时，**Student** 从网格中心、朝右方向起始，**Knowledge Base** 初始长度为 2，并在随机空格生成 1 个随机 **IT Skill**。
- **Movement and game speed**：当游戏处于活动状态（未暂停且未结束）时，**Student** 会按当前方向自动移动（仅可上、下、左、右）。玩家可通过键盘（方向键和 WASD）改变 **Student** 的方向，但蛇会持续自动前进。随着玩家收集更多技能，移动速度必须提高，但应保持可玩性（例如不能快到难以控制）。
- **Illegal reversal（非法反向）**：玩家**不能**立刻反向。例如蛇正在向右移动时，不能立即改为向左，至少需要先进行一次其他方向的移动。
- **Keyboard controls**：使用 **方向键** 和 **WASD** 改变方向；使用 **Space** 进行**暂停**和**继续**。
- **IT Skills**：当 **Student** 进入包含 **IT Skill** 的格子时，该道具被吃掉，分数增加，**Knowledge Base** 增长 1 段，并在随机空格生成新的随机 **IT Skill**。可用技能见 assets 文件夹。
- **Collisions（碰撞）**：
  - **Burnout**：若 **Student** 移出网格边界（撞墙）→ **Game Over**，原因为 **Burnout**。
  - **Spaghetti Code**：若 **Student** 移动到已被 **Knowledge Base** 占据的格子（自撞）→ **Game Over**，原因为 **Spaghetti Code**。
- **HUD**：顶部栏中的 **3** 项统计（**Certificates earned**、**Developer level**、**Best run**）必须与 **Scoring** 部分一致。
- **Best run**：最佳成绩（单局最高 **certificates**）必须在页面刷新后**持久化保存**，并在应用加载时恢复。
- **Paused state**：在**暂停**时，游戏在任何方面都不得推进。玩家应可在不丢失进度或分数的情况下继续游戏。

### 动效与动画

请加入与游戏事件关联的动画，让交互更有反馈、更有目的性。  
**示例**（可根据设计实现其中任意子集）：

- 收集 **IT Skill** 时的**脉冲**或**缩放**动画
- 一局因 **Burnout** 结束时的**抖动**、**闪烁**或**边框脉冲**
- **Pause**、**Game Over** 或 **Start** 覆盖层的**平滑淡入** / **透明度** / **背景遮罩**过渡
- 控件在聚焦或悬停时的**过渡效果**。

你不需要实现所有动画，但游戏应整体表现得动态且能对玩家操作及时响应。至少需要实现一种动画类型。

## 评估

模块 A 将使用 Google Chrome 进行评测。评测内容包括功能行为、视觉设计、动画表现、可玩性和代码质量。
