import { expand, BUG_DECK } from "./cards";

/**
 * Bug Hunt levels. Each level has its own bug deck, starting LP for the bugs,
 * and how sharp the AI plays:
 *  - blunder: chance the Bug makes a careless summon/attack
 *  - traps:   chance it springs a trap when it should
 */
export const LEVELS = [
  {
    id: 1,
    name: "Syntax Errors",
    boss: "Typo Gremlin",
    bossCard: "typo-gremlin",
    blurb: "Tiny bugs, big noise. A warm-up — the bugs have no traps and only 4000 LP.",
    bugLp: 4000,
    ai: { blunder: 0.5, traps: 0 },
    deck: expand([
      ["typo-gremlin", 4], ["missing-semicolon", 4], ["null-pointer", 4], ["off-by-one", 4], ["overflow-spider", 4], ["undefined-phantom", 2],
      ["crash-report", 4], ["deadline", 4],
    ]),
  },
  {
    id: 2,
    name: "Runtime Exceptions",
    boss: "Heisenbug",
    bossCard: "heisenbug",
    blurb: "The bugs start setting traps. 6000 LP.",
    bugLp: 6000,
    ai: { blunder: 0.3, traps: 0.5 },
    deck: expand([
      ["null-pointer", 3], ["off-by-one", 3], ["undefined-phantom", 3], ["overflow-spider", 3], ["memory-leak", 3], ["heisenbug", 3],
      ["crash-report", 2], ["deadline", 3], ["prod-outage", 2],
      ["timeout", 5],
    ]),
  },
  {
    id: 3,
    name: "Memory Leak Swarm",
    boss: "Spaghetti Code Golem",
    bossCard: "spaghetti-golem",
    blurb: "A full bug deck with tributes, removal and traps. 8000 LP.",
    bugLp: 8000,
    ai: { blunder: 0.22, traps: 0.7 },
    deck: BUG_DECK,
  },
  {
    id: 4,
    name: "Concurrency Chaos",
    boss: "Stack Overflow Hydra",
    bossCard: "stack-hydra",
    blurb: "Aggressive and fast — lots of attackers, burn and Segfaults.",
    bugLp: 8000,
    ai: { blunder: 0.1, traps: 0.9 },
    deck: expand([
      ["race-condition", 3], ["deadlock-twins", 3], ["merge-conflict", 3], ["memory-leak", 2], ["heisenbug", 2], ["infinite-loop", 2], ["stack-hydra", 2],
      ["breaking-change", 2], ["deadline", 2], ["prod-outage", 2], ["crash-report", 2],
      ["segfault", 2], ["timeout", 3],
    ]),
  },
  {
    id: 5,
    name: "The Legacy Monolith",
    boss: "Zero-Day Wyrm",
    bossCard: "zero-day",
    blurb: "The final boss. Monoliths, a Zero-Day Wyrm and a Bug that never blunders.",
    bugLp: 8000,
    ai: { blunder: 0, traps: 1 },
    deck: expand([
      ["race-condition", 2], ["deadlock-twins", 2], ["merge-conflict", 2], ["memory-leak", 2], ["infinite-loop", 2], ["heisenbug", 2],
      ["spaghetti-golem", 2], ["stack-hydra", 1], ["legacy-monolith", 2], ["zero-day", 1],
      ["breaking-change", 2], ["deadline", 2], ["prod-outage", 2], ["crash-report", 1],
      ["segfault", 3], ["timeout", 2],
    ]),
  },
];

const KEY = "bughunt-unlocked-v1";

export function loadUnlocked() {
  try {
    return Math.max(1, Math.min(LEVELS.length, Number(localStorage.getItem(KEY)) || 1));
  } catch {
    return 1;
  }
}

export function unlockNext(levelId) {
  const next = Math.min(LEVELS.length, levelId + 1);
  try {
    if (next > loadUnlocked()) localStorage.setItem(KEY, String(next));
  } catch {
    /* storage blocked */
  }
  return Math.max(next, loadUnlocked());
}
