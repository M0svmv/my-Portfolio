import { CARDS, DEV_DECK } from "./cards";
import { LEVELS } from "./levels";

/**
 * Bug Hunt — rules engine.
 *
 * Classic trading-card duel rules:
 *  - 8000 LP each, 5-card opening hand, the first player skips their first draw and can't attack on turn 1.
 *  - Turn: Draw → Main 1 → Battle → Main 2 → End. Hand limit 6 at the end of the turn.
 *  - One Normal Summon or Set per turn. Level 5–6 needs 1 tribute, level 7+ needs 2.
 *  - Set monsters are face-down in Defense Position. Once per turn (not the turn it was placed)
 *    a monster can change position, or be flipped face-up into Attack Position.
 *  - Spells are played in your Main Phase (from the hand or after being Set).
 *    Traps must be Set first and can be activated from the next turn on, when an opponent attacks.
 *  - Battle: ATK vs ATK → the weaker is destroyed and its owner takes the difference.
 *    ATK vs DEF → the defender is destroyed if ATK is higher (no damage); if DEF is higher the attacker's
 *    owner takes the difference. Direct attacks hit LP. A player at 0 LP — or who must draw from an
 *    empty deck — loses.
 *
 * Every function takes a state and returns a NEW state (the state is plain JSON).
 */

export const START_LP = 8000;
export const HAND_LIMIT = 6;
export const ZONES = 5;

export const other = (p) => (p === "you" ? "bug" : "you");
export const def = (x) => (x ? CARDS[x.cid] : null);
export const tributesNeeded = (c) => (c.level >= 7 ? 2 : c.level >= 5 ? 1 : 0);
export const atkOf = (m) => def(m).atk + (m.boost || 0);
export const isMain = (s) => s.phase === "main1" || s.phase === "main2";

const clone = (s) => structuredClone(s);
let uidCounter = 0;
const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

function begin(s) {
  const n = clone(s);
  n.events = [];
  return n;
}
function event(s, e) {
  s.events.push({ id: ++s.seq, ...e });
}
function log(s, text, tone = "info") {
  s.log = [{ id: ++s.seq, text, tone }, ...s.log].slice(0, 40);
}
function banner(s, text, tone = "info") {
  s.banner = { id: ++s.seq, text, tone };
}
const who = (p) => (p === "you" ? "You" : "The Bug");

function makePlayer(ids, lp = START_LP) {
  return {
    lp,
    maxLp: lp,
    deck: shuffle(ids).map((cid) => ({ uid: `k${++uidCounter}`, cid })),
    hand: [],
    gy: [],
    monsters: Array(ZONES).fill(null),
    spells: Array(ZONES).fill(null),
    normalSummoned: false,
  };
}

function drawCards(s, p, n = 1) {
  const pl = s.players[p];
  for (let i = 0; i < n; i++) {
    if (!pl.deck.length) {
      if (!s.winner) {
        s.winner = other(p);
        log(s, `${who(p)} can't draw — the deck is empty!`, "bad");
      }
      return;
    }
    pl.hand.push(pl.deck.shift());
  }
  event(s, { type: "draw", side: p, count: n });
}

function checkLp(s) {
  for (const p of ["you", "bug"]) {
    if (s.players[p].lp <= 0 && !s.winner) s.winner = other(p);
  }
}

function damage(s, p, amount) {
  if (amount <= 0) return;
  const pl = s.players[p];
  pl.lp = Math.max(0, pl.lp - amount);
  event(s, { type: "lp", side: p, amount: -amount });
  log(s, `${who(p)} ${p === "you" ? "take" : "takes"} ${amount} damage.`, p === "you" ? "bad" : "good");
  checkLp(s);
}

function heal(s, p, amount) {
  s.players[p].lp += amount;
  event(s, { type: "lp", side: p, amount });
}

