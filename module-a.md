# Test Project Outline - Module A - Frontend

## Competition time

Competitors will have **3 hours** to complete Module A.

## Introduction

Module A focuses on the implementation of a **single-page frontend game** with no backend and no external services. The game is a branded version of the classic Snake game for **SkillShare Academy** - an advanced IT learning platform.

The game must be implemented using a **JavaScript framework of your choice** or **Vanilla JavaScript**.

## General Description of Project and Tasks

Your task is to implement **"The Developer's Learning Path"** - a Snake-style game in which the player guides a **Student** across a fixed grid, collects **IT Skills** to grow their **Knowledge Base**, while avoiding **Burnout** and **Spaghetti Code**.

### Terminology

- **Student**: The snake's head, representing the player character.
- **Knowledge Base**: The snake's body (or tail), which grows as the player collects IT Skills
- **IT Skills**: The items the player collects to grow their Knowledge Base and increase their score.
- **Burnout**: Game over condition when the Student hits the wall.
- **Spaghetti Code**: Game over condition when the Student collides with its own Knowledge Base.
- **Heads-Up Display**: Three statistics item above the board.

### Design Guidelines

An **example video** of the game is included in the assets. You should not copy the design seen in the video. Think of it as a wireframe; only follow the layout and elements, you should come up with a creative and unique design, while following the style-guide.

- Follow the layout structure and component placement shown.
- Apply the **SkillShare Academy** visual direction. Follow the style-guide you find in the assets folder. Please use the **dark** colors.
- Ensure responsive layout: on common resolutions (including full HD), the board and controls must remain usable without unusable clipping; the entire experience should fit without mandatory vertical scrolling. The layout must adapt visually on smaller viewports without breaking, but touch-swipe controls are not required.
- Use modern UI/UX practices; contrast and focus states for interactive elements should be sensible for keyboard-only use.

### Screens/Views

The following screens must be implemented:

#### Start Screen

Shown before the first run upon page load. The screen may be implemented as a modal or overlay on top of the game board.

The view must contain:

- **Title** referencing **"The Developer's Learning Path"** and **SkillShare Academy**.
- **Short instructions**: how to move (**Arrow keys** / **WASD**), how to **pause** (**Space**), and what **IT Skills** represent.
- A primary button **"Start Learning Path"** that begins a new run: resets score, places initial **Student** and **Knowledge Base**, spawns an **IT Skill**, and starts the game loop.

#### Game Board View

The main play state while the game is **playing** or **paused**.

The view must contain:

- The game **grid** of 20×20 cells.
- The **Student**, **Knowledge Base**, and current **IT Skill** inside the grid, clearly distinguishable. **IT Skills** should be displayed using the icons provided in the assets folder.
- A **heads-up display (HUD)** showing the three scores defined in the **Scoring** section (**Certificates earned**, **Developer level**, **Best run**). Please in a user friendly way display on the UI how the HUD is calculated!

While **paused**, the game must show a **modal or overlay** explaining that the game is paused and offering **Resume**. The game must not advance while paused.

#### Game Over Screen

Displayed when the run ends due to **Burnout** or **Spaghetti Code**. The screen may be implemented as a modal or overlay on top of the game board.

The view must contain:

- **Cause of death** explicitly labeled: **Burnout** (hitting a wall) vs **Spaghetti Code** (self-collision), with a short explanation of what that means in the context of the game.
- **Final score** - **Certificates earned** and **Developer level** at the end of the run.
- A primary button **"Start new learning path"** that immediately starts a fresh run with the same rules as the Start Screen.

### Scoring

Three scores must be displayed on the heads-up display (HUD) during the game:

1. **Certificates earned**: current run score (number of **IT Skills** collected in the current run).
2. **Developer level**: a level-up style number computed from the current **Certificates earned** score. Calculated as `level = 1 + floor(certificates / 2)` (each two certificates earned raises the level by one, starting at level 1).
3. **Best run**: personal best **certificates** score, persisted across page reloads.

## Game Mechanics and Implementation Requirements

The game must follow these mechanics and rules:

- **Grid**: The playfield is a **20×20** grid of cells. Each cell can be empty or occupied by the **Student**, a segment of the **Knowledge Base**, or an **IT Skill** (only one of these per cell at a time).
- **Initial game state**: At the start of each run, the **Student** starts in the center of the grid facing right, with a **Knowledge Base** of length 2, and one random **IT Skill** spawns in a random empty cell.
- **Movement and game speed**: While the game is active (not paused or game over), the **Student** moves automatically in the current direction (only up, down, left, or right). The player can change the **Student**'s direction using keyboard controls (arrows and WASD), but the snake moves forward on its own. The speed of movement must increase as the player collects more skills, but it must be reasonable for playability (e.g. not too fast to control).
- **Illegal reversal:** The player **cannot** reverse direction immediately. For example, if the snake is moving right, the player must not be able to change direction to left until at least one move in a different direction has been made.
- **Keyboard controls:** **Arrow keys** and **WASD** keys to change direction; **Space** to **pause** and **resume**.
- **IT Skills:** When the **Student** enters the cell containing an **IT Skill**, it is consumed, the score increases, the **Knowledge Base** grows by one segment, and a new random **IT Skill** appears at a random empty cell. The skills available are provided for you in the assets folder.
- **Collisions:**
  - **Burnout:** If the **Student** moves outside the grid bounds (hits the walls of the grid) → **Game Over**, reason **Burnout**.
  - **Spaghetti Code:** If the **Student** moves into a cell already occupied by the **Knowledge Base** (the player collides with itself) → **Game Over**, reason **Spaghetti Code**.
- **HUD:** The **three** top-bar statistics (**Certificates earned**, **Developer level**, **Best run**) must match the **Scoring** section.
- **Best run:** The best run value (highest **certificates** in a single run) must be **persisted across page reloads** and restored when the app loads.
- **Paused state:** While **paused**, the game must not advance in any way. The player should be able to resume the game without losing progress or score.

### Motion and animation

Include some animations tied to game events so interactions feel deliberate.  
**Examples** (implement any subset that fits your design):

- A **pulse** or **scale** animation when an **IT Skill** is collected
- A **shake**, **flash**, or **border pulse** when a run ends in **Burnout**
- **smooth fade-in** / **opacity** or **backdrop** transitions for **Pause**, **Game Over**, or **Start** overlays
- **transitions** on focused or hovered controls.

You do NOT have to implement all animations, but the game should feel dynamic and responsive to player actions. At least one type of animation should be implemented.

## Assessment

Module A will be assessed using Google Chrome. Assessment will include functional behavior, visual design, animations, playability, and code quality.
