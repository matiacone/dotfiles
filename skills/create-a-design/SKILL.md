---
name: create-a-design
description: Create visual UI designs in Pencil (.pen files) with three radically different drafts. Use when the user wants to design a screen, page, app, dashboard, website, or any visual interface in Pencil. Triggers on "design a screen", "create a design", "mockup", "wireframe", or any request to build UI in a .pen file.
---

This skill creates visual designs in Pencil .pen files. You will interview the user, then produce three radically different design drafts for them to choose from and iterate on.

## Process

### 1. Ask

Ask the user for a long, detailed description of what they want designed and any initial ideas for how it should look or work.

### 2. Explore

Explore the repo to verify their assertions and understand the current state:

- Read relevant components, routes, and data models to understand what already exists
- Check for existing .pen files or design systems in the project
- Understand the data that will populate this design

If there is an existing .pen file:
- Use `get_editor_state` to understand the current canvas
- Use `batch_get` to discover existing components and design system elements
- Use `get_variables` to understand the current theme/variables

### 3. Interview

Interview the user relentlessly about every aspect of this design until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

- Ask one targeted question at a time.
- Prefer concrete examples over abstract prompts.
- Surface hidden dependencies early.
- Challenge ambiguity until requirements are testable.

Areas to cover (as relevant):
- **Content**: What data/text appears on this screen? What are the states (empty, loading, error, populated)?
- **Hierarchy**: What is the most important element? What should the user see first?
- **Actions**: What can the user do? What are the primary vs secondary actions?
- **Navigation**: Where does the user come from? Where do they go next?
- **Constraints**: Mobile, desktop, or both? Specific breakpoints? Accessibility needs?
- **Tone**: Minimal? Dense? Playful? Corporate? Reference any existing brand or style?

Confirm assumptions and summarize decisions after each major branch. Do NOT proceed until you have a shared understanding of the design requirements.

### 4. Design three drafts

Create THREE separate design frames in the .pen file. Each must be a **radically different** approach to solving the same design problem. Not just color variations -- structurally different layouts, information architectures, and interaction patterns.

**Before designing:**
1. Call `get_editor_state` to understand the current canvas state
2. Call `get_guidelines` with the appropriate topic (web-app, mobile-app, landing-page, etc.)
3. Call `get_style_guide_tags`, then `get_style_guide` with relevant tags for each draft's aesthetic direction

**For each draft:**
- Give it a descriptive name (e.g., "Draft A - Card Grid", "Draft B - Sidebar Detail", "Draft C - Timeline View")
- Use `find_empty_space_on_canvas` to position drafts side by side
- Build the design using `batch_design` operations (max 25 ops per call)
- Use `get_screenshot` after each draft to verify the result visually
- Fix any visual issues you spot in the screenshot before moving on

**Use `spawn_agents`** to build the three drafts in parallel when possible. Create placeholder container frames first, then spawn agents for each draft with distinct style guide tags and design direction prompts.

**Differentiation strategies** (assign one per draft):
- **Layout**: Different spatial organization (grid vs list vs split-pane vs single-column)
- **Density**: Minimal with whitespace vs information-dense dashboard
- **Navigation pattern**: Tabs vs sidebar vs breadcrumbs vs wizard steps
- **Visual style**: Use different style guide tags for each draft

### 5. Iterate

Present all three drafts to the user. For each, explain:
- The design rationale (why this layout/approach)
- What it optimizes for (scannability, density, simplicity, delight)
- Trade-offs compared to the other drafts

Ask:
- "Which draft is closest to what you want?"
- "Any elements from the other drafts worth incorporating?"
- "What would you change?"

Then refine the chosen draft based on feedback. Use `get_screenshot` after each round of changes to verify visually. Continue iterating until the user is satisfied.
