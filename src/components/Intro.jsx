import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import Typewriter from "./Typewriter";
import { profile, img } from "../data/profile";
import "./Intro.css";

/** Visual-novel style welcome. First click finishes the line, second click enters the table. */
export default function Intro({ onClose }) {
  const [finished, setFinished] = useState(false);
  const [instant, setInstant] = useState(false);

  const advance = useCallback(() => {
    if (finished) onClose();
    else setInstant(true);
  }, [finished, onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, onClose]);

  return (
    <motion.div
      className="intro"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      onClick={advance}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.25 } }}
    >
      <motion.div
        className="intro__halo"
        aria-hidden="true"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.img
        className="intro__char"
        src={img("character.webp")}
        alt=""
        initial={{ y: "35%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "25%", opacity: 0, transition: { duration: 0.45 } }}
        transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.2 }}
      />

      <motion.div
        className="intro__box"
        initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, transition: { duration: 0.35 } }}
        transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.45 }}
      >
        <div className="intro__nameplate">{profile.firstName}</div>
        <Typewriter
          text={profile.intro}
          speed={26}
          instant={instant}
          onDone={() => setFinished(true)}
          className="intro__text"
        />
        <div className="intro__footer">
          <button
            type="button"
            className="intro__skip"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Skip
          </button>
          <span className={`intro__next ${finished ? "is-ready" : ""}`}>
            {finished ? "Click to enter the table" : "Click to continue"} <span aria-hidden="true">▼</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