function destroyMonster(s, side, zone) {
  const pl = s.players[side];
  const m = pl.monsters[zone];
  if (!m) return;
  pl.monsters[zone] = null;
  pl.gy.push({ uid: m.uid, cid: m.cid });
  event(s, { type: "destroy", side, zone, uid: m.uid });
  log(s, `${def(m).name} was destroyed.`, side === "you" ? "bad" : "good");
}

function sendSpellToGy(s, side, zone) {
  const pl = s.players[side];
  const c = pl.spells[zone];
  if (!c) return;
  pl.spells[zone] = null;
  pl.gy.push({ uid: c.uid, cid: c.cid });
}

const firstEmpty = (arr) => arr.findIndex((x) => !x);

/* ───────────── setup & turns ───────────── */

export function newGame(levelId = 1) {
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
  const s = {
    level: level.id,
    ai: level.ai,
    seq: 0,
    turn: 1,
    current: "you",
    phase: "main1",
    winner: null,
    log: [],
    banner: null,
    events: [],
    prompt: null,
    pendingAttack: null,
    players: { you: makePlayer(DEV_DECK), bug: makePlayer(level.deck, level.bugLp) },
  };
  drawCards(s, "you", 5);
  drawCards(s, "bug", 5);
  log(s, `Level ${level.id}: ${level.name}. You go first (no draw, no attacks on turn 1).`);
  banner(s, "Your turn", "you");
  return s;
}

function startTurn(s, p) {
  s.turn += 1;
  s.current = p;
  s.phase = "draw";
  const pl = s.players[p];
  pl.normalSummoned = false;
  pl.monsters.forEach((m) => {
    if (m) {
      m.attacked = false;
      m.posChanged = false;
    }
  });
  banner(s, p === "you" ? "Your turn" : "The Bug's turn", p);
  drawCards(s, p, 1);
  if (!s.winner) s.phase = "main1";
}

/** Battle Phase is allowed from Main 1, except on the very first turn of the duel. */
export const canEnterBattle = (s, p) => s.current === p && s.phase === "main1" && s.turn > 1 && !s.prompt;

export function enterBattle(s0) {
  const s = begin(s0);
  s.phase = "battle";
  log(s, `${who(s.current)} ${s.current === "you" ? "enter" : "enters"} the Battle Phase.`);
  return s;
}

export function toMain2(s0) {
  const s = begin(s0);
  s.phase = "main2";
  return s;
}

/** End Phase: drop temporary boosts, enforce the hand limit, then pass the turn. */
export function endTurn(s0) {
  const s = begin(s0);
  const p = s.current;
  const pl = s.players[p];
  pl.monsters.forEach((m) => m && (m.boost = 0));
  const extra = pl.hand.length - HAND_LIMIT;
  if (extra > 0) {
    if (p === "you") {
      s.phase = "end";
      s.prompt = { type: "discard", count: extra };
      return s;
    }
    // the Bug discards its weakest cards
    const sorted = [...pl.hand].sort((a, b) => (def(a).atk ?? 900) - (def(b).atk ?? 900));
    const drop = new Set(sorted.slice(0, extra).map((c) => c.uid));
    pl.gy.push(...pl.hand.filter((c) => drop.has(c.uid)));
    pl.hand = pl.hand.filter((c) => !drop.has(c.uid));
    log(s, `The Bug discards ${extra} card${extra > 1 ? "s" : ""} (hand limit).`);
  }
  startTurn(s, other(p));
  return s;
}

/** Discard one card from your hand while resolving the hand-limit prompt. */
export function discard(s0, uid) {
  const s = begin(s0);
  const pl = s.players.you;
  const c = pl.hand.find((x) => x.uid === uid);
  if (!c || s.prompt?.type !== "discard") return s0;
  pl.hand = pl.hand.filter((x) => x.uid !== uid);
  pl.gy.push(c);
  s.prompt.count -= 1;
  if (s.prompt.count <= 0) {
    s.prompt = null;
    startTurn(s, "bug");
  }
  return s;
}

