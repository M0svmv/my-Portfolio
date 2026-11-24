import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GiCrossedSwords } from "react-icons/gi";
import { FaBug, FaBookOpen, FaWrench, FaTriangleExclamation, FaCircleQuestion, FaCircleInfo, FaLightbulb, FaCode, FaShieldHalved, FaXmark, FaRotateRight, FaTrophy, FaSkull, FaHeart, FaLock, FaArrowRight, FaLayerGroup, FaHand } from "react-icons/fa6";
import { GameCard, CardBack } from "./GameCard";
import { CARDS, toGameCard } from "../game/cards";
import { LEVELS, loadUnlocked, unlockNext } from "../game/levels";
import { BUG_INFO } from "../game/bugInfo";
import { DEV_INFO } from "../game/devInfo";
import * as E from "../game/engine";
import { aiStep, chooseTrap } from "../game/ai";
import useMediaQuery from "../hooks/useMediaQuery";
import "./BugHunt.css";

const PHASES = [
  ["draw", "Draw"],
  ["main1", "Main 1"],
  ["battle", "Battle"],
  ["main2", "Main 2"],
  ["end", "End"],
];
const AI_DELAY = 1400; // slow enough to read every move
const LUNGE_MS = 420;

/* ───────────── panels ───────────── */

function Rules({ onClose, label }) {
  return (
    <motion.div className="bh-panel" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
      <FaBug className="bh-panel__icon" aria-hidden="true" />
      <h2>How to play</h2>
      <p className="bh-panel__sub">You're the developer. Debug the codebase before the bugs crash production.</p>
      <div className="bh-rules">
        <section>
          <h3>Your turn</h3>
          <ul>
            <li><b>Draw</b> a card (the first player skips this on turn 1).</li>
            <li><b>Main Phase:</b> Normal Summon or Set <b>one</b> monster per turn. Level 5–6 needs 1 tribute, level 7+ needs 2.</li>
            <li>Play Spells, Set Spells/Traps, and switch a monster's position once per turn.</li>
            <li><b>Battle Phase:</b> each Attack-Position monster can attack once (not on turn 1).</li>
            <li>Hand limit: 6 at the end of your turn.</li>
          </ul>
        </section>
        <section>
          <h3>Battle</h3>
          <ul>
            <li><b>ATK vs ATK:</b> the weaker is destroyed and its owner loses the difference.</li>
            <li><b>ATK vs DEF:</b> higher ATK destroys the defender (no damage). Higher DEF damages the attacker's owner.</li>
            <li>No monsters? Attack directly. First to 0 LP — or an empty deck — loses.</li>
            <li><b>Traps</b> must be Set first; they trigger when the opponent attacks, from the next turn on.</li>
          </ul>
        </section>
      </div>
      <p className="bh-panel__tip">Hover or click any card to see it in the side panel — click your own cards to act.</p>
      <button type="button" className="bh-btn bh-btn--gold" onClick={onClose} autoFocus>
        <GiCrossedSwords aria-hidden="true" /> {label}
      </button>
    </motion.div>
  );
}

/** Renders `inline code` inside explanation strings. */
function Rich({ text }) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : <span key={i}>{part}</span>
  );
}

/** "What is this bug / how does it show up / how to fix it" box. */
function BugExplainer({ id, compact = false }) {
  const dev = DEV_INFO[id];
  if (dev) {
    return (
      <div className={`bh-explain ${compact ? "is-compact" : ""}`}>
        <p>
          <span className="bh-explain__tag is-devwhat">
            <FaCode aria-hidden="true" /> What is it?
          </span>
          <Rich text={dev.what} />
        </p>
        <p>
          <span className="bh-explain__tag is-fix">
            <FaShieldHalved aria-hidden="true" /> How it beats bugs
          </span>
          <Rich text={dev.power} />
        </p>
        <p>
          <span className="bh-explain__tag is-tip">
            <FaLightbulb aria-hidden="true" /> Play tip
          </span>
          <Rich text={dev.tip} />
        </p>
      </div>
    );
  }
  const info = BUG_INFO[id];
  if (!info) return null;
  return (
    <div className={`bh-explain ${compact ? "is-compact" : ""}`}>
      <p>
        <span className="bh-explain__tag is-what">
          <FaBug aria-hidden="true" /> What is it?
        </span>
        <Rich text={info.what} />
      </p>
      <p>
        <span className="bh-explain__tag is-sign">
          <FaTriangleExclamation aria-hidden="true" /> How it shows up
        </span>
        <Rich text={info.sign} />
      </p>
      <p>
        <span className="bh-explain__tag is-fix">
          <FaWrench aria-hidden="true" /> How to fix it
        </span>
        <Rich text={info.fix} />
      </p>
    </div>
  );
}

