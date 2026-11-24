import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FlipCard, CardBack } from "./GameCard";
import "./Field.css";

const SLOTS = 20; // one page of the field

/** Where a deck of `n` cards lands: small decks sit centred on your front row. */
function slotFor(order, n) {
  if (n <= 5) return 10 + Math.floor((5 - n) / 2) + order;
  if (n <= 10) return 10 + order;
  return Math.max(0, 20 - Math.ceil(n / 5) * 5) + order;
}

/**
 * Card motion. `dir` is 0 when a new deck is played (cards fly in from the hand)
 * and ±1 when turning a page (cards flip over sideways like a book).
 */
const cardVariants = {
  initial: ({ dir }) =>
    dir === 0
      ? { opacity: 0, rotateY: 180, x: 0, y: 180, scale: 0.55, rotateZ: -10 }
      : { opacity: 0, rotateY: dir > 0 ? 180 : -180, x: dir > 0 ? 120 : -120, y: 0, scale: 0.7, rotateZ: 0 },
  animate: ({ dir, order }) => ({
    opacity: 1,
    rotateY: 0,
    x: 0,
    y: 0,
    scale: 1,
    rotateZ: 0,
    transition: { type: "spring", stiffness: 150, damping: 19, delay: (dir === 0 ? 0.12 : 0.05) + order * (dir === 0 ? 0.045 : 0.03) },
  }),
  exit: ({ dir }) =>
    dir === 0
      ? { opacity: 0, rotateY: -120, x: 90, y: -50, scale: 0.5, rotateZ: 14, transition: { duration: 0.3, ease: "easeIn" } }
      : { opacity: 0, rotateY: dir > 0 ? -180 : 180, x: dir > 0 ? -120 : 120, scale: 0.7, transition: { duration: 0.28, ease: "easeIn" } },
};

