import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiRedux,
  SiSocketdotio,
  SiGit,
  SiJsonwebtokens,
} from "react-icons/si";
import {
  FaLayerGroup,
  FaWrench,
  FaMagnifyingGlass,
  FaVialCircleCheck,
  FaUserGroup,
  FaClockRotateLeft,
  FaShieldHalved,
  FaFireFlameCurved,
  FaGhost,
  FaInfinity,
  FaMemory,
  FaBolt,
  FaCodeMerge,
  FaQuestion,
  FaSkull,
  FaRulerHorizontal,
  FaBuildingColumns,
  FaBomb,
  FaFileLines,
  FaHourglassHalf,
  FaFire,
  FaStopwatch,
  FaSkullCrossbones,
  FaKeyboard,
  FaTextSlash,
} from "react-icons/fa6";
import { GiNoodles, GiSpiderAlt, GiTwoShadows, GiHydra, GiDragonHead } from "react-icons/gi";

/**
 * Card pool for "Bug Hunt": a developer's deck against a deck of bugs.
 * All names and art are original. kind: "monster" | "spell" | "trap".
 *
 * Effects (see engine.js):
 *  spells — destroy, draw2, heal, boost, revive, burn
 *  traps  — negate (stop an attack), destroyAttacker
 */

const monster = (id, name, attr, level, atk, def, Icon, color, flavor, variant) => ({
  id,
  name,
  kind: "monster",
  attr,
  level,
  atk,
  def,
  art: { Icon, color },
  text: flavor,
  variant,
});
const spell = (id, name, effect, Icon, color, text) => ({ id, name, kind: "spell", effect, art: { Icon, color }, text, variant: "teal" });
const trap = (id, name, effect, Icon, color, text) => ({ id, name, kind: "trap", effect, art: { Icon, color }, text, variant: "violet" });

const attrVariant = { Frontend: "azure", Backend: "emerald", Database: "amber", Tools: "slate", "Full-Stack": "gold", Bug: "obsidian" };
const dev = (id, name, attr, level, atk, def, Icon, color, flavor) => monster(id, name, attr, level, atk, def, Icon, color, flavor, attrVariant[attr]);
const bug = (id, name, level, atk, def, Icon, color, flavor) => monster(id, name, "Bug", level, atk, def, Icon, color, flavor, "obsidian");