/** Every bug in the game, with its real-world explanation. */
function BugGuide({ onClose }) {
  const [tab, setTab] = useState("bugs");
  const source = tab === "bugs" ? BUG_INFO : DEV_INFO;
  const cards = Object.keys(source).map((id) => CARDS[id]).filter(Boolean);
  const monsters = cards.filter((c) => c.kind === "monster").sort((a, b) => a.level - b.level || a.atk - b.atk);
  const others = cards.filter((c) => c.kind !== "monster");
  const [pick, setPick] = useState(monsters[0].id);
  const switchTab = (t) => {
    setTab(t);
    const first = Object.keys(t === "bugs" ? BUG_INFO : DEV_INFO).map((id) => CARDS[id]).filter((c) => c.kind === "monster").sort((a, b) => a.level - b.level || a.atk - b.atk)[0];
    setPick(first.id);
  };
  const c = CARDS[pick];
  return (
    <motion.div className="bh-panel bh-panel--guide" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
      <button type="button" className="bh-icon bh-guide__close" onClick={onClose} aria-label="Close">
        <FaXmark />
      </button>
      <h2>
        <FaBookOpen aria-hidden="true" /> Card Guide
      </h2>
      <div className="bh-guide__tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "bugs"} className={tab === "bugs" ? "is-on" : ""} onClick={() => switchTab("bugs")}>
          <FaBug aria-hidden="true" /> The bugs
        </button>
        <button type="button" role="tab" aria-selected={tab === "dev"} className={tab === "dev" ? "is-on" : ""} onClick={() => switchTab("dev")}>
          <FaCode aria-hidden="true" /> Your developer deck
        </button>
      </div>
      <p className="bh-panel__sub">
        {tab === "bugs"
          ? "Every bug in Bug Hunt is a real bug developers fight every day — what it is, how it shows up and how to fix it."
          : "Your cards are real tools and practices — what each one is, how it helps beat bugs, and how to play it."}
      </p>
      <div className="bh-guide">
        <div className="bh-guide__list">
          {[[tab === "bugs" ? "Bug monsters" : "Developer monsters", monsters], [tab === "bugs" ? "Bug spells & traps" : "Fixes (spells & traps)", others]].map(([title, list]) => (
            <section key={title}>
              <h3>{title}</h3>
              <ul>
                {list.map((b) => (
                  <li key={b.id}>
                    <button type="button" className={pick === b.id ? "is-on" : ""} onClick={() => setPick(b.id)}>
                      <span className="bh-guide__icon" style={{ color: b.art.color }}>
                        <b.art.Icon aria-hidden="true" />
                      </span>
                      {b.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.article key={pick} className="bh-guide__detail" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <div className="bh-guide__card">
              <GameCard card={toGameCard(c)} />
            </div>
            <div>
              <h3>{c.name}</h3>
              <p className="bh-inspect__type">
                {c.kind === "monster" ? `[ ${c.attr} / Level ${c.level} ] · ATK ${c.atk} / DEF ${c.def}` : c.kind === "spell" ? "[ Spell ]" : "[ Trap ]"}
              </p>
              <p className="bh-guide__flavor">“{c.text}”</p>
              <BugExplainer id={c.id} />
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function LevelSelect({ unlocked, onPick, onRules, onGuide, onClose }) {
  return (
    <div className="bh-levels">
      <header className="bh-levels__head">
        <div>
          <p className="bh-levels__eyebrow">
            <FaBug aria-hidden="true" /> Bug Hunt
          </p>
          <h2>Choose a level</h2>
          <p>Beat a level to unlock the next. Your progress is saved in this browser.</p>
        </div>
        <div className="bh-levels__actions">
          <button type="button" className="bh-btn" onClick={onRules}>
            <FaCircleQuestion aria-hidden="true" /> How to play
          </button>
          <button type="button" className="bh-btn bh-btn--gold" onClick={onGuide}>
            <FaBookOpen aria-hidden="true" /> Card Guide
          </button>
          <button type="button" className="bh-icon" onClick={onClose} aria-label="Leave the game">
            <FaXmark />
          </button>
        </div>
      </header>
      <ol className="bh-levels__grid">
        {LEVELS.map((lv, i) => {
          const locked = lv.id > unlocked;
          return (
            <motion.li
              key={lv.id}
              initial={{ opacity: 0, y: 40, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0, transition: { delay: i * 0.08, type: "spring", stiffness: 160, damping: 18 } }}
            >
              <button
                type="button"
                className={`bh-level ${locked ? "is-locked" : ""}`}
                disabled={locked}
                onClick={() => onPick(lv.id)}
                aria-label={locked ? `Level ${lv.id} locked` : `Play level ${lv.id}: ${lv.name}`}
              >
                <span className="bh-level__num">Level {lv.id}</span>
                <span className="bh-level__card">
                  <GameCard card={toGameCard(CARDS[lv.bossCard])} />
                  {locked && (
                    <span className="bh-level__lock">
                      <FaLock />
                    </span>
                  )}
                </span>
                <strong>{lv.name}</strong>
                <span className="bh-level__blurb">{lv.blurb}</span>
                <span className="bh-level__meta">
                  <span>
                    <FaHeart aria-hidden="true" /> {lv.bugLp}
                  </span>
                  <span className="bh-level__diff" aria-label={`Difficulty ${lv.id} of ${LEVELS.length}`}>
                    {LEVELS.map((l) => (
                      <i key={l.id} className={l.id <= lv.id ? "is-on" : ""} />
                    ))}
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function GameOver({ s, onAgain, onNext, onLevels }) {
  const win = s.winner === "you";
  const level = LEVELS.find((l) => l.id === s.level);
  const hasNext = win && s.level < LEVELS.length;
  return (
    <motion.div className={`bh-panel bh-panel--${win ? "win" : "lose"}`} initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
      {win &&
        Array.from({ length: 18 }, (_, i) => (
          <motion.span
            key={i}
            className="bh-spark"
            aria-hidden="true"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: Math.cos((i / 18) * 6.283) * 190, y: Math.sin((i / 18) * 6.283) * 150, opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
          />
        ))}
      {win ? <FaTrophy className="bh-panel__icon" aria-hidden="true" /> : <FaSkull className="bh-panel__icon" aria-hidden="true" />}
      <h2>{win ? (s.level === LEVELS.length ? "Codebase saved!" : "Level cleared!") : "Production is down"}</h2>
      <p className="bh-panel__sub">
        {win
          ? s.level === LEVELS.length
            ? "You beat every level. Ship it! 🚀"
            : `${level.name} is fixed — Level ${s.level + 1} is unlocked.`
          : "The bugs won this time. Time for a post-mortem."}
      </p>
      <dl className="bh-stats">
        <div>
          <dt>Turns</dt>
          <dd>{s.turn}</dd>
        </div>
        <div>
          <dt>Your LP</dt>
          <dd>{s.players.you.lp}</dd>
        </div>
        <div>
          <dt>Bug LP</dt>
          <dd>{s.players.bug.lp}</dd>
        </div>
      </dl>
      <div className="bh-panel__actions">
        {hasNext && (
          <button type="button" className="bh-btn bh-btn--gold" onClick={onNext} autoFocus>
            Next level <FaArrowRight aria-hidden="true" />
          </button>
        )}
        <button type="button" className={`bh-btn ${hasNext ? "" : "bh-btn--gold"}`} onClick={onAgain} autoFocus={!hasNext}>
          <FaRotateRight aria-hidden="true" /> {win ? "Replay" : "Try again"}
        </button>
        <button type="button" className="bh-btn" onClick={onLevels}>
          Level select
        </button>
      </div>
    </motion.div>
  );
}

/* ───────────── board pieces ───────────── */

function PlayerBox({ side, pl, name, events, active }) {
  const hits = events.filter((e) => e.type === "lp" && e.side === side);
  const pct = Math.min(1, pl.lp / pl.maxLp);
  return (
    <div className={`bh-player bh-player--${side} ${active ? "is-active" : ""}`}>
      <span className="bh-player__avatar">{side === "you" ? <GiCrossedSwords aria-hidden="true" /> : <FaBug aria-hidden="true" />}</span>
      <div className="bh-player__info">
        <span className="bh-player__name">{name}</span>
        <div className="bh-player__bar">
          <motion.div className={`bh-player__fill ${pct < 0.3 ? "is-low" : ""}`} animate={{ width: `${pct * 100}%` }} transition={{ type: "spring", stiffness: 110, damping: 20 }} />
        </div>
        <span className="bh-player__counts">
          <span title="Cards in hand">
            <FaHand aria-hidden="true" /> {pl.hand.length}
          </span>
          <span title="Cards in deck">
            <FaLayerGroup aria-hidden="true" /> {pl.deck.length}
          </span>
        </span>
      </div>
      <motion.span key={pl.lp} className="bh-player__lp" initial={{ scale: 1.25 }} animate={{ scale: 1 }}>
        <small>LP</small>
        {pl.lp}
      </motion.span>
      <AnimatePresence>
        {hits.map((h) => (
          <motion.span
            key={h.id}
            className={`bh-player__delta ${h.amount > 0 ? "is-heal" : ""}`}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: side === "you" ? -40 : 40 }}
            transition={{ duration: 1.5, times: [0, 0.12, 0.7, 1] }}
          >
            {h.amount > 0 ? `+${h.amount}` : h.amount}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Pile({ label, count, top, onClick, back, onHover }) {
  return (
    <button
      type="button"
      className="bh-pile"
      onClick={onClick}
      disabled={!onClick}
      onMouseEnter={top && onHover ? () => onHover(top) : undefined}
      aria-label={`${label}: ${count} cards`}
    >
      {count > 0 ? back ? <CardBack /> : top ? <GameCard card={toGameCard(E.def(top))} /> : null : <span className="bh-pile__empty" />}
      <span className="bh-pile__label">
        {label} · {count}
      </span>
    </button>
  );
}

function MonsterInZone({ m, side, lunge, targetable, selected, onClick, onHover }) {
  const c = E.def(m);
  const boosted = (m.boost || 0) > 0;
  return (
    <motion.button
      type="button"
      className={`bh-card bh-mon ${m.pos === "def" ? "is-def" : ""} ${targetable ? "is-target" : ""} ${selected ? "is-selected" : ""}`}
      onClick={onClick}
      onMouseEnter={onHover}
      aria-label={m.faceUp || side === "you" ? `${c.name}, ${m.pos === "atk" ? "Attack" : "Defense"} position` : "Face-down monster"}
      initial={{ opacity: 0, scale: 1.5, y: side === "you" ? 60 : -60 }}
      animate={
        lunge
          ? { opacity: 1, scale: 1.12, y: side === "you" ? "-55%" : "55%", rotate: m.pos === "def" ? 90 : 0 }
          : { opacity: 1, scale: 1, y: 0, rotate: m.pos === "def" ? 90 : 0 }
      }
      exit={{ opacity: 0, scale: 0.4, rotate: 35, filter: "brightness(2.5)", transition: { duration: 0.4 } }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <span className="bh-card__face">
        {m.faceUp ? <GameCard card={toGameCard(c)} /> : <CardBack />}
        {!m.faceUp && side === "you" && <span className="bh-card__peek">{c.name}</span>}
      </span>
      {(m.faceUp || side === "you") && (
        <span className={`bh-stats-badge ${boosted ? "is-boosted" : ""}`}>
          <b>{E.atkOf(m)}</b>/<i>{c.def}</i>
        </span>
      )}
    </motion.button>
  );
}

function SpellInZone({ x, side, selected, onClick, onHover }) {
  const c = E.def(x);
  return (
    <motion.button
      type="button"
      className={`bh-card bh-st ${selected ? "is-selected" : ""}`}
      onClick={onClick}
      onMouseEnter={onHover}
      aria-label={side === "you" ? `Set ${c.kind}: ${c.name}` : "Face-down spell or trap"}
      initial={{ opacity: 0, y: side === "you" ? 40 : -40, rotateY: 90 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      exit={{ opacity: 0, scale: 1.4, filter: "brightness(2)", transition: { duration: 0.35 } }}
    >
      <CardBack />
      {side === "you" && <span className="bh-card__peek">{c.name}</span>}
    </motion.button>
  );
}

/** Big card + its details, like the portfolio's side inspector. */
function Inspector({ shown, actions }) {
  const key = shown ? `${shown.c?.id}-${shown.hidden ? "h" : "v"}` : "none";
  return (
    <div className="bh-inspect">
      <div className="bh-inspect__stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={key}
            className="bh-inspect__card"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ rotateY: 90, opacity: 0, transition: { duration: 0.14 } }}
          >
            {shown && !shown.hidden ? <GameCard card={toGameCard(shown.c)} /> : <CardBack />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="bh-inspect__body">
        {shown && !shown.hidden ? (
          <>
            <h3>{shown.c.name}</h3>
            <p className="bh-inspect__type">
              {shown.c.kind === "monster" ? `[ ${shown.c.attr} / Level ${shown.c.level} ]` : shown.c.kind === "spell" ? "[ Spell Card ]" : "[ Trap Card ]"}
            </p>
            {shown.c.kind === "monster" && (
              <p className="bh-inspect__stats">
                <span>
                  ATK <b>{shown.c.atk}</b>
                </span>
                <span>
                  DEF <b>{shown.c.def}</b>
                </span>
                {E.tributesNeeded(shown.c) > 0 && <span className="bh-inspect__trib">{E.tributesNeeded(shown.c)} tribute{E.tributesNeeded(shown.c) > 1 ? "s" : ""}</span>}
              </p>
            )}
            <p className="bh-inspect__text">{shown.c.text}</p>
            <BugExplainer id={shown.c.id} compact />
          </>
        ) : (
          <p className="bh-inspect__text bh-inspect__text--muted">{shown ? "A face-down card. You'll find out when it flips…" : "Hover or click a card to inspect it."}</p>
        )}
        {actions.length > 0 && (
          <div className="bh-actions">
            {actions.map((a) => (
              <button key={a.label} type="button" className={`bh-btn ${a.primary ? "bh-btn--gold" : ""}`} onClick={a.run}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Buttons that pop up right above the selected card. */
function ActionBar({ actions, onInfo, below = false }) {
  if (!actions.length && !onInfo) return null;
  return (
    <motion.div
      className={`bh-actbar ${below ? "is-below" : ""}`}
      role="toolbar"
      aria-label="Card actions"
      initial={{ opacity: 0, y: below ? -8 : 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
      onClick={(e) => e.stopPropagation()}
    >
      {actions.map((a) => (
        <button key={a.label} type="button" className={`bh-actbar__btn ${a.primary ? "is-primary" : ""}`} onClick={a.run}>
          {a.label}
        </button>
      ))}
      {onInfo && (
        <button type="button" className="bh-actbar__btn is-info" onClick={onInfo} aria-label="Card info">
          <FaCircleInfo />
        </button>
      )}
    </motion.div>
  );
}

/** The attack is announced: show both cards and exactly what will happen. */
function BattlePanel({ s, onAttack, onCancel, onContinue }) {
  const a = s.pendingAttack;
  const attackerSide = a.side;
  const defenderSide = attackerSide === "you" ? "bug" : "you";
  const pv = E.previewAttack(s, attackerSide, a.zone, a.target, "you");
  if (!pv) return null;
  const A = pv.attacker;
  const D = pv.defender;
  const myTraps = attackerSide === "bug" ? E.activeTraps(s, "you") : [];
  const bugSetCards = s.players.bug.spells.filter(Boolean).length;
  const showD = D && (D.faceUp || defenderSide === "you");
  return (
    <motion.div className="bh-panel bh-panel--battle" initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <h2>{attackerSide === "you" ? "Your attack" : "The Bug attacks!"}</h2>
      <div className="bh-vs">
        <div className="bh-vs__side">
          <motion.div className="bh-vs__card" initial={{ x: -30, rotate: -6 }} animate={{ x: 0, rotate: 0 }}>
            <GameCard card={toGameCard(E.def(A))} />
          </motion.div>
          <span className="bh-vs__stat is-atk">ATK {E.atkOf(A)}</span>
        </div>
        <motion.span className="bh-vs__icon" initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.15 }}>
          <GiCrossedSwords aria-hidden="true" />
        </motion.span>
        <div className="bh-vs__side">
          {D ? (
            <>
              <motion.div className="bh-vs__card" initial={{ x: 30, rotate: 6 }} animate={{ x: 0, rotate: D.pos === "def" ? 90 : 0, scale: D.pos === "def" ? 0.8 : 1 }}>
                {showD ? <GameCard card={toGameCard(E.def(D))} /> : <CardBack />}
              </motion.div>
              <span className={`bh-vs__stat ${D.pos === "atk" ? "is-atk" : "is-def"}`}>
                {showD ? (D.pos === "atk" ? `ATK ${E.atkOf(D)}` : `DEF ${E.def(D).def}`) : "Face-down"}
                <small>{D.pos === "atk" ? "Attack Position" : "Defense Position"}</small>
              </span>
            </>
          ) : (
            <div className="bh-vs__direct">
              <FaHeart aria-hidden="true" />
              <strong>{defenderSide === "you" ? "Your LP" : "Bug LP"}</strong>
              <span>{s.players[defenderSide].lp}</span>
            </div>
          )}
        </div>
      </div>
      <div className="bh-outcome">
        <h3>What will happen</h3>
        <ul>
          {pv.lines.map((l, i) => (
            <motion.li key={i} className={`is-${l.tone}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.25 + i * 0.12 } }}>
              {l.text}
            </motion.li>
          ))}
        </ul>
        {attackerSide === "you" && bugSetCards > 0 && (
          <p className="bh-outcome__warn">
            <FaTriangleExclamation aria-hidden="true" /> The Bug has {bugSetCards} face-down card{bugSetCards > 1 ? "s" : ""} — it could be a trap!
          </p>
        )}
        {attackerSide === "bug" && myTraps.length > 0 && <p className="bh-outcome__warn is-good">You can stop this with a trap you have set:</p>}
      </div>
      <div className="bh-panel__actions">
        {attackerSide === "you" ? (
          <>
            <button type="button" className="bh-btn bh-btn--gold" onClick={onAttack} autoFocus>
              <GiCrossedSwords aria-hidden="true" /> Attack!
            </button>
            <button type="button" className="bh-btn" onClick={onCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            {myTraps.map((z) => (
              <button key={z} type="button" className="bh-btn bh-btn--trap" onClick={() => onContinue(z)}>
                Activate {E.def(s.players.you.spells[z]).name}
              </button>
            ))}
            <button type="button" className={`bh-btn ${myTraps.length ? "" : "bh-btn--gold"}`} onClick={() => onContinue(null)} autoFocus={!myTraps.length}>
              {myTraps.length ? "Let it through" : "Continue"}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ───────────── the game ───────────── */

export default function BugHunt({ onClose }) {
  const [screen, setScreen] = useState("levels"); // levels | play
  const [unlocked, setUnlocked] = useState(loadUnlocked);
  const [s, setS] = useState(() => E.newGame(1));
  const [rules, setRules] = useState(false);
  const [sel, setSel] = useState(null); // { kind: "hand"|"mon"|"st"|"gy", side, uid|zone }
  const [hover, setHover] = useState(null); // same shape, or { kind: "inst", inst }
  const [mode, setMode] = useState(null); // tribute | spellTarget | attack
  const [lunge, setLunge] = useState(null);
  const [gy, setGy] = useState(null);
  const [guide, setGuide] = useState(false);
  const [info, setInfo] = useState(false); // phones: card details sheet
  const compact = useMediaQuery("(max-width: 900px)");

  const me = s.players.you;
  const bug = s.players.bug;
  const level = LEVELS.find((l) => l.id === s.level);
  const playing = screen === "play";
  const myTurn = playing && s.current === "you" && !s.winner;
  const busy = !!lunge;

  const start = (id) => {
    setS(E.newGame(id));
    setSel(null);
    setHover(null);
    setMode(null);
    setScreen("play");
  };

  /** Commit a new state, playing an attack lunge first if it contains one. */
  const commit = useCallback(
    (next) => {
      const atk = next.events?.find((e) => e.type === "attack");
      if (atk && next !== s) {
        setLunge(atk.uid);
        setTimeout(() => {
          setLunge(null);
          setS(next);
        }, LUNGE_MS);
      } else setS(next);
    },
    [s]
  );

  // The Bug plays one action at a time.
  useEffect(() => {
    if (!playing || rules || s.winner || s.current !== "bug" || s.prompt || busy) return;
    const t = setTimeout(() => commit(aiStep(s)), AI_DELAY);
    return () => clearTimeout(t);
  }, [s, playing, rules, busy, commit]);

  // Unlock the next level on a win.
  useEffect(() => {
    if (s.winner === "you") setUnlocked(unlockNext(s.level));
  }, [s.winner, s.level]);

  useEffect(() => setMode(null), [s.current, s.phase]);
  useEffect(() => {
    if (!sel) setInfo(false);
  }, [sel]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (guide) setGuide(false);
      else if (gy) setGy(null);
      else if (rules) setRules(false);
      else if (mode) setMode(null);
      else if (sel) setSel(null);
      else if (playing) setScreen("levels");
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guide, gy, rules, mode, sel, playing, onClose]);

  /* ── resolve a selection/hover reference to a card ── */
  const resolveRef = useCallback(
    (ref) => {
      if (!ref) return null;
      if (ref.kind === "inst") return { inst: ref.inst, c: E.def(ref.inst), hidden: false };
      const pl = s.players[ref.side];
      if (ref.kind === "hand") {
        const inst = pl.hand.find((x) => x.uid === ref.uid);
        return inst ? { inst, c: E.def(inst), hidden: false } : null;
      }
      const inst = ref.kind === "mon" ? pl.monsters[ref.zone] : pl.spells[ref.zone];
      if (!inst) return null;
      return { inst, c: E.def(inst), hidden: ref.side === "bug" && !inst.faceUp };
    },
    [s]
  );
  const selected = useMemo(() => resolveRef(sel), [resolveRef, sel]);
  const shown = useMemo(() => resolveRef(hover) || selected, [resolveRef, hover, selected]);

  /* ── legal actions for the selected card ── */
  const actions = [];
  if (selected && myTurn && !busy && !s.prompt) {
    const { inst, c } = selected;
    if (sel.kind === "hand" && sel.side === "you") {
      if (c.kind === "monster" && E.canNormalSummon(s, "you", inst.uid)) {
        const need = E.tributesNeeded(c);
        const go = (set) =>
          need ? setMode({ type: "tribute", uid: inst.uid, set, need, chosen: [] }) : (commit(E.normalSummon(s, "you", inst.uid, { set })), setSel(null));
        actions.push({ label: need ? `Tribute Summon (${need})` : "Normal Summon", primary: true, run: () => go(false) });
        actions.push({ label: need ? `Tribute Set (${need})` : "Set", run: () => go(true) });
      }
      if (c.kind === "spell" && E.canActivateSpell(s, "you", { from: "hand", uid: inst.uid })) {
        actions.push({ label: "Activate", primary: true, run: () => activate({ from: "hand", uid: inst.uid }, c) });
      }
      if (c.kind !== "monster" && E.canSetSpellTrap(s, "you", inst.uid)) {
        actions.push({ label: "Set", run: () => (commit(E.setSpellTrap(s, "you", inst.uid)), setSel(null)) });
      }
    }
    if (sel.kind === "mon" && sel.side === "you") {
      if (E.canAttack(s, "you", sel.zone)) {
        if (E.canAttackDirectly(s, "you")) {
          actions.push({ label: "Attack directly", primary: true, run: () => (commit(E.declareAttack(s, "you", sel.zone, null)), setSel(null)) });
        } else {
          actions.push({ label: "Attack…", primary: true, run: () => setMode({ type: "attack", zone: sel.zone }) });
        }
      }
      if (E.canChangePosition(s, "you", sel.zone)) {
        actions.push({
          label: !inst.faceUp ? "Flip Summon" : inst.pos === "atk" ? "To Defense" : "To Attack",
          run: () => commit(E.changePosition(s, "you", sel.zone)),
        });
      }
    }
    if (sel.kind === "st" && sel.side === "you" && c.kind === "spell" && E.canActivateSpell(s, "you", { from: "zone", zone: sel.zone })) {
      actions.push({ label: "Activate", primary: true, run: () => activate({ from: "zone", zone: sel.zone }, c) });
    }
  }

  function activate(ref, c) {
    const need = E.spellTarget(c);
    if (need) setMode({ type: "spellTarget", ref, need });
    else {
      commit(E.activateSpell(s, "you", ref));
      setSel(null);
    }
  }

  function clickMonster(side, zone) {
    const m = s.players[side].monsters[zone];
    if (mode?.type === "tribute" && side === "you" && m) {
      const chosen = mode.chosen.includes(zone) ? mode.chosen.filter((z) => z !== zone) : [...mode.chosen, zone];
      if (chosen.length >= mode.need) {
        commit(E.normalSummon(s, "you", mode.uid, { set: mode.set, tributes: chosen }));
        setMode(null);
        setSel(null);
      } else setMode({ ...mode, chosen });
      return;
    }
    if (mode?.type === "spellTarget" && m) {
      const ok = (mode.need === "oppMonster" && side === "bug") || (mode.need === "ownFaceUp" && side === "you" && m.faceUp);
      if (ok) {
        commit(E.activateSpell(s, "you", mode.ref, zone));
        setMode(null);
        setSel(null);
      }
      return;
    }
    if (mode?.type === "attack" && side === "bug" && m) {
      commit(E.declareAttack(s, "you", mode.zone, zone));
      setMode(null);
      setSel(null);
      return;
    }
    if (m) setSel({ kind: "mon", side, zone });
  }

  const isTarget = (side, zone) => {
    const m = s.players[side].monsters[zone];
    if (!m || !mode) return false;
    if (mode.type === "tribute") return side === "you";
    if (mode.type === "attack") return side === "bug";
    if (mode.type === "spellTarget") return mode.need === "oppMonster" ? side === "bug" : side === "you" && m.faceUp;
    return false;
  };

  const modeHint =
    mode?.type === "tribute"
      ? `Choose ${mode.need - mode.chosen.length} monster${mode.need - mode.chosen.length > 1 ? "s" : ""} to tribute`
      : mode?.type === "attack"
        ? "Choose a monster to attack"
        : mode?.type === "spellTarget"
          ? mode.need === "oppMonster"
            ? "Choose a Bug monster"
            : "Choose one of your face-up monsters"
          : null;

  const events = s.events || [];
  const hoverHandlers = (ref) => (compact ? {} : { onHover: () => setHover(ref) });

  const isSel = (ref) =>
    !!sel && sel.kind === ref.kind && sel.side === ref.side && (ref.kind === "hand" ? sel.uid === ref.uid : sel.zone === ref.zone);
  /** Action bar for a card, if it's the selected one. */
  const barFor = (ref, below = false) =>
    isSel(ref) && !mode && (actions.length || compact) ? (
      <ActionBar key="bar" actions={actions} below={below} onInfo={compact ? () => setInfo(true) : null} />
    ) : null;

  const monsterRow = (side) => (
    <div className={`bh-row bh-row--mon bh-row--${side}`}>
      {s.players[side].monsters.map((m, zone) => (
        <div key={zone} className="bh-zone">
          <AnimatePresence>
            {m && (
              <MonsterInZone
                key={m.uid}
                m={m}
                side={side}
                lunge={lunge === m.uid}
                targetable={isTarget(side, zone)}
                selected={sel?.kind === "mon" && sel.side === side && sel.zone === zone}
                onClick={() => clickMonster(side, zone)}
                {...hoverHandlers({ kind: "mon", side, zone })}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>{m && barFor({ kind: "mon", side, zone }, side === "bug")}</AnimatePresence>
        </div>
      ))}
    </div>
  );

  const spellRow = (side) => (
    <div className={`bh-row bh-row--st bh-row--${side}`}>
      {s.players[side].spells.map((x, zone) => (
        <div key={zone} className="bh-zone bh-zone--st">
          <AnimatePresence>
            {x && (
              <SpellInZone
                key={x.uid}
                x={x}
                side={side}
                selected={sel?.kind === "st" && sel.side === side && sel.zone === zone}
                onClick={() => setSel({ kind: "st", side, zone })}
                {...hoverHandlers({ kind: "st", side, zone })}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>{x && barFor({ kind: "st", side, zone }, side === "bug")}</AnimatePresence>
        </div>
      ))}
    </div>
  );

  /* phase controls (vertical column on desktop, strip on phones) */
  const phaseControls = (
    <div className="bh-phases__list" role="group" aria-label="Turn phases">
      {PHASES.map(([id, label]) => {
        const on = s.phase === id;
        let run = null;
        if (myTurn && !s.prompt && !busy) {
          if (id === "battle" && E.canEnterBattle(s, "you")) run = () => commit(E.enterBattle(s));
          if (id === "main2" && s.phase === "battle" && !s.pendingAttack) run = () => commit(E.toMain2(s));
          if (id === "end") run = () => (commit(E.endTurn(s)), setSel(null));
        }
        return (
          <button
            key={id}
            type="button"
            className={`bh-phase-btn ${on ? "is-on" : ""} ${run ? "is-ready" : ""} ${on && s.current === "bug" ? "is-bug" : ""}`}
            disabled={!run}
            onClick={run || undefined}
            title={id === "battle" && s.turn === 1 ? "No attacks on the first turn" : undefined}
          >
            {id === "battle" && <GiCrossedSwords aria-hidden="true" />}
            {label}
          </button>
        );
      })}
    </div>
  );

  /* ───────────── render ───────────── */

  return (
    <motion.div
      className={`bh ${compact ? "bh--compact" : ""} ${playing ? "" : "bh--menu"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Bug Hunt card game"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {!playing ? (
        <LevelSelect unlocked={unlocked} onPick={start} onRules={() => setRules(true)} onGuide={() => setGuide(true)} onClose={onClose} />
      ) : (
        <>
          {/* ── side panel (desktop) ── */}
          {!compact && (
            <aside className="bh-side" onMouseLeave={() => setHover(null)}>
              <PlayerBox side="bug" pl={bug} name={level.boss} events={events} active={s.current === "bug"} />
              <Inspector shown={shown} actions={[]} />
              <ol className="bh-log" aria-label="Duel log">
                {s.log.slice(0, 5).map((l) => (
                  <li key={l.id} className={`is-${l.tone}`}>
                    {l.text}
                  </li>
                ))}
              </ol>
              <PlayerBox side="you" pl={me} name="Developer (you)" events={events} active={s.current === "you"} />
            </aside>
          )}

          {/* ── board ── */}
          <main className="bh-board" onMouseLeave={() => setHover(null)}>
            {compact && (
              <div className="bh-compact-top">
                <PlayerBox side="bug" pl={bug} name={level.boss} events={events} active={s.current === "bug"} />
              </div>
            )}

            <div className="bh-hand bh-hand--bug" aria-label={`The Bug holds ${bug.hand.length} cards`}>
              {bug.hand.map((x, i) => (
                <motion.div key={x.uid} className="bh-hand__back" style={{ "--i": i - (bug.hand.length - 1) / 2 }} initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}>
                  <CardBack />
                </motion.div>
              ))}
            </div>
            <div className="bh-side-row">
              {spellRow("bug")}
              <Pile label="Deck" count={bug.deck.length} back />
            </div>
            <div className="bh-side-row">
              {monsterRow("bug")}
              <Pile
                label="Grave"
                count={bug.gy.length}
                top={bug.gy[bug.gy.length - 1]}
                onClick={bug.gy.length ? () => setGy("bug") : null}
                onHover={compact ? null : (inst) => setHover({ kind: "inst", inst })}
              />
            </div>

            <div className="bh-midline" aria-hidden="true" />

            <div className="bh-side-row">
              {monsterRow("you")}
              <Pile
                label="Grave"
                count={me.gy.length}
                top={me.gy[me.gy.length - 1]}
                onClick={me.gy.length ? () => setGy("you") : null}
                onHover={compact ? null : (inst) => setHover({ kind: "inst", inst })}
              />
            </div>
            <div className="bh-side-row">
              {spellRow("you")}
              <Pile label="Deck" count={me.deck.length} back />
            </div>

            {compact && (
              <div className="bh-compact-bottom">
                <PlayerBox side="you" pl={me} name="You" events={events} active={s.current === "you"} />
                {phaseControls}
              </div>
            )}

            <div className={`bh-hand bh-hand--you ${s.prompt?.type === "discard" ? "is-discarding" : ""}`} aria-label="Your hand">
              <AnimatePresence>
                {me.hand.map((x, i) => {
                  const ref = { kind: "hand", side: "you", uid: x.uid };
                  const picked = isSel(ref);
                  return (
                    <motion.div
                      key={x.uid}
                      className={`bh-hand__slot ${picked ? "is-picked" : ""}`}
                      initial={{ opacity: 0, y: 80, scale: 0.8 }}
                      animate={{ opacity: 1, y: picked ? -22 : 0, scale: 1 }}
                      exit={{ opacity: 0, y: -60, scale: 0.8, transition: { duration: 0.25 } }}
                    >
                      <motion.button
                        type="button"
                        className={`bh-hand__card ${picked ? "is-selected" : ""}`}
                        style={{ "--i": i - (me.hand.length - 1) / 2 }}
                        onClick={() => (s.prompt?.type === "discard" ? setS(E.discard(s, x.uid)) : setSel(picked ? null : ref))}
                        onMouseEnter={compact ? undefined : () => setHover(ref)}
                        aria-label={E.def(x).name}
                        whileHover={picked ? undefined : { y: -16 }}
                      >
                        <GameCard card={toGameCard(E.def(x))} />
                      </motion.button>
                      <AnimatePresence>{barFor(ref)}</AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {modeHint && (
                <motion.div className="bh-hint" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {modeHint}
                  <button type="button" className="bh-btn" onClick={() => setMode(null)}>
                    Cancel
                  </button>
                </motion.div>
              )}
              {s.prompt?.type === "discard" && (
                <motion.div className="bh-hint" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  Hand limit: discard {s.prompt.count} card{s.prompt.count > 1 ? "s" : ""} — click cards in your hand.
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {s.banner && (
                <motion.div
                  key={s.banner.id}
                  className={`bh-banner bh-banner--${s.banner.tone}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.05, 1, 1] }}
                  transition={{ duration: 2.4, times: [0, 0.12, 0.8, 1] }}
                >
                  {s.banner.text}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {s.current === "bug" && !s.winner && s.log[0] && (
                <motion.div
                  key={s.log[0].id}
                  className={`bh-caption is-${s.log[0].tone}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  <FaBug aria-hidden="true" /> {s.log[0].text}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* ── phase column (desktop) ── */}
          {!compact ? (
            <nav className="bh-phases" aria-label="Duel controls">
              <div className="bh-phases__top">
                <button type="button" className="bh-icon" onClick={() => setRules(true)} aria-label="Rules" title="Rules">
                  <FaCircleQuestion />
                </button>
                <button type="button" className="bh-icon" onClick={() => setGuide(true)} aria-label="Card Guide" title="Card Guide">
                  <FaBookOpen />
                </button>
                <button type="button" className="bh-icon" onClick={() => setScreen("levels")} aria-label="Level select" title="Level select">
                  <FaXmark />
                </button>
              </div>
              <div className="bh-phases__level">
                <small>Level {level.id}</small>
                <strong>{level.name}</strong>
              </div>
              <div className="bh-phases__turn">
                <small>Turn</small>
                <motion.strong key={s.turn} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
                  {s.turn}
                </motion.strong>
                <span className={`bh-phases__who ${s.current === "bug" ? "is-bug" : ""}`}>{s.current === "you" ? "Your turn" : "Bug's turn"}</span>
              </div>
              {phaseControls}
              {!myTurn && !s.winner && <span className="bh-phases__thinking">The Bug is thinking…</span>}
            </nav>
          ) : (
            <header className="bh-top">
              <span className="bh-top__title">
                <FaBug aria-hidden="true" /> Lv {level.id} · Turn {s.turn}
              </span>
              <div className="bh-top__actions">
                <button type="button" className="bh-icon" onClick={() => setRules(true)} aria-label="Rules">
                  <FaCircleQuestion />
                </button>
                <button type="button" className="bh-icon" onClick={() => setGuide(true)} aria-label="Card Guide">
                  <FaBookOpen />
                </button>
                <button type="button" className="bh-icon" onClick={() => setScreen("levels")} aria-label="Level select">
                  <FaXmark />
                </button>
              </div>
            </header>
          )}

          {/* phones: inspector as a sheet */}
          <AnimatePresence>
            {compact && info && selected && (
              <motion.div className="bh-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
                <button type="button" className="bh-icon bh-sheet__close" onClick={() => setInfo(false)} aria-label="Close">
                  <FaXmark />
                </button>
                <Inspector shown={selected} actions={[]} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* battle: announce the attack and show what will happen */}
          <AnimatePresence>
            {s.prompt?.type === "attack" && !busy && (
              <motion.div className="bh-overlay bh-overlay--battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BattlePanel
                  s={s}
                  onAttack={() => commit(E.proceedAttack(s, { chooseTrap }))}
                  onCancel={() => setS(E.cancelAttack(s))}
                  onContinue={(trapZone) => commit(E.proceedAttack(s, { yourTrap: trapZone }))}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* graveyard viewer */}
          <AnimatePresence>
            {gy && (
              <motion.div className="bh-overlay" onClick={() => setGy(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="bh-panel bh-panel--wide" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <h2>{gy === "you" ? "Your graveyard" : "The Bug's graveyard"}</h2>
                  <div className="bh-gy">
                    {s.players[gy].gy.map((x) => (
                      <div key={x.uid} className="bh-gy__card">
                        <GameCard card={toGameCard(E.def(x))} />
                      </div>
                    ))}
                  </div>
                  <button type="button" className="bh-btn" onClick={() => setGy(null)}>
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* game over */}
          <AnimatePresence>
            {s.winner && !rules && (
              <motion.div className="bh-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GameOver s={s} onAgain={() => start(s.level)} onNext={() => start(s.level + 1)} onLevels={() => setScreen("levels")} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {guide && (
          <motion.div className="bh-overlay" onClick={() => setGuide(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BugGuide onClose={() => setGuide(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rules && (
          <motion.div className="bh-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Rules onClose={() => setRules(false)} label={playing ? "Back to the duel" : "Got it"} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
