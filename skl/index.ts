// ── Subcommand routing ───────────────────────────────────────────────
const [subcommand] = process.argv.slice(2);
if (subcommand === "add") {
  await import("./add.ts");
  process.exit(0);
}

import {
  createCliRenderer,
  BoxRenderable,
  TextRenderable,
  ScrollBoxRenderable,
  TextAttributes,
  type KeyEvent,
} from "@opentui/core";
import {
  readdirSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
  mkdirSync,
  existsSync,
  rmSync,
} from "fs";
import { join, resolve } from "path";
import { homedir } from "os";

// ── Constants & helpers ─────────────────────────────────────────────

const LIBRARY = join(homedir(), "dotfiles/skills");
const GLOBAL_DIR = join(homedir(), ".agents/skills");

// Safety: ensure GLOBAL_DIR is a real directory, not a symlink to the library
try {
  if (lstatSync(GLOBAL_DIR).isSymbolicLink()) {
    console.error(`ERROR: ${GLOBAL_DIR} is a symlink — it must be a real directory.`);
    console.error("Remove it and create a real directory: rm ~/.agents/skills && mkdir ~/.agents/skills");
    process.exit(1);
  }
} catch {
  // doesn't exist yet, that's fine — toggle will mkdir
}

function isLibraryLink(dir: string, name: string): boolean {
  const full = join(dir, name);
  try {
    return (
      lstatSync(full).isSymbolicLink() &&
      resolve(readlinkSync(full)) === resolve(join(LIBRARY, name))
    );
  } catch {
    return false;
  }
}

function nonLibraryExists(dir: string, name: string): boolean {
  const full = join(dir, name);
  try {
    return existsSync(full) && !isLibraryLink(dir, name);
  } catch {
    return false;
  }
}

function toggle(dir: string, name: string): boolean {
  const full = join(dir, name);
  if (isLibraryLink(dir, name)) {
    unlinkSync(full);
    return true;
  }
  if (existsSync(full)) {
    return false;
  }
  mkdirSync(dir, { recursive: true });
  symlinkSync(join(LIBRARY, name), full);
  return true;
}

function findLocalDir(): string | null {
  const dir = join(process.cwd(), ".agents/skills");
  if (existsSync(dir)) return dir;
  return null;
}

const allSkills = readdirSync(LIBRARY).sort();

// ── State ───────────────────────────────────────────────────────────

let cursor = 0; // index into filteredIndices
let cursorCol: "global" | "local" = "global";
const localDir = findLocalDir();
let statusTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingDelete: number | null = null; // allSkills index awaiting confirmation
const deletedSkills = new Set<number>();
let searchMode = false;
let searchQuery = "";
let filteredIndices: number[] = allSkills.map((_, i) => i);

// ── Colors ──────────────────────────────────────────────────────────

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
  search: "#ffdd55",
};

// ── Checkbox helpers ────────────────────────────────────────────────

function checkboxStr(checked: boolean, blocked: boolean): string {
  if (blocked) return "[!]";
  return checked ? "[x]" : "[ ]";
}

function checkboxColor(checked: boolean, blocked: boolean, active: boolean): string {
  if (blocked) return C.warning;
  if (active) return C.accent;
  return checked ? C.checked : C.unchecked;
}

// ── Count linked skills ─────────────────────────────────────────────

function countLinked(): number {
  let n = 0;
  for (let i = 0; i < allSkills.length; i++) {
    if (deletedSkills.has(i)) continue;
    const s = allSkills[i];
    if (isLibraryLink(GLOBAL_DIR, s) || (localDir && isLibraryLink(localDir, s))) n++;
  }
  return n;
}

function activeSkillCount(): number {
  return allSkills.length - deletedSkills.size;
}

// ── Build TUI ───────────────────────────────────────────────────────

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
  content: ` Skills Manager (${countLinked()}/${allSkills.length} linked)`,
  fg: C.title,
  attributes: TextAttributes.BOLD,
  height: 1,
});

// Search bar (hidden until / is pressed)
const searchBar = new TextRenderable(renderer, {
  id: "search-bar",
  content: "",
  fg: C.search,
  height: 1,
  visible: false,
});

const colHeaderRow = new BoxRenderable(renderer, {
  id: "col-header-row",
  flexDirection: "row",
  height: 1,
  paddingLeft: 1,
});