/* ───────────── summoning ───────────── */

export function canNormalSummon(s, p, uid) {
  const pl = s.players[p];
  const c = def(pl.hand.find((x) => x.uid === uid));
  if (!c || c.kind !== "monster" || s.current !== p || !isMain(s) || pl.normalSummoned || s.prompt) return false;
  const need = tributesNeeded(c);
  const count = pl.monsters.filter(Boolean).length;
  return need === 0 ? count < ZONES : count >= need;
}

/** Normal Summon (or Set, face-down Defense). `tributes` are your monster zone indexes. */
export function normalSummon(s0, p, uid, { set = false, tributes = [] } = {}) {
  if (!canNormalSummon(s0, p, uid)) return s0;
  const s = begin(s0);
  const pl = s.players[p];
  const inst = pl.hand.find((x) => x.uid === uid);
  const c = def(inst);
  if (tributes.length < tributesNeeded(c)) return s0;
  tributes.forEach((z) => {
    const t = pl.monsters[z];
    if (t) {
      pl.monsters[z] = null;
      pl.gy.push({ uid: t.uid, cid: t.cid });
      event(s, { type: "tribute", side: p, zone: z, uid: t.uid });
    }
  });
  const zone = firstEmpty(pl.monsters);
  pl.hand = pl.hand.filter((x) => x.uid !== uid);
  pl.monsters[zone] = {
    uid: inst.uid,
    cid: inst.cid,
    pos: set ? "def" : "atk",
    faceUp: !set,
    turnPlaced: s.turn,
    attacked: false,
    posChanged: true,
    boost: 0,
  };
  pl.normalSummoned = true;
  event(s, { type: "summon", side: p, zone, uid: inst.uid, set });
  const tribTxt = tributes.length ? ` by tributing ${tributes.length} monster${tributes.length > 1 ? "s" : ""}` : "";
  log(s, set ? `${who(p)} ${p === "you" ? "set" : "sets"} a monster.` : `${who(p)} ${p === "you" ? "summon" : "summons"} ${c.name}${tribTxt}.`);
  return s;
}

/** Change battle position, or flip a face-down monster face-up into Attack Position. */
export function canChangePosition(s, p, zone) {
  const m = s.players[p].monsters[zone];
  return !!m && s.current === p && isMain(s) && !s.prompt && !m.posChanged && m.turnPlaced < s.turn;
}

export function changePosition(s0, p, zone) {
  if (!canChangePosition(s0, p, zone)) return s0;
  const s = begin(s0);
  const m = s.players[p].monsters[zone];
  if (!m.faceUp) {
    m.faceUp = true;
    m.pos = "atk";
    log(s, `${who(p)} flip-${p === "you" ? "summon" : "summons"} ${def(m).name}!`);
    event(s, { type: "flip", side: p, zone, uid: m.uid });
  } else {
    m.pos = m.pos === "atk" ? "def" : "atk";
    log(s, `${def(m).name} switches to ${m.pos === "atk" ? "Attack" : "Defense"} Position.`);
  }
  m.posChanged = true;
  return s;
}

/* ───────────── spells & traps ───────────── */

export function canSetSpellTrap(s, p, uid) {
  const pl = s.players[p];
  const c = def(pl.hand.find((x) => x.uid === uid));
  return !!c && c.kind !== "monster" && s.current === p && isMain(s) && !s.prompt && firstEmpty(pl.spells) !== -1;
}

export function setSpellTrap(s0, p, uid) {
  if (!canSetSpellTrap(s0, p, uid)) return s0;
  const s = begin(s0);
  const pl = s.players[p];
  const inst = pl.hand.find((x) => x.uid === uid);
  const zone = firstEmpty(pl.spells);
  pl.hand = pl.hand.filter((x) => x.uid !== uid);
  pl.spells[zone] = { uid: inst.uid, cid: inst.cid, faceUp: false, turnSet: s.turn };
  event(s, { type: "set", side: p, zone, uid: inst.uid });
  log(s, `${who(p)} ${p === "you" ? "set" : "sets"} a card face-down.`);
  return s;
}

