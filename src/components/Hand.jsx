import { motion } from "motion/react";
import { GameCard, CardBack } from "./GameCard";
import "./Hand.css";

/** Fan position for card `i` of `n`. */
function fan(i, n, spread) {
  const mid = (n - 1) / 2;
  const off = i - mid;
  return { x: `${off * spread}%`, rotate: off * 6, y: `${Math.abs(off) ** 2 * 3}%` };
}

export function PlayerHand({ cards, activeId, onPlay, spread = 78 }) {
  return (
    <div className="hand" role="toolbar" aria-label="Your hand — play a card">
      {cards.map((card, i) => {
        const pos = fan(i, cards.length, spread);
        const active = card.id === activeId;
        return (
          <motion.button
            key={card.id}
            type="button"
            className={`hand__card ${active ? "is-active" : ""}`}
            aria-pressed={active}
            aria-label={`Play ${card.title}`}
            title={`${card.title} (${i + 1})`}
            onClick={() => onPlay(card)}
            initial={{ x: "420%", y: "-160%", rotate: 40, opacity: 0, scale: 0.6 }}
            animate={{ ...pos, y: active ? "-16%" : pos.y, opacity: 1, scale: 1, zIndex: active ? 6 : i + 1 }}
            whileHover={{ y: "-30%", rotate: 0, scale: 1.12, zIndex: 10, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            whileFocus={{ y: "-30%", rotate: 0, scale: 1.12, zIndex: 10 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 140, damping: 17, delay: 0.25 + i * 0.13 }}
          >
            <GameCard card={card} />
            {active && <span className="hand__glow" aria-hidden="true" />}
          </motion.button>
        );
      })}
    </div>
  );
}

export function OpponentHand({ count = 5 }) {
  return (
    <div className="opp-hand" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const mid = (count - 1) / 2;
        const off = i - mid;
        return (
          <motion.div
            key={i}
            className="opp-hand__card"
            initial={{ x: "-500%", y: "-120%", rotate: -30, opacity: 0 }}
            animate={{ x: `${off * 62}%`, y: `${-(off ** 2) * 3}%`, rotate: 180 - off * 5, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.1 + i * 0.08 }}
          >
            <CardBack />
          </motion.div>
        );
      })}
    </div>
  );
}