const colName = new TextRenderable(renderer, {
  id: "col-name",
  content: "Skill",
  fg: C.fgDim,
  attributes: TextAttributes.BOLD,
  width: 34,
});
const colGlobal = new TextRenderable(renderer, {
  id: "col-global",
  content: "~/.agents",
  fg: C.fgDim,
  attributes: TextAttributes.BOLD,
  width: 12,
});
const localLabel = localDir ? localDir.replace(homedir(), "~") : ".agents (n/a)";
const colLocal = new TextRenderable(renderer, {
  id: "col-local",
  content: localLabel,
  fg: C.fgDim,
  attributes: TextAttributes.BOLD,
  width: 20,
});

colHeaderRow.add(colName);
colHeaderRow.add(colGlobal);
colHeaderRow.add(colLocal);

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
  nameText: TextRenderable;
  globalText: TextRenderable;
  localText: TextRenderable;
};
const rows: RowRefs[] = [];

for (let i = 0; i < allSkills.length; i++) {
  const skill = allSkills[i];

  const row = new BoxRenderable(renderer, {
    id: `row-${i}`,
    flexDirection: "row",
    height: 1,
    width: "100%",
    paddingLeft: 1,
    backgroundColor: i % 2 === 0 ? C.rowBg : C.rowAltBg,
  });

  const nameText = new TextRenderable(renderer, {
    id: `name-${i}`,
    content: `  ${skill}`,
    fg: C.fg,
    width: 34,
  });

  const gChecked = isLibraryLink(GLOBAL_DIR, skill);
  const gBlocked = nonLibraryExists(GLOBAL_DIR, skill);
  const globalText = new TextRenderable(renderer, {
    id: `global-${i}`,
    content: checkboxStr(gChecked, gBlocked),
    fg: checkboxColor(gChecked, gBlocked, false),
    width: 10,
  });

  const lChecked = localDir ? isLibraryLink(localDir, skill) : false;
  const lBlocked = localDir ? nonLibraryExists(localDir, skill) : false;
  const localText = new TextRenderable(renderer, {
    id: `local-${i}`,
    content: localDir ? checkboxStr(lChecked, lBlocked) : "  -",
    fg: localDir ? checkboxColor(lChecked, lBlocked, false) : C.fgDim,
    width: 10,
  });

  row.add(nameText);
  row.add(globalText);
  row.add(localText);
  scrollBox.add(row);
  rows.push({ row, nameText, globalText, localText });
}

const footerSep = new TextRenderable(renderer, {
  id: "footer-sep",
  content: "─".repeat(60),
  fg: C.border,
  height: 1,
});