/** Which targets a spell needs: null (none), "oppMonster" or "ownFaceUp". */
export function spellTarget(c) {
  if (c.effect === "destroy") return "oppMonster";
  if (c.effect === "boost") return "ownFaceUp";
  return null;
}

/** Can this spell's effect do anything right now? */
export function spellUsable(s, p, c) {
  const me = s.players[p];
  const opp = s.players[other(p)];
  switch (c.effect) {
    case "destroy":
      return opp.monsters.some(Boolean);
    case "boost":
      return me.monsters.some((m) => m && m.faceUp);
    case "revive":
      return me.gy.some((x) => def(x).kind === "monster") && firstEmpty(me.monsters) !== -1;
    case "draw2":
      return me.deck.length >= 2;
    default:
      return true;
  }
}

/** `ref` is { from: "hand", uid } or { from: "zone", zone }. */
export function canActivateSpell(s, p, ref) {
  if (s.current !== p || !isMain(s) || s.prompt) return false;
  const pl = s.players[p];
  const inst = ref.from === "hand" ? pl.hand.find((x) => x.uid === ref.uid) : pl.spells[ref.zone];
  const c = def(inst);
  if (!c || c.kind !== "spell") return false;
  if (ref.from === "hand" && firstEmpty(pl.spells) === -1) return false;
  return spellUsable(s, p, c);
}

/** `target` is a monster zone index (on the opponent's side for destroy, yours for boost). */
export function activateSpell(s0, p, ref, target = null) {
  if (!canActivateSpell(s0, p, ref)) return s0;
  const s = begin(s0);
  const pl = s.players[p];
  const o = other(p);
  let inst;
  if (ref.from === "hand") {
    inst = pl.hand.find((x) => x.uid === ref.uid);
    pl.hand = pl.hand.filter((x) => x.uid !== ref.uid);
  } else {
    inst = pl.spells[ref.zone];
    pl.spells[ref.zone] = null;
  }
  const c = def(inst);
  event(s, { type: "spell", side: p, cid: c.id });
  log(s, `${who(p)} ${p === "you" ? "activate" : "activates"} ${c.name}!`, "spell");
  banner(s, c.name, "spell");

  switch (c.effect) {
    case "destroy":
      if (target != null && s.players[o].monsters[target]) destroyMonster(s, o, target);
      break;
    case "draw2":
      drawCards(s, p, 2);
      break;
    case "heal":
      heal(s, p, 1000);
      log(s, `${who(p)} ${p === "you" ? "gain" : "gains"} 1000 LP.`, "good");
      break;
    case "boost": {
      const m = pl.monsters[target];
      if (m && m.faceUp) {
        m.boost = (m.boost || 0) + 700;
        event(s, { type: "boost", side: p, zone: target, uid: m.uid });
        log(s, `${def(m).name} gains 700 ATK this turn.`);
      }
      break;
    }
    case "revive": {
      const best = pl.gy
        .filter((x) => def(x).kind === "monster")
        .sort((a, b) => def(b).atk - def(a).atk)[0];
      const zone = firstEmpty(pl.monsters);
      if (best && zone !== -1) {
        pl.gy = pl.gy.filter((x) => x.uid !== best.uid);
        pl.monsters[zone] = { uid: best.uid, cid: best.cid, pos: "atk", faceUp: true, turnPlaced: s.turn, attacked: false, posChanged: true, boost: 0 };
        event(s, { type: "summon", side: p, zone, uid: best.uid, special: true });
        log(s, `${def(best).name} returns from the graveyard!`);
      }
      break;
    }
    case "burn":
      damage(s, o, 800);
      break;
    default:
      break;
  }
  pl.gy.push({ uid: inst.uid, cid: inst.cid });
  return s;
}

