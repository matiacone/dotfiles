import { existsSync, lstatSync, mkdirSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import {
  createCliRenderer,
  BoxRenderable,
  TextRenderable,
  ScrollBoxRenderable,
  TextAttributes,
  type KeyEvent,
} from "@opentui/core";

const LIBRARY = join(homedir(), "dotfiles/skills");

let repo = process.argv[3];
if (repo) {
  // Accept GitHub URLs: https://github.com/owner/repo[/...]
  const urlMatch = repo.match(/github\.com\/([^/]+\/[^/]+)/);
  if (urlMatch) repo = urlMatch[1].replace(/\.git$/, "");
}
if (!repo || !/^[^/]+\/[^/]+$/.test(repo)) {
  console.error("Usage: skl add owner/repo");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────

async function gh(args: string): Promise<string> {
  const proc = Bun.spawn(["gh", "api", ...args.split(" ")], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  const code = await proc.exited;
  if (code !== 0) {
    const err = await new Response(proc.stderr).text();
    throw new Error(`gh api ${args} failed: ${err.trim()}`);
  }
  return out.trim();
}

function skillExists(name: string): boolean {
  const p = join(LIBRARY, name);
  try {
    const stat = lstatSync(p);
    if (stat.isDirectory()) return true;
    return false;
  } catch {
    return false;
  }
}

// ── Colors (matching index.ts) ───────────────────────────────────────

const C = {
  bg: "#1a1a2e",
  rowBg: "#1a1a2e",
  rowAltBg: "#1f1f38",
  cursorBg: "#2a2a5a",
  accentBg: "#3a3a7a",
  border: "#444477",
  fg: "#ccccdd",
  fgDim: "#666688",
  checked: "#66ff88",
  unchecked: "#555566",
  warning: "#ffaa44",
  accent: "#8888ff",
  title: "#aaaaff",
  footer: "#888899",
  statusOk: "#66ff88",
  statusErr: "#ff6666",
};

// ── Fetch phase (plain stdout) ───────────────────────────────────────

console.log(`Fetching ${repo}...`);

let branch: string;
try {
  const repoJson = JSON.parse(await gh(`repos/${repo}`));
  branch = repoJson.default_branch;
} catch (e: any) {
  console.error(`Failed to access ${repo}: ${e.message}`);
  process.exit(1);
}

const treeJson = JSON.parse(
  await gh(`repos/${repo}/git/trees/${branch}?recursive=1`)
);
const tree: { path: string; type: string }[] = treeJson.tree;

const skillMdPaths = tree
  .filter((e) => e.type === "blob" && /^[^/]+\/SKILL\.md$/.test(e.path))
  .map((e) => e.path.split("/")[0])
  .sort();

if (skillMdPaths.length === 0) {
  console.error(`No skills found in ${repo} (no top-level dirs with SKILL.md)`);
  process.exit(1);
}

// ── Classify skills ──────────────────────────────────────────────────

type SkillEntry = { name: string; exists: boolean };
const skills: SkillEntry[] = skillMdPaths.map((name) => ({
  name,
  exists: skillExists(name),
}));

const addableCount = skills.filter((s) => !s.exists).length;
if (addableCount === 0) {
  console.log("All skills already exist in your library.");
  process.exit(0);
}

// ── State ────────────────────────────────────────────────────────────

let cursor = 0;
const checked = new Set<number>();
let statusTimeout: ReturnType<typeof setTimeout> | null = null;

// Start cursor on first addable skill
for (let i = 0; i < skills.length; i++) {
  if (!skills[i].exists) { cursor = i; break; }
}

// ── Build TUI ────────────────────────────────────────────────────────

const renderer = await createCliRenderer({ exitOnCtrlC: true });

const outer = new BoxRenderable(renderer, {
  id: "outer",
  width: "100%",
  height: "100%",
  flexDirection: "column",
  backgroundColor: C.bg,
});

const header = new TextRenderable(renderer, {
  id: "header",
  content: ` Add skills from ${repo}`,
  fg: C.title,
  attributes: TextAttributes.BOLD,
  height: 1,
});

const sep = new TextRenderable(renderer, {
  id: "sep",
  content: "─".repeat(60),
  fg: C.border,
  height: 1,
});

const scrollBox = new ScrollBoxRenderable(renderer, {
  id: "skill-list",
  flexGrow: 1,
  width: "100%",
});

type RowRefs = {
  row: BoxRenderable;
  checkText: TextRenderable;
  nameText: TextRenderable;
};
const rows: RowRefs[] = [];

for (let i = 0; i < skills.length; i++) {
  const skill = skills[i];

  const row = new BoxRenderable(renderer, {
    id: `row-${i}`,
    flexDirection: "row",
    height: 1,
    width: "100%",
    paddingLeft: 1,
    backgroundColor: i % 2 === 0 ? C.rowBg : C.rowAltBg,
  });

  const checkText = new TextRenderable(renderer, {
    id: `check-${i}`,
    content: skill.exists ? "[*]" : "[ ]",
    fg: skill.exists ? C.fgDim : C.unchecked,
    width: 4,
  });

  const label = skill.exists ? `${skill.name} (exists)` : skill.name;
  const nameText = new TextRenderable(renderer, {
    id: `name-${i}`,
    content: `  ${label}`,
    fg: skill.exists ? C.fgDim : C.fg,
    width: 40,
  });

  row.add(checkText);
  row.add(nameText);
  scrollBox.add(row);
  rows.push({ row, checkText, nameText });
}

const footerSep = new TextRenderable(renderer, {
  id: "footer-sep",
  content: "─".repeat(60),
  fg: C.border,
  height: 1,
});

const footer = new TextRenderable(renderer, {
  id: "footer",
  content: " j/k move  space toggle  a all  enter confirm  q cancel",
  fg: C.footer,
  height: 1,
});

const statusLine = new TextRenderable(renderer, {
  id: "status",
  content: "",
  fg: C.statusOk,
  height: 1,
});

outer.add(header);
outer.add(sep);
outer.add(scrollBox);
outer.add(footerSep);
outer.add(footer);
outer.add(statusLine);
renderer.root.add(outer);

// ── Display helpers ──────────────────────────────────────────────────

function updateRow(i: number) {
  const skill = skills[i];
  const r = rows[i];
  const isCursor = cursor === i;

  const baseBg = i % 2 === 0 ? C.rowBg : C.rowAltBg;
  r.row.backgroundColor = isCursor ? C.cursorBg : baseBg;

  if (skill.exists) {
    r.checkText.content = "[*]";
    r.checkText.fg = C.fgDim;
    const pointer = isCursor ? "▸" : " ";
    r.nameText.content = `${pointer} ${skill.name} (exists)`;
    r.nameText.fg = C.fgDim;
    r.nameText.attributes = isCursor ? TextAttributes.BOLD : TextAttributes.NONE;
  } else {
    const isChecked = checked.has(i);
    r.checkText.content = isChecked ? "[x]" : "[ ]";
    r.checkText.fg = isCursor ? C.accent : (isChecked ? C.checked : C.unchecked);
    const pointer = isCursor ? "▸" : " ";
    r.nameText.content = `${pointer} ${skill.name}`;
    r.nameText.fg = isCursor ? "#ffffff" : C.fg;
    r.nameText.attributes = isCursor ? TextAttributes.BOLD : TextAttributes.NONE;
  }
}

function setStatus(msg: string, color: string) {
  statusLine.content = ` ${msg}`;
  statusLine.fg = color;
  if (statusTimeout) clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusLine.content = "";
  }, 3000);
}

function selectedCount(): number {
  return checked.size;
}

function updateHeader() {
  header.content = ` Add skills from ${repo}  (${selectedCount()} selected)`;
}

function refreshAll() {
  for (let i = 0; i < skills.length; i++) updateRow(i);
  updateHeader();
}

function ensureVisible() {
  scrollBox.scrollTo(Math.max(0, cursor - 2));
}

refreshAll();

// ── Confirm & download ───────────────────────────────────────────────

function confirmAndDownload() {
  const selected = [...checked].map((i) => skills[i].name);
  if (selected.length === 0) {
    setStatus("Nothing selected — use space to toggle", C.warning);
    return;
  }

  renderer.destroy();

  // Download phase — plain stdout like before
  const baseUrl = `https://raw.githubusercontent.com/${repo}/${branch}`;

  (async () => {
    for (const skillName of selected) {
      const skillDir = join(LIBRARY, skillName);

      // Remove broken symlink if present
      try {
        if (lstatSync(skillDir).isSymbolicLink()) {
          unlinkSync(skillDir);
        }
      } catch {}

      mkdirSync(skillDir, { recursive: true });

      const prefix = skillName + "/";
      const files = tree
        .filter((e) => e.type === "blob" && e.path.startsWith(prefix))
        .map((e) => e.path);

      process.stdout.write(`  ${skillName} (${files.length} files)...`);

      for (const filePath of files) {
        const url = `${baseUrl}/${filePath}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          console.error(`\n    Failed to fetch ${filePath}: ${resp.status}`);
          continue;
        }
        const content = await resp.arrayBuffer();
        const dest = join(LIBRARY, filePath);
        const dir = dest.substring(0, dest.lastIndexOf("/"));
        mkdirSync(dir, { recursive: true });
        writeFileSync(dest, Buffer.from(content));
      }
      console.log(" done");
    }

    console.log(`\nAdded ${selected.length} skill(s) to ~/dotfiles/skills/`);
    process.exit(0);
  })();
}

// ── Key handler ──────────────────────────────────────────────────────

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  const prevCursor = cursor;

  switch (key.name) {
    case "j":
    case "down":
      if (cursor < skills.length - 1) cursor++;
      break;
    case "k":
    case "up":
      if (cursor > 0) cursor--;
      break;
    case "space": {
      if (skills[cursor].exists) {
        setStatus(`${skills[cursor].name} already exists`, C.warning);
        break;
      }
      if (checked.has(cursor)) {
        checked.delete(cursor);
      } else {
        checked.add(cursor);
      }
      break;
    }
    case "a": {
      // Toggle all addable skills
      const addable = skills
        .map((s, i) => (!s.exists ? i : -1))
        .filter((i) => i >= 0);
      const allChecked = addable.every((i) => checked.has(i));
      if (allChecked) {
        for (const i of addable) checked.delete(i);
      } else {
        for (const i of addable) checked.add(i);
      }
      for (const i of addable) updateRow(i);
      updateHeader();
      ensureVisible();
      return;
    }
    case "return":
      confirmAndDownload();
      return;
    case "q":
    case "escape":
      renderer.destroy();
      process.exit(0);
      break;
    default:
      return;
  }

  if (prevCursor !== cursor) updateRow(prevCursor);
  updateRow(cursor);
  updateHeader();
  ensureVisible();
});
