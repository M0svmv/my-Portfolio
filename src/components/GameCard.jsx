import { useState } from "react";
import { motion } from "motion/react";
import "./GameCard.css";

/** Sun disk: the round emblem in the corner of each card's name bar. */
function SunDisk(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

function CardArt({ art, title }) {
  const [broken, setBroken] = useState(false);
  if (broken && art?.fallback) art = art.fallback;
  if (art?.Icon) {
    const { Icon, color } = art;
    return (
      <div className="gcard__icon" style={{ "--brand": color }}>
        <Icon aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={art?.src}
      alt={title}
      className={art?.pixel ? "is-pixel" : art?.contain ? "is-contain" : undefined}
      onError={() => setBroken(true)}
      loading="lazy"
      decoding="async"
      draggable="false"
    />
  );
}

/** Front face of a card. Sizes itself from its own width (container query units). */
export function GameCard({ card }) {
  return (
    <div className={`gcard gcard--${card.variant || "obsidian"}`}>
      <div className="gcard__frame">
        <div className="gcard__body">
          <div className="gcard__head">
            <span className="gcard__title">{card.title}</span>
            <span className="gcard__sigil">
              <SunDisk />
            </span>
          </div>
          <div className="gcard__serial">{card.serial}</div>
          <div className="gcard__art">
            <CardArt art={card.art} title={card.title} />
          </div>
          <div className="gcard__text">
            <span className="gcard__type">[ {card.type.replace(" · ", " / ")} ]</span>
            <span className="gcard__desc">{card.text}</span>
            <span className="gcard__foot">{card.stat || " "}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Back face — a fiery vortex swirling into a dark centre. */
export function CardBack() {
  return (
    <div className="cback">
      <div className="cback__frame" />
    </div>
  );
}

/** A two-sided card that can flip. Animate `rotateY` to 180 to show the back. */
export function FlipCard({ card, className = "", ...motionProps }) {
  return (
    <motion.div className={`flip ${className}`} {...motionProps}>
      <div className="flip__face flip__front">{card ? <GameCard card={card} /> : <CardBack />}</div>
      <div className="flip__face flip__back">
        <CardBack />
      </div>
    </motion.div>
  );
}
