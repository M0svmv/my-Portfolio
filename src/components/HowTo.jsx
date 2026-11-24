import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FaHandPointer,
  FaLayerGroup,
  FaBookOpen,
  FaArrowUpRightFromSquare,
  FaArrowLeft,
  FaKeyboard,
  FaXmark,
} from "react-icons/fa6";
import { GiCrossedSwords } from "react-icons/gi";
import "./HowTo.css";

const steps = {
  desktop: [
    [FaHandPointer, "Play a card", "Click one of the cards in your hand at the bottom of the table (or press 1–5)."],
    [FaLayerGroup, "Watch the deck land", "Its cards are dealt onto the field — skills, projects, contacts or my CV."],
    [FaBookOpen, "Inspect any card", "Click a card on the field to read it in the panel on the left."],
    [FaArrowUpRightFromSquare, "Open it", "Use the gold button to visit a demo, the source code, my CV or a profile."],
  ],
  mobile: [
    [FaHandPointer, "Swipe the stack", "Swipe left or right to flip through the cards in your hand."],
    [FaLayerGroup, "Play a card", "Tap the top card (or “Play this card”) to open its deck."],
    [FaArrowUpRightFromSquare, "Read & open", "The panel below explains each card. Tap the card or the gold button to open its link."],
    [FaArrowLeft, "Go back", "Tap “Hand” or use your phone's back gesture to return to your hand."],
  ],
};

export function HelpButton({ onClick, className = "" }) {
  return (
    <button type="button" className={`help-btn ${className}`} onClick={onClick} aria-label="How to use this portfolio" title="How to play">
      ?
    </button>
  );
}

export default function HowTo({ open, mode, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="howto-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="howto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="howto-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, rotateX: 20, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }}
            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
          >
            <button type="button" className="howto__close" onClick={onClose} aria-label="Close">
              <FaXmark />
            </button>
            <h2 id="howto-title" className="howto__title">How to play</h2>
            <ol className="howto__steps">
              {steps[mode].map(([Icon, title, text], i) => (
                <motion.li
                  key={title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.1 } }}
                >
                  <span className="howto__icon">
                    <Icon aria-hidden="true" />
                    <b>{i + 1}</b>
                  </span>
                  <span>
                    <strong>{title}</strong>
                    {text}
                  </span>
                </motion.li>
              ))}
            </ol>
            <p className="howto__tip">
              <GiCrossedSwords aria-hidden="true" /> Bonus: play the <b>Bug Hunt</b> card for a full card duel against the bugs.
            </p>
            {mode === "desktop" && (
              <p className="howto__tip">
                <FaKeyboard aria-hidden="true" /> Keys 1–5 play your hand · Esc closes dialogs
              </p>
            )}
            <button type="button" className="btn-gold howto__go" onClick={onClose}>
              Let's play
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
