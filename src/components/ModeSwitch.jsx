import { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { FaBriefcase, FaGamepad } from "react-icons/fa6";
import "./ModeSwitch.css";

const options = [
  { id: "pro", label: "Portfolio", Icon: FaBriefcase },
  { id: "game", label: "Card game", Icon: FaGamepad },
];

/** Segmented control that switches between the professional page and the card game. */
export default function ModeSwitch({ mode, onChange, compact = false, className = "" }) {
  const uid = useId();
  // Slide the thumb first, then switch views once it has landed.
  const [selected, setSelected] = useState(mode);
  useEffect(() => setSelected(mode), [mode]);
  const pick = (id) => {
    if (id === selected) return;
    setSelected(id);
    setTimeout(() => onChange(id), 260);
  };
  return (
    <div className={`mode-switch ${compact ? "is-compact" : ""} ${className}`} role="radiogroup" aria-label="Choose a view">
      {options.map(({ id, label, Icon }) => {
        const on = selected === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={label}
            title={label}
            className={`mode-switch__opt ${on ? "is-on" : ""}`}
            onClick={() => pick(id)}
          >
            {on && (
              <motion.span
                layoutId={`mode-thumb-${uid}`}
                className="mode-switch__thumb"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon aria-hidden="true" />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
