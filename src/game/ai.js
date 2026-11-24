import {
  def,
  atkOf,
  other,
  tributesNeeded,
  canNormalSummon,
  normalSummon,
  canSetSpellTrap,
  setSpellTrap,
  canActivateSpell,
  activateSpell,
  canChangePosition,
  changePosition,
  canEnterBattle,
  enterBattle,
  toMain2,
  endTurn,
  canAttack,
  canAttackDirectly,
  declareAttack,
} from "./engine";

/**
 * The Bug's brain. `aiStep` performs ONE visible action per call so the UI can animate
 * each move; call it repeatedly while it's the Bug's turn and no prompt is open.
 */

const AI = "bug";
const HUMAN = "you";

/** Strongest face-up ATK on your side (what the Bug has to beat). */
function humanThreat(s) {
  return Math.max(0, ...s.players[HUMAN].monsters.filter((m) => m && m.faceUp && m.pos === "atk").map(atkOf));
}

/** Pick a spell to cast now, with its target. */
function pickSpell(s) {
  const me = s.players[AI];
  const opp = s.players[HUMAN];
  const refs = [
    ...me.hand.map((x) => ({ ref: { from: "hand", uid: x.uid }, inst: x })),
    ...me.spells.map((x, zone) => (x ? { ref: { from: "zone", zone }, inst: x } : null)).filter(Boolean),
  ].filter(({ inst }) => def(inst).kind === "spell");

  for (const { ref, inst } of refs) {
    const c = def(inst);
    if (!canActivateSpell(s, AI, ref)) continue;
    switch (c.effect) {
      case "burn":
      case "draw2":
        return { ref };
      case "heal":
        if (me.lp <= 7000) return { ref };
        break;
      case "destroy": {
        // hit the biggest threat (face-up ATK first, otherwise any monster)
        const zones = opp.monsters.map((m, z) => (m ? z : -1)).filter((z) => z >= 0);
        const target = zones.sort((a, b) => score(opp.monsters[b]) - score(opp.monsters[a]))[0];
        if (target != null) return { ref, target };
        break;
      }
      case "boost": {
        if (s.phase !== "main1" || s.turn < 2) break;
        // only if the extra 700 lets an attacker win a fight it would otherwise lose
        const threat = humanThreat(s);
        const z = me.monsters.findIndex((m) => m && m.faceUp && m.pos === "atk" && atkOf(m) <= threat && atkOf(m) + 700 > threat);
        if (z !== -1) return { ref, target: z };
        break;
      }
      case "revive":
        return { ref };
      default:
        break;
    }
  }
  return null;
}

const score = (m) => (m.faceUp ? atkOf(m) + 500 : 1500);

const blunders = (s) => Math.random() < (s.ai?.blunder ?? 0);

/** Choose a Normal Summon (or Set) with tributes. */
function pickSummon(s) {
  const me = s.players[AI];
  if (blunders(s)) {
    // careless: throw out any monster that doesn't need tributes, face-up
    const any = me.hand.find((x) => canNormalSummon(s, AI, x.uid) && !tributesNeeded(def(x)));
    if (any) return { uid: any.uid, set: false, tributes: [] };
  }
  const threat = humanThreat(s);
  const options = me.hand
    .filter((x) => canNormalSummon(s, AI, x.uid))
    .map((x) => ({ x, c: def(x) }))
    .sort((a, b) => b.c.atk - a.c.atk);
  if (!options.length) return null;

  for (const { x, c } of options) {
    const need = tributesNeeded(c);
    if (need) {
      const mine = me.monsters.map((m, z) => (m ? { m, z } : null)).filter(Boolean).sort((a, b) => atkOf(a.m) - atkOf(b.m));
      const fodder = mine.slice(0, need);
      const lost = fodder.reduce((t, { m }) => t + atkOf(m), 0);
      if (fodder.length === need && c.atk > lost) return { uid: x.uid, set: false, tributes: fodder.map((f) => f.z) };
      continue;
    }
    if (c.atk >= threat) return { uid: x.uid, set: false, tributes: [] };
  }
  // nothing beats the threat: set the sturdiest wall
  const walls = options.filter(({ c }) => !tributesNeeded(c)).sort((a, b) => b.c.def - a.c.def);
  return walls.length ? { uid: walls[0].x.uid, set: true, tributes: [] } : null;
}

