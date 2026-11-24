import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { FaArrowUpRightFromSquare, FaCode } from "react-icons/fa6";
import { FlipCard } from "./GameCard";
import Typewriter from "./Typewriter";
import SocialLinks from "./SocialLinks";
import { HelpButton } from "./HowTo";
import { profile } from "../data/profile";
import "./Inspector.css";

/** Big card that tilts toward the pointer with a moving holographic sheen. */
function TiltCard({ card }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [11, -11]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-13, 13]), { stiffness: 180, damping: 18 });
  const sx = useTransform(px, (v) => `${v * 100}%`);
  const sy = useTransform(py, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sx} ${sy}, rgb(255 255 255 / 0.38), rgb(255 230 160 / 0.12) 30%, transparent 60%)`;

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      className="tilt"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <FlipCard
          key={card.id}
          card={card}
          initial={{ rotateY: -110, opacity: 0, scale: 0.92 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 160, damping: 18 } }}
          exit={{ rotateY: 110, opacity: 0, scale: 0.92, transition: { duration: 0.22, ease: "easeIn" } }}
        />
      </AnimatePresence>
      <motion.div className="tilt__sheen" style={{ backgroundImage: sheen }} aria-hidden="true" />
    </motion.div>
  );
}

function Actions({ card }) {
  if (!card.href) return null;
  const external = /^https?:/.test(card.href);
  return (
    <div className="actions">
      <a className="btn-gold" href={card.href} target={external ? "_blank" : undefined} rel="noopener noreferrer">
        {card.cta || "Open"} <FaArrowUpRightFromSquare aria-hidden="true" />
      </a>
      {card.source && (
        <a className="btn-ghost" href={card.source} target="_blank" rel="noopener noreferrer">
          <FaCode aria-hidden="true" /> Source
        </a>
      )}
    </div>
  );
}

function Details({ card }) {
  return (
    <div className="details">
      <div className="details__scroll">
        <h2 className="details__title">{card.title}</h2>
        <p className="details__type">{card.type}</p>
        <Typewriter key={card.id} text={card.desc || card.text} speed={14} className="details__desc" />
      </div>
      <Actions card={card} />
    </div>
  );
}

/** Desktop side panel. */
export function InspectorPanel({ card, onHelp }) {
  return (
    <aside className="panel" aria-label="Card details">
      <header className="panel__id">
        <h1 className="panel__name">{profile.name}</h1>
        <p className="panel__role">{profile.role}</p>
      </header>
      <div className="panel__stage">
        <TiltCard card={card} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={card.id}
          className="panel__details"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
        >
          <Details card={card} />
        </motion.div>
      </AnimatePresence>
      <div className="panel__foot">
        <SocialLinks />
        <HelpButton onClick={onHelp} className="panel__help" />
      </div>
    </aside>
  );
}