const list = [
  /* ── Developer monsters ── */
  dev("html-scout", "HTML Scout", "Frontend", 2, 800, 1000, SiHtml5, "#ff6a3d", "Marks up the battlefield before anyone else arrives."),
  dev("css-stylist", "CSS Stylist", "Frontend", 3, 1200, 900, SiCss, "#4d8cff", "Centers any div. Eventually."),
  dev("js-ninja", "JavaScript Ninja", "Frontend", 4, 1800, 1000, SiJavascript, "#f7df1e", "Strikes asynchronously — you never see the callback coming."),
  dev("redux-store", "Redux Store", "Frontend", 3, 1000, 1600, SiRedux, "#9f7ae0", "A single source of truth that refuses to be mutated."),
  dev("react-architect", "React Architect", "Frontend", 5, 2300, 1800, SiReact, "#61dafb", "Re-renders reality, one component at a time."),
  dev("node-engine", "Node.js Engine", "Backend", 4, 1700, 1300, SiNodedotjs, "#6cc24a", "A single thread with the stamina of thousands."),
  dev("express-router", "Express Router", "Backend", 3, 1400, 1000, SiExpress, "#f2f2f2", "Every request finds its way home."),
  dev("socket-messenger", "Socket.IO Messenger", "Backend", 4, 1600, 1200, SiSocketdotio, "#f2f2f2", "Delivers the news before it happens."),
  dev("jwt-sentinel", "JWT Sentinel", "Backend", 3, 1300, 1300, SiJsonwebtokens, "#ff5fa2", "No valid token, no entry."),
  dev("mongo-keeper", "MongoDB Keeper", "Database", 4, 1300, 1900, SiMongodb, "#4db33d", "Stores everything. Forgets nothing."),
  dev("git-guardian", "Git Guardian", "Tools", 4, 1100, 2000, SiGit, "#f05033", "Every mistake is just one commit away from history."),
  dev("fullstack", "Full-Stack Architect", "Full-Stack", 7, 2800, 2400, FaLayerGroup, "#f0c35a", "Sees the whole stack — from schema to pixel."),

  /* ── Developer spells & traps ── */
  spell("hotfix", "Hotfix", "destroy", FaWrench, "#f0c35a", "Destroy 1 monster your opponent controls."),
  spell("code-review", "Code Review", "draw2", FaMagnifyingGlass, "#9fd3ff", "Draw 2 cards."),
  spell("unit-tests", "Unit Tests", "heal", FaVialCircleCheck, "#7ee0a1", "Gain 1000 LP."),
  spell("pair-programming", "Pair Programming", "boost", FaUserGroup, "#ffcf6a", "1 face-up monster you control gains 700 ATK until the end of this turn."),
  spell("git-revert", "Git Revert", "revive", FaClockRotateLeft, "#f05033", "Special Summon the strongest monster from your graveyard in Attack Position."),
  trap("try-catch", "Try / Catch", "negate", FaShieldHalved, "#9fd3ff", "When an opponent's monster declares an attack: negate that attack."),
  trap("firewall", "Firewall", "destroyAttacker", FaFireFlameCurved, "#ff8a4c", "When an opponent's monster declares an attack: destroy the attacking monster."),

  /* ── Bug monsters ── */
  bug("null-pointer", "Null Pointer", 2, 900, 500, FaSkull, "#e7e7e7", "Points at nothing. Hits anyway."),
  bug("off-by-one", "Off-by-One Imp", 3, 1200, 1000, FaRulerHorizontal, "#ffb347", "Always one step ahead — or behind."),
  bug("undefined-phantom", "Undefined Phantom", 3, 1300, 700, FaGhost, "#c9c3ff", "Is it there? typeof says no."),
  bug("memory-leak", "Memory Leak", 4, 1600, 1300, FaMemory, "#ff6b6b", "Grows a little every turn. Never lets go."),
  bug("race-condition", "Race Condition", 4, 1800, 800, FaBolt, "#ffe14d", "Wins only when nobody is looking."),
  bug("infinite-loop", "Infinite Loop", 4, 1300, 1900, FaInfinity, "#8fd6ff", "while (true) { block(); }"),
  bug("merge-conflict", "Merge Conflict", 4, 1700, 1200, FaCodeMerge, "#ff8a4c", "<<<<<<< HEAD — two truths, one file."),
  bug("heisenbug", "Heisenbug", 4, 1500, 1500, FaQuestion, "#d7a6ff", "Vanishes the moment you add a console.log."),
  bug("spaghetti-golem", "Spaghetti Code Golem", 5, 2200, 2000, GiNoodles, "#f2c46d", "Every strand is connected to every other strand."),
  bug("legacy-monolith", "The Legacy Monolith", 7, 2700, 2500, FaBuildingColumns, "#c7b38a", "Nobody remembers who wrote it. Nobody dares to touch it."),
  bug("typo-gremlin", "Typo Gremlin", 1, 500, 400, FaKeyboard, "#ffd36a", "Swaps two letters and runs away giggling."),
  bug("missing-semicolon", "Missing Semicolon", 2, 700, 600, FaTextSlash, "#e7e7e7", "Small, harmless-looking… and the build is red."),
  bug("overflow-spider", "Overflow Spider", 3, 1000, 1200, GiSpiderAlt, "#9fd3ff", "Spills out of every container it touches."),
  bug("deadlock-twins", "Deadlock Twins", 4, 1600, 1600, GiTwoShadows, "#c9c3ff", "Each waits for the other. Forever."),
  bug("stack-hydra", "Stack Overflow Hydra", 6, 2400, 1800, GiHydra, "#7ee0a1", "Cut off one call and two more recurse in its place."),
  bug("zero-day", "Zero-Day Wyrm", 8, 3000, 2500, GiDragonHead, "#ff6b6b", "Nobody saw it coming. That's the point."),

  /* ── Bug spells & traps ── */
  spell("breaking-change", "Breaking Change", "destroy", FaBomb, "#ff6b6b", "Destroy 1 monster your opponent controls."),
  spell("crash-report", "Crash Report", "draw2", FaFileLines, "#e7e7e7", "Draw 2 cards."),
  spell("deadline", "Deadline Pressure", "boost", FaHourglassHalf, "#ffcf6a", "1 face-up monster you control gains 700 ATK until the end of this turn."),
  spell("prod-outage", "Production Outage", "burn", FaFire, "#ff8a4c", "Inflict 800 damage to your opponent."),
  trap("segfault", "Segfault", "destroyAttacker", FaSkullCrossbones, "#ff6b6b", "When an opponent's monster declares an attack: destroy the attacking monster."),
  trap("timeout", "Request Timeout", "negate", FaStopwatch, "#8fd6ff", "When an opponent's monster declares an attack: negate that attack."),
];

export const CARDS = Object.fromEntries(list.map((c) => [c.id, c]));

export const expand = (entries) => entries.flatMap(([id, n]) => Array(n).fill(id));

/** 30-card decks. */
export const DEV_DECK = expand([
  ["html-scout", 2], ["css-stylist", 2], ["js-ninja", 2], ["redux-store", 1], ["react-architect", 1],
  ["node-engine", 2], ["express-router", 2], ["socket-messenger", 1], ["jwt-sentinel", 1],
  ["mongo-keeper", 2], ["git-guardian", 1], ["fullstack", 1],
  ["hotfix", 1], ["code-review", 2], ["unit-tests", 1], ["pair-programming", 2], ["git-revert", 1],
  ["try-catch", 3], ["firewall", 2],
]);

export const BUG_DECK = expand([
  ["null-pointer", 2], ["off-by-one", 2], ["undefined-phantom", 2], ["memory-leak", 2], ["race-condition", 2],
  ["infinite-loop", 2], ["merge-conflict", 2], ["heisenbug", 1], ["spaghetti-golem", 2], ["legacy-monolith", 1],
  ["breaking-change", 1], ["crash-report", 2], ["deadline", 2], ["prod-outage", 2],
  ["segfault", 2], ["timeout", 3],
]);

/** Shape a pool card for <GameCard>. */
export function toGameCard(c) {
  if (!c) return null;
  const isMon = c.kind === "monster";
  return {
    id: c.id,
    title: c.name,
    type: isMon ? `${c.attr} · Lv ${c.level}` : c.kind === "spell" ? "Spell" : "Trap",
    variant: c.variant,
    art: c.art,
    text: c.text,
    stat: isMon ? `ATK ${c.atk} / DEF ${c.def}` : null,
    serial: isMon ? "★".repeat(Math.min(c.level, 7)) : c.kind === "spell" ? "SPELL" : "TRAP",
  };
}