/** Face-down traps a player could activate right now (set on an earlier turn). */
export function activeTraps(s, p) {
  return s.players[p].spells
    .map((x, zone) => ({ x, zone }))
    .filter(({ x }) => x && def(x).kind === "trap" && x.turnSet < s.turn)
    .map(({ zone }) => zone);
}

/* ───────────── battle ───────────── */

export function canAttack(s, p, zone) {
  const m = s.players[p].monsters[zone];
  return !!m && s.current === p && s.phase === "battle" && !s.prompt && !s.pendingAttack && m.faceUp && m.pos === "atk" && !m.attacked;
}

export const canAttackDirectly = (s, p) => !s.players[other(p)].monsters.some(Boolean);

/**
 * Declare an attack. `target` is an opponent monster zone, or null for a direct attack.
 * Nothing happens yet: the attack waits in `pendingAttack` with an "attack" prompt so both
 * players can read what is about to happen. Then call `proceedAttack` (or `cancelAttack`).
 */
export function declareAttack(s0, p, zone, target) {
  if (!canAttack(s0, p, zone)) return s0;
  if (target == null && !canAttackDirectly(s0, p)) return s0;
  if (target != null && !s0.players[other(p)].monsters[target]) return s0;
  const s = begin(s0);
  const o = other(p);
  const m = s.players[p].monsters[zone];
  const tgt = target == null ? null : s.players[o].monsters[target];
  log(s, `${def(m).name} declares an attack on ${tgt ? (tgt.faceUp ? def(tgt).name : "a face-down monster") : "the LP directly"}!`);
  event(s, { type: "declare", side: p, zone, target, uid: m.uid });
  s.pendingAttack = { side: p, zone, target };
  s.prompt = { type: "attack", side: p };
  return s;
}

/** The attacker changes their mind before the attack goes through (you only). */
export function cancelAttack(s0) {
  if (s0.prompt?.type !== "attack" || s0.pendingAttack?.side !== "you") return s0;
  const s = begin(s0);
  s.prompt = null;
  s.pendingAttack = null;
  return s;
}

/**
 * Carry out the announced attack.
 *  - If you are defending, `yourTrap` is the zone of the trap you chose (or null).
 *  - If the Bug is defending, `chooseTrap(state, traps)` (ai.js) decides.
 */
export function proceedAttack(s0, { yourTrap = null, chooseTrap } = {}) {
  if (s0.prompt?.type !== "attack" || !s0.pendingAttack) return s0;
  const s = begin(s0);
  s.prompt = null;
  const { side, zone } = s.pendingAttack;
  const o = other(side);
  const m = s.players[side].monsters[zone];
  if (m) event(s, { type: "attack", side, zone, uid: m.uid });
  const traps = activeTraps(s, o);
  if (traps.length) {
    const pick = o === "you" ? (traps.includes(yourTrap) ? yourTrap : null) : chooseTrap ? chooseTrap(s, traps) : null;
    if (pick != null) return resolveTrap(s, o, pick, true);
  }
  return resolveAttack(s, true);
}

/**
 * What will happen if this attack goes through (ignoring traps).
 * `viewer` decides whether a face-down defender is known.
 * Returns { attacker, defender, known, lines: [{ text, tone }] }.
 */