const footer = new TextRenderable(renderer, {
  id: "footer",
  content: " j/k move  h/l col  space toggle  a all  d delete  / search  q quit",
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
outer.add(searchBar);
outer.add(colHeaderRow);
outer.add(sep);
outer.add(scrollBox);
outer.add(footerSep);
outer.add(footer);
outer.add(statusLine);
renderer.root.add(outer);

// ── Search / filter ─────────────────────────────────────────────────

function applyFilter() {
  const term = searchQuery.toLowerCase();
  filteredIndices = [];
  for (let i = 0; i < allSkills.length; i++) {
    if (deletedSkills.has(i)) {
      rows[i].row.visible = false;
      continue;
    }
    const match = !term || allSkills[i].toLowerCase().includes(term);
    rows[i].row.visible = match;
    if (match) filteredIndices.push(i);
  }
  // clamp cursor
  if (filteredIndices.length === 0) {
    cursor = 0;
  } else if (cursor >= filteredIndices.length) {
    cursor = filteredIndices.length - 1;
  }
}

function updateSearchBar() {
  if (searchMode) {
    searchBar.visible = true;
    searchBar.content = ` / ${searchQuery}█`;
  } else if (searchQuery) {
    searchBar.visible = true;
    searchBar.content = ` / ${searchQuery}  (esc clear)`;
  } else {
    searchBar.visible = false;
    searchBar.content = "";
  }
}

// ── Update display ──────────────────────────────────────────────────

function currentSkillIndex(): number | null {
  return filteredIndices.length > 0 ? filteredIndices[cursor] : null;
}

function updateRow(i: number) {
  const skill = allSkills[i];
  const r = rows[i];
  const ci = currentSkillIndex();
  const isCursor = ci === i;

  const visPos = filteredIndices.indexOf(i);
  const baseBg = visPos % 2 === 0 ? C.rowBg : C.rowAltBg;
  r.row.backgroundColor = isCursor ? C.cursorBg : baseBg;

  const pointer = isCursor ? "▸" : " ";
  r.nameText.content = `${pointer} ${skill}`;
  r.nameText.fg = isCursor ? "#ffffff" : C.fg;
  r.nameText.attributes = isCursor ? TextAttributes.BOLD : TextAttributes.NONE;

  const gChecked = isLibraryLink(GLOBAL_DIR, skill);
  const gBlocked = nonLibraryExists(GLOBAL_DIR, skill);
  const gActive = isCursor && cursorCol === "global";
  r.globalText.content = checkboxStr(gChecked, gBlocked);
  r.globalText.fg = checkboxColor(gChecked, gBlocked, gActive);
  r.globalText.bg = gActive ? C.accentBg : undefined;
  r.globalText.attributes = gActive ? TextAttributes.BOLD : TextAttributes.NONE;

  const lChecked = localDir ? isLibraryLink(localDir, skill) : false;
  const lBlocked = localDir ? nonLibraryExists(localDir, skill) : false;
  const lActive = isCursor && cursorCol === "local";
  if (localDir) {
    r.localText.content = checkboxStr(lChecked, lBlocked);
    r.localText.fg = checkboxColor(lChecked, lBlocked, lActive);
    r.localText.bg = lActive ? C.accentBg : undefined;
    r.localText.attributes = lActive ? TextAttributes.BOLD : TextAttributes.NONE;
  } else {
    r.localText.content = "  -";
    r.localText.fg = C.fgDim;
    r.localText.bg = lActive ? C.accentBg : undefined;
  }
}

function updateHeader() {
  header.content = ` Skills Manager (${countLinked()}/${activeSkillCount()} linked)`;
}

function setStatus(msg: string, color: string) {
  statusLine.content = ` ${msg}`;
  statusLine.fg = color;
  if (statusTimeout) clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusLine.content = "";
  }, 3000);
}

function refreshAll() {
  for (const i of filteredIndices) updateRow(i);
  updateHeader();
  updateSearchBar();
}

refreshAll();

// ── Scrolling helper ────────────────────────────────────────────────

function ensureVisible() {
  scrollBox.scrollTo(Math.max(0, cursor - 2));
}

// ── Toggle all in column ────────────────────────────────────────────

function toggleAllColumn(col: "global" | "local") {
  const dir = col === "global" ? GLOBAL_DIR : localDir;
  if (!dir) {
    setStatus("No .agents/skills dir in current project", C.warning);
    return;
  }

  // Determine intent: if majority of visible skills are linked, unlink all; otherwise link all
  let linkedCount = 0;
  for (const i of filteredIndices) {
    if (isLibraryLink(dir, allSkills[i])) linkedCount++;
  }
  const shouldLink = linkedCount <= filteredIndices.length / 2;
  let changed = 0;
  let skipped = 0;

  for (const i of filteredIndices) {
    const skill = allSkills[i];
    const isLinked = isLibraryLink(dir, skill);
    if (shouldLink && !isLinked) {
      if (toggle(dir, skill)) changed++;
      else skipped++;
    } else if (!shouldLink && isLinked) {
      if (toggle(dir, skill)) changed++;
    }
  }

  const dirLabel = col === "global" ? "~/.agents" : localLabel;
  const action = shouldLink ? "linked" : "unlinked";
  let msg = `${action} ${changed} skills in ${dirLabel}`;
  if (skipped) msg += ` (${skipped} skipped)`;
  setStatus(msg, shouldLink ? C.statusOk : C.statusErr);
}

// ── Delete skill ────────────────────────────────────────────────

function cancelPendingDelete() {
  if (pendingDelete !== null) {
    pendingDelete = null;
    statusLine.content = "";
  }
}

