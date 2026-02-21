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
} from "fs";
import { join, resolve } from "path";
import { homedir } from "os";

// ── Constants & helpers (reused from original) ──────────────────────

const LIBRARY = join(homedir(), "dotfiles/skills");
const GLOBAL_DIR = join(homedir(), ".claude/skills");

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
  for (const sub of [".agents/skills", ".claude/skills"]) {
    const dir = join(process.cwd(), sub);
    if (existsSync(dir)) return dir;
  }
  return null;
}

const allSkills = readdirSync(LIBRARY).sort();

// ── State ───────────────────────────────────────────────────────────

let cursorRow = 0;
let cursorCol: "global" | "local" = "global";
const localDir = findLocalDir();
let statusTimeout: ReturnType<typeof setTimeout> | null = null;

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
  for (const s of allSkills) {
    if (isLibraryLink(GLOBAL_DIR, s) || (localDir && isLibraryLink(localDir, s))) n++;
  }
  return n;
}

// ── Build TUI ───────────────────────────────────────────────────────

const renderer = await createCliRenderer({ exitOnCtrlC: true });

// Outer container
const outer = new BoxRenderable(renderer, {
  id: "outer",
  width: "100%",
  height: "100%",
  flexDirection: "column",
  backgroundColor: C.bg,
});

// Header
const header = new TextRenderable(renderer, {
  id: "header",
  content: ` Skills Manager (${countLinked()}/${allSkills.length} linked)`,
  fg: C.title,
  attributes: TextAttributes.BOLD,
  height: 1,
});

// Column header row
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
  content: "Global",
  fg: C.fgDim,
  attributes: TextAttributes.BOLD,
  width: 10,
});
const colLocal = new TextRenderable(renderer, {
  id: "col-local",
  content: "Local",
  fg: C.fgDim,
  attributes: TextAttributes.BOLD,
  width: 10,
});

colHeaderRow.add(colName);
colHeaderRow.add(colGlobal);
colHeaderRow.add(colLocal);

// Separator
const sep = new TextRenderable(renderer, {
  id: "sep",
  content: "─".repeat(60),
  fg: C.border,
  height: 1,
});

// Scrollable skill list
const scrollBox = new ScrollBoxRenderable(renderer, {
  id: "skill-list",
  flexGrow: 1,
  width: "100%",
});

// Row data storage
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

// Footer separator
const footerSep = new TextRenderable(renderer, {
  id: "footer-sep",
  content: "─".repeat(60),
  fg: C.border,
  height: 1,
});

// Footer
const footer = new TextRenderable(renderer, {
  id: "footer",
  content: " j/k navigate  h/l column  space toggle  q quit",
  fg: C.footer,
  height: 1,
});

// Status line
const statusLine = new TextRenderable(renderer, {
  id: "status",
  content: "",
  fg: C.statusOk,
  height: 1,
});

// Assemble
outer.add(header);
outer.add(colHeaderRow);
outer.add(sep);
outer.add(scrollBox);
outer.add(footerSep);
outer.add(footer);
outer.add(statusLine);
renderer.root.add(outer);

// ── Update display ──────────────────────────────────────────────────

function updateRow(i: number) {
  const skill = allSkills[i];
  const r = rows[i];
  const isCursor = i === cursorRow;

  // Row background
  const baseBg = i % 2 === 0 ? C.rowBg : C.rowAltBg;
  r.row.backgroundColor = isCursor ? C.cursorBg : baseBg;

  // Name
  const pointer = isCursor ? "▸" : " ";
  r.nameText.content = `${pointer} ${skill}`;
  r.nameText.fg = isCursor ? "#ffffff" : C.fg;
  r.nameText.attributes = isCursor ? TextAttributes.BOLD : TextAttributes.NONE;

  // Global checkbox
  const gChecked = isLibraryLink(GLOBAL_DIR, skill);
  const gBlocked = nonLibraryExists(GLOBAL_DIR, skill);
  const gActive = isCursor && cursorCol === "global";
  r.globalText.content = checkboxStr(gChecked, gBlocked);
  r.globalText.fg = checkboxColor(gChecked, gBlocked, gActive);
  r.globalText.bg = gActive ? C.accentBg : undefined;
  r.globalText.attributes = gActive ? TextAttributes.BOLD : TextAttributes.NONE;

  // Local checkbox
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
  header.content = ` Skills Manager (${countLinked()}/${allSkills.length} linked)`;
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
  for (let i = 0; i < allSkills.length; i++) updateRow(i);
  updateHeader();
}

// Initial render
refreshAll();

// ── Scrolling helper ────────────────────────────────────────────────

function ensureVisible() {
  scrollBox.scrollTo(Math.max(0, cursorRow - 2));
}

// ── Key handler ─────────────────────────────────────────────────────

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  const prev = cursorRow;

  switch (key.name) {
    case "j":
    case "down":
      if (cursorRow < allSkills.length - 1) cursorRow++;
      break;
    case "k":
    case "up":
      if (cursorRow > 0) cursorRow--;
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
      const skill = allSkills[cursorRow];
      if (cursorCol === "global") {
        const ok = toggle(GLOBAL_DIR, skill);
        if (ok) {
          const linked = isLibraryLink(GLOBAL_DIR, skill);
          setStatus(
            linked ? `✓ ${skill} linked globally` : `✗ ${skill} unlinked globally`,
            linked ? C.statusOk : C.statusErr
          );
        } else {
          setStatus(`⚠ ${skill}: non-library file exists, skipped`, C.warning);
        }
      } else {
        if (!localDir) {
          setStatus("No local skills dir (.agents/skills or .claude/skills)", C.warning);
          break;
        }
        const ok = toggle(localDir, skill);
        if (ok) {
          const linked = isLibraryLink(localDir, skill);
          setStatus(
            linked ? `✓ ${skill} linked locally` : `✗ ${skill} unlinked locally`,
            linked ? C.statusOk : C.statusErr
          );
        } else {
          setStatus(`⚠ ${skill}: non-library file exists, skipped`, C.warning);
        }
      }
      break;
    }
    case "g":
      if (!key.shift) {
        cursorRow = 0;
      } else {
        cursorRow = allSkills.length - 1;
      }
      break;
    case "q":
      renderer.destroy();
      process.exit(0);
      break;
    default:
      return;
  }

  // Only update changed rows + header
  if (prev !== cursorRow) {
    updateRow(prev);
  }
  updateRow(cursorRow);
  updateHeader();
  ensureVisible();
});