export function previewAttack(s, side, zone, target, viewer = "you") {
  const o = other(side);
  const A = s.players[side].monsters[zone];
  if (!A) return null;
  const atk = atkOf(A);
  const aName = def(A).name;
  const lines = [];
  const lose = (p, n) => lines.push({ text: `${who(p)} ${p === "you" ? "lose" : "loses"} ${n} LP`, tone: p === viewer ? "bad" : "good" });
  const dies = (p, name) => lines.push({ text: `${name} is destroyed`, tone: p === viewer ? "bad" : "good" });

  if (target == null) {
    lose(o, atk);
    return { attacker: A, defender: null, known: true, lines };
  }
  const D = s.players[o].monsters[target];
  const known = D.faceUp || o === viewer;
  if (!known) {
    lines.push({ text: "The face-down monster is flipped face-up.", tone: "info" });
    lines.push({ text: `If its DEF is lower than ${atk}, it is destroyed. If it's higher, ${who(side)} ${side === "you" ? "take" : "takes"} the difference.`, tone: "info" });
    return { attacker: A, defender: D, known, lines };
  }
  const dName = def(D).name;
  if (!D.faceUp) lines.push({ text: `${dName} is flipped face-up.`, tone: "info" });
  if (D.pos === "atk") {
    const dAtk = atkOf(D);
    if (atk > dAtk) {
      dies(o, dName);
      lose(o, atk - dAtk);
    } else if (atk < dAtk) {
      dies(side, aName);
      lose(side, dAtk - atk);
    } else {
      dies(o, dName);
      dies(side, aName);
    }
  } else {
    const dDef = def(D).def;
    if (atk > dDef) {
      dies(o, dName);
      lines.push({ text: "No LP damage (it was in Defense Position).", tone: "info" });
    } else if (atk < dDef) lose(side, dDef - atk);
    else lines.push({ text: "Nothing is destroyed and nobody takes damage.", tone: "info" });
  }
  return { attacker: A, defender: D, known, lines };
}

/** Kept for older callers: answer a trap prompt during your defense. */
export function respondTrap(s0, zone) {
  return proceedAttack(s0, { yourTrap: zone });
}

function resolveTrap(s0, owner, zone, already = false) {
  const s = already ? s0 : begin(s0);
  const pl = s.players[owner];
  const trapInst = pl.spells[zone];
  const c = def(trapInst);
  const atk = s.pendingAttack;
  event(s, { type: "trap", side: owner, zone, cid: c.id });
  log(s, `${who(owner)} ${owner === "you" ? "activate" : "activates"} ${c.name}!`, "trap");
  banner(s, `Trap! ${c.name}`, "trap");
  sendSpellToGy(s, owner, zone);
  const attacker = s.players[atk.side].monsters[atk.zone];
  if (c.effect === "destroyAttacker") {
    destroyMonster(s, atk.side, atk.zone);
  } else {
    log(s, "The attack is negated.");
    if (attacker) attacker.attacked = true;
  }
  s.pendingAttack = null;
  return s;
}

function resolveAttack(s0, already = false) {
  const s = already ? s0 : begin(s0);
  const { side, zone, target } = s.pendingAttack;
  s.pendingAttack = null;
  const o = other(side);
  const A = s.players[side].monsters[zone];
  if (!A) return s;
  A.attacked = true;
  const atk = atkOf(A);

  if (target == null) {
    damage(s, o, atk);
    event(s, { type: "hit", side: o });
    return s;
  }
  const D = s.players[o].monsters[target];
  if (!D) return s;
  if (!D.faceUp) {
    D.faceUp = true;
    event(s, { type: "flip", side: o, zone: target, uid: D.uid });
    log(s, `The face-down monster is ${def(D).name}!`);
  }
  if (D.pos === "atk") {
    const dAtk = atkOf(D);
    if (atk > dAtk) {
      destroyMonster(s, o, target);
      damage(s, o, atk - dAtk);
    } else if (atk < dAtk) {
      destroyMonster(s, side, zone);
      damage(s, side, dAtk - atk);
    } else {
      destroyMonster(s, o, target);
      destroyMonster(s, side, zone);
    }
  } else {
    const dDef = def(D).def;
    if (atk > dDef) destroyMonster(s, o, target);
    else if (atk < dDef) damage(s, side, dDef - atk);
    else log(s, "Neither monster is destroyed.");
  }
  return s;
}