function deleteSkill(idx: number) {
  const skill = allSkills[idx];

  // Remove symlinks first
  if (isLibraryLink(GLOBAL_DIR, skill)) unlinkSync(join(GLOBAL_DIR, skill));
  if (localDir && isLibraryLink(localDir, skill)) unlinkSync(join(localDir, skill));

  // Remove from library
  rmSync(join(LIBRARY, skill), { recursive: true, force: true });

  // Mark deleted and hide
  deletedSkills.add(idx);
  rows[idx].row.visible = false;
  pendingDelete = null;

  applyFilter();
  setStatus(`🗑 ${skill} deleted`, C.statusErr);
  refreshAll();
  ensureVisible();
}

// ── Key handler ─────────────────────────────────────────────────────

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  // ── Search mode input ──
  if (searchMode) {
    if (key.name === "escape" || key.name === "return") {
      searchMode = false;
      if (key.name === "escape" && !searchQuery) {
        // just close search
      }
      updateSearchBar();
      refreshAll();
      ensureVisible();
      return;
    }
    if (key.name === "backspace") {
      searchQuery = searchQuery.slice(0, -1);
      applyFilter();
      refreshAll();
      ensureVisible();
      return;
    }
    // Regular character input
    if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
      searchQuery += key.sequence;
      applyFilter();
      cursor = 0;
      refreshAll();
      ensureVisible();
      return;
    }
    return;
  }

  // ── Delete confirmation mode ──
  if (pendingDelete !== null) {
    if (key.name === "y") {
      deleteSkill(pendingDelete);
    } else {
      cancelPendingDelete();
      setStatus("delete cancelled", C.fgDim);
    }
    return;
  }

  // ── Normal mode ──
  const prevCursor = cursor;
  const prevIdx = currentSkillIndex();

  switch (key.name) {
    case "j":
    case "down":
      if (cursor < filteredIndices.length - 1) cursor++;
      break;
    case "k":
    case "up":
      if (cursor > 0) cursor--;
      break;
    case "h":
    case "left":
      cursorCol = "global";
      break;
    case "l":
    case "right":
      cursorCol = "local";
      break;
    case "space":
    case "return": {
      const idx = currentSkillIndex();
      if (idx === null) break;
      const skill = allSkills[idx];
      if (cursorCol === "global") {
        const ok = toggle(GLOBAL_DIR, skill);
        if (ok) {
          const linked = isLibraryLink(GLOBAL_DIR, skill);
          setStatus(
            linked ? `✓ ${skill} → ~/.agents/skills` : `✗ ${skill} removed from ~/.agents/skills`,
            linked ? C.statusOk : C.statusErr
          );
        } else {
          setStatus(`⚠ ${skill}: non-library file exists in ~/.agents/skills, skipped`, C.warning);
        }
      } else {
        if (!localDir) {
          setStatus("No .agents/skills dir in current project", C.warning);
          break;
        }
        const ok = toggle(localDir, skill);
        if (ok) {
          const linked = isLibraryLink(localDir, skill);
          setStatus(
            linked ? `✓ ${skill} → ${localLabel}` : `✗ ${skill} removed from ${localLabel}`,
            linked ? C.statusOk : C.statusErr
          );
        } else {
          setStatus(`⚠ ${skill}: non-library file exists in ${localLabel}, skipped`, C.warning);
        }
      }
      break;
    }
    case "a":
      toggleAllColumn(cursorCol);
      break;
    case "d": {
      const idx = currentSkillIndex();
      if (idx === null) break;
      pendingDelete = idx;
      setStatus(`delete ${allSkills[idx]}? (y to confirm)`, C.warning);
      break;
    }
    case "g":
      if (!key.shift) {
        cursor = 0;
      } else {
        cursor = filteredIndices.length - 1;
      }
      break;
    case "q":
      renderer.destroy();
      process.exit(0);
      break;
    case "/":
      searchMode = true;
      updateSearchBar();
      return;
    case "escape":
      if (searchQuery) {
        searchQuery = "";
        applyFilter();
        refreshAll();
        ensureVisible();
      }
      return;
    default:
      return;
  }

  if (prevIdx !== null && prevIdx !== currentSkillIndex()) {
    updateRow(prevIdx);
  }
  const ci = currentSkillIndex();
  if (ci !== null) updateRow(ci);
  // after toggle-all, refresh everything
  if (key.name === "a") {
    for (const i of filteredIndices) updateRow(i);
  }
  updateHeader();
  ensureVisible();
});