const placeholder = (order) => ({
  initial: { opacity: 0, rotateY: 180, y: 180, scale: 0.55 },
  animate: { opacity: 1, rotateY: 0, y: 0, scale: 1, transition: { type: "spring", stiffness: 160, damping: 20, delay: order * 0.04 } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
});

function FieldCard({ card, order, dir, selected, onSelect }) {
  if (!card.id) {
    // still loading — face-down card
    return (
      <motion.div className="field-card is-placeholder" aria-hidden="true" {...placeholder(order)}>
        <FlipCard card={null} className="field-card__flip" />
      </motion.div>
    );
  }
  return (
    <motion.button
      type="button"
      className={`field-card ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(card)}
      aria-label={`Inspect ${card.title}`}
      aria-pressed={selected}
      variants={cardVariants}
      custom={{ dir, order }}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <FlipCard card={card} className="field-card__flip" />
    </motion.button>
  );
}

/** Grid position for a cell: rows 1–2 are the opponent, row 3 is the centre line, rows 4–5 are yours. */
const at = (row, col) => ({ gridRow: row, gridColumn: col });

function SideStack({ label, count = 3, opp = false, style }) {
  return (
    <div className={`side-stack ${opp ? "is-opp" : ""}`} style={style} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="side-stack__card" style={{ "--i": i }}>
          <CardBack />
        </div>
      ))}
      <span className="zone-tag">{label}</span>
    </div>
  );
}

function EmptyZone({ label, opp = false, style }) {
  return (
    <div className={`zone zone--side ${opp ? "" : "zone--mine"}`} style={style} aria-hidden="true">
      <span className="zone-watermark">{label}</span>
    </div>
  );
}

function Hint() {
  return (
    <motion.div
      className="field-hint"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 1.1 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    >
      <span>Play a card from your hand</span>
      <span className="field-hint__arrow" aria-hidden="true">▼</span>
    </motion.div>
  );
}

/** "‹ 1 / 3 ›" control sitting on the centre line. */
function Pager({ page, pages, onTurn, nudge }) {
  return (
    <motion.div
      className="page-pill"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <button type="button" className="page-btn" onClick={() => onTurn(-1)} disabled={page === 0} aria-label="Previous page">
        <FaChevronLeft aria-hidden="true" />
      </button>
      <span aria-live="polite">
        <span className="sr-only">Page </span>
        {page + 1} / {pages}
      </span>
      <span className="page-pill__dots" aria-hidden="true">
        {Array.from({ length: pages }, (_, i) => (
          <i key={i} className={i === page ? "is-on" : ""} />
        ))}
      </span>
      <button
        type="button"
        className={`page-btn ${nudge ? "is-nudging" : ""}`}
        onClick={() => onTurn(1)}
        disabled={page === pages - 1}
        aria-label="Next page"
      >
        <FaChevronRight aria-hidden="true" />
      </button>
    </motion.div>
  );
}

/** An original winged sun disk, drawn behind the centre line of the field. */
function WingedSun() {
  const feathers = [0, 1, 2, 3, 4, 5, 6];
  const wing = (
    <g>
      <path d="M104 27 C78 12 38 8 4 18 C30 20 62 25 100 36 Z" fill="currentColor" opacity="0.35" />
      <path d="M104 27 C78 12 38 8 4 18" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M100 33 C74 24 44 22 14 26" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {feathers.map((i) => (
        <path key={i} d={`M${92 - i * 12} ${27 - i * 1.3} l-3 ${8 + i * 0.6}`} stroke="currentColor" strokeWidth="1.1" />
      ))}
    </g>
  );
  return (
    <svg className="winged-sun" viewBox="0 0 240 60" aria-hidden="true">
      {wing}
      <g transform="translate(240 0) scale(-1 1)">{wing}</g>
      <g className="winged-sun__disk">
        <circle cx="120" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="120" cy="30" r="10" fill="currentColor" opacity="0.55" />
      </g>
    </svg>
  );
}

/** The playing field. `cards` may contain `{}` placeholders (shown face-down while loading). */
export default function Field({ deckKey, cards, selectedId, onSelect, summon, status }) {
  const burst = summon > 0 && (
    <motion.div
      key={summon}
      className="summon-burst"
      aria-hidden="true"
      initial={{ scale: 0.1, opacity: 0.9 }}
      animate={{ scale: 2.4, opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    />
  );

  const message =
    deckKey !== "projects" ? null :
    status === "error" ? "GitHub didn't answer — try again in a minute, or open my GitHub from the contact cards." :
    status === "ready" && cards.length === 0 ? "No public projects yet." : null;

  // Paging: a deck bigger than the field is split into pages of 20.
  const [pager, setPager] = useState({ deck: null, page: 0, dir: 0, turned: false });
  const pages = Math.max(1, Math.ceil(cards.length / SLOTS));
  const fresh = pager.deck !== deckKey;
  const page = fresh ? 0 : Math.min(pager.page, pages - 1);
  const dir = fresh ? 0 : pager.dir;
  const turn = (step) => {
    const next = Math.min(pages - 1, Math.max(0, page + step));
    if (next !== page) setPager({ deck: deckKey, page: next, dir: step, turned: true });
  };

  // ← / → turn pages
  useEffect(() => {
    if (pages < 2) return;
    const onKey = (e) => {
      if (document.querySelector("[aria-modal='true']")) return;
      if (e.key === "ArrowRight") turn(1);
      else if (e.key === "ArrowLeft") turn(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pageCards = cards.slice(page * SLOTS, page * SLOTS + SLOTS);
  const bySlot = new Array(SLOTS).fill(null);
  pageCards.forEach((card, i) => {
    bySlot[slotFor(i, pageCards.length)] = { card, order: i };
  });
  const paged = pages > 1;

  return (
    <div className="field">
      <div className="field__grid">
        <WingedSun />

        {/* opponent: deck & grave on the left, extra & field on the right (mirrored) */}
        <SideStack label="Deck" count={4} opp style={at(1, 1)} />
        <EmptyZone label="Grave" opp style={at(2, 1)} />
        <SideStack label="Extra" count={2} opp style={at(1, 9)} />
        <EmptyZone label="Field" opp style={at(2, 9)} />

        {/* you: field & extra on the left, grave & deck on the right */}
        <EmptyZone label="Field" style={at(4, 1)} />
        <SideStack label="Extra" count={2} style={at(5, 1)} />
        <EmptyZone label="Grave" style={at(4, 9)} />
        <SideStack label="Deck" count={4} style={at(5, 9)} />

        {bySlot.map((entry, slot) => {
          const row = Math.floor(slot / 5);
          return (
            <div
              key={slot}
              className={`zone ${slot >= 10 ? "zone--mine" : ""}`}
              style={at(row < 2 ? row + 1 : row + 2, (slot % 5) + 3)}
            >
              <AnimatePresence mode="wait" custom={{ dir, order: 0 }}>
                {entry && (
                  <FieldCard
                    key={entry.card.id ? `${deckKey}-${entry.card.id}` : `${deckKey}-ph-${slot}`}
                    card={entry.card}
                    order={entry.order}
                    dir={dir}
                    selected={entry.card.id === selectedId}
                    onSelect={onSelect}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className="field__divider" aria-hidden="true" />
        <AnimatePresence>
          {paged && <Pager page={page} pages={pages} onTurn={turn} nudge={!pager.turned} />}
        </AnimatePresence>
        {burst}
        <AnimatePresence>{!deckKey && <Hint />}</AnimatePresence>
        {message && <p className="field-message">{message}</p>}
      </div>
    </div>
  );
}