function pickPositionChange(s) {
  const me = s.players[AI];
  const threat = humanThreat(s);
  for (let z = 0; z < me.monsters.length; z++) {
    const m = me.monsters[z];
    if (!m || !canChangePosition(s, AI, z)) continue;
    const c = def(m);
    if (!m.faceUp && c.atk > threat) return z; // flip it up and fight
    if (m.faceUp && m.pos === "atk" && atkOf(m) < threat && c.def > atkOf(m)) return z; // hide behind DEF
    if (m.faceUp && m.pos === "def" && atkOf(m) > threat) return z; // safe to go on the offensive
  }
  return null;
}

/** Pick the next attack: the best monster it can beat, or a direct hit. */
function pickAttack(s) {
  const me = s.players[AI];
  const opp = s.players[HUMAN];
  const attackers = me.monsters
    .map((m, z) => ({ m, z }))
    .filter(({ z }) => canAttack(s, AI, z))
    .sort((a, b) => atkOf(b.m) - atkOf(a.m));
  for (const { m, z } of attackers) {
    if (canAttackDirectly(s, AI)) return { zone: z, target: null };
    if (blunders(s)) {
      // careless: charge at any monster
      const any = opp.monsters.findIndex(Boolean);
      if (any !== -1) return { zone: z, target: any };
    }
    const atk = atkOf(m);
    let best = null;
    opp.monsters.forEach((d, t) => {
      if (!d) return;
      const beats = d.faceUp ? (d.pos === "atk" ? atkOf(d) < atk : def(d).def < atk) : atk >= 1800;
      const value = d.faceUp ? (d.pos === "atk" ? atkOf(d) + 1000 : def(d).def) : 800;
      if (beats && (!best || value > best.value)) best = { t, value };
    });
    if (best) return { zone: z, target: best.t };
  }
  return null;
}

/** When you attack: should the Bug spring a trap? Returns the trap zone or null. */
export function chooseTrap(s, traps) {
  const { side, zone, target } = s.pendingAttack;
  const attacker = s.players[side].monsters[zone];
  const atk = atkOf(attacker);
  const me = s.players[AI];
  let hurts;
  if (target == null) hurts = atk >= 1000;
  else {
    const d = me.monsters[target];
    hurts = d.pos === "atk" ? atk >= atkOf(d) : atk > def(d).def;
  }
  if (!hurts || Math.random() >= (s.ai?.traps ?? 1)) return null;
  const destroyer = traps.find((z) => def(me.spells[z]).effect === "destroyAttacker");
  return destroyer ?? traps[0];
}

export function aiStep(s) {
  if (s.winner || s.current !== AI || s.prompt) return s;

  if (s.phase === "main1" || s.phase === "main2") {
    const spell = pickSpell(s);
    if (spell) return activateSpell(s, AI, spell.ref, spell.target ?? null);
    if (!s.players[AI].normalSummoned) {
      const sum = pickSummon(s);
      if (sum) return normalSummon(s, AI, sum.uid, { set: sum.set, tributes: sum.tributes });
    }
    const flip = pickPositionChange(s);
    if (flip != null) return changePosition(s, AI, flip);
    const trap = s.players[AI].hand.find((x) => def(x).kind === "trap" && canSetSpellTrap(s, AI, x.uid));
    if (trap) return setSpellTrap(s, AI, trap.uid);
    if (s.phase === "main1") return canEnterBattle(s, AI) ? enterBattle(s) : toMain2(s);
    return endTurn(s);
  }

  if (s.phase === "battle") {
    const atk = pickAttack(s);
    if (atk) return declareAttack(s, AI, atk.zone, atk.target);
    return toMain2(s);
  }

  return s;
}

export const opponentOf = other;
